"""
AWS Lambda Function for Athena Query Execution

This Lambda function accepts SQL queries from API Gateway,
executes them in Amazon Athena, polls for results,
and returns the query results as JSON.

Environment Variables:
    DATABASE_NAME: Name of the Glue database
    S3_BUCKET: S3 bucket for query results
    RESULTS_PATH: S3 path for Athena query results (s3://bucket/path/)
    MAX_WAIT_TIME: Maximum time to wait for query completion (default: 60 seconds)

Expected Event Payload:
{
    "query": "SELECT * FROM table_name LIMIT 10",
    "maxWaitTime": 60,  // Optional, in seconds (1-900)
    "outputLocation": "s3://bucket/custom-path/"  // Optional
}

Returns:
{
    "statusCode": 200,
    "body": {
        "message": "Query executed successfully",
        "queryExecutionId": "abc123",
        "state": "SUCCEEDED",
        "rows": [...],
        "columnMetadata": [...],
        "rowCount": 5,
        "dataScannedInBytes": 12345,
        "executionTimeInMillis": 500
    }
}
"""

import os
import json
import time
import logging
from typing import Any, Optional
from datetime import datetime

import boto3
from botocore.exceptions import ClientError, BotoCoreError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize AWS clients
athena_client = boto3.client('athena')
s3_client = boto3.client('s3')


# ============================================
# Environment Variables
# ============================================

def get_env_var(name: str, required: bool = True) -> Optional[str]:
    """Get environment variable with optional requirement check."""
    value = os.environ.get(name)
    if required and not value:
        raise EnvironmentError(f"Required environment variable '{name}' is not set")
    return value


DATABASE_NAME = get_env_var('DATABASE_NAME')
S3_BUCKET = get_env_var('S3_BUCKET')
RESULTS_PATH = get_env_var('RESULTS_PATH', required=False) or f's3://{S3_BUCKET}/athena-results/'
MAX_WAIT_TIME = int(get_env_var('MAX_WAIT_TIME', required=False) or 60)


# ============================================
# Helper Functions
# ============================================

def format_response(status_code: int, body: dict) -> dict:
    """
    Format API Gateway Lambda proxy response.
    
    Args:
        status_code: HTTP status code
        body: Response body dictionary
    
    Returns:
        API Gateway compatible response dictionary
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        'body': json.dumps(body),
        'isBase64Encoded': False,
    }


def validate_query(query: str) -> tuple[bool, str]:
    """
    Validate the SQL query for basic security and format.
    
    Args:
        query: SQL query string
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not query or not isinstance(query, str):
        return False, "Query must be a non-empty string"
    
    query = query.strip()
    
    if len(query) > 262144:  # Athena's max query size
        return False, f"Query size ({len(query)} bytes) exceeds maximum of 262144 bytes"
    
    # Check for dangerous SQL patterns
    dangerous_patterns = [
        ';.*--',  # SQL comment injection
        'DROP\\s+DATABASE',
        'DROP\\s+TABLE.*CASCADE',
        'TRUNCATE\\s+',
        'GRANT\\s+',
        'REVOKE\\s+',
        'ALTER\\s+SYSTEM',
        'CREATE\\s+ROLE',
        'EXECUTE\\s+AS',
    ]
    
    import re
    for pattern in dangerous_patterns:
        if re.search(pattern, query, re.IGNORECASE):
            return False, f"Query contains disallowed pattern: {pattern}"
    
    return True, ""


def sanitize_results(results: list, columns: list) -> list:
    """
    Sanitize query results to ensure JSON serializability.
    
    Args:
        results: List of result rows
        columns: List of column metadata
    
    Returns:
        Sanitized list of dictionaries
    """
    sanitized = []
    
    for row in results:
        sanitized_row = {}
        for col in columns:
            col_name = col.get('Name', f'col_{columns.index(col)}')
            value = row.get(col_name)
            
            # Handle None values
            if value is None:
                sanitized_row[col_name] = None
            # Handle different data types
            elif isinstance(value, bool):
                sanitized_row[col_name] = value
            elif isinstance(value, (int, float)):
                sanitized_row[col_name] = value
            elif isinstance(value, str):
                sanitized_row[col_name] = value.strip() if value else ""
            elif isinstance(value, datetime):
                sanitized_row[col_name] = value.isoformat()
            else:
                sanitized_row[col_name] = str(value)
        
        sanitized.append(sanitized_row)
    
    return sanitized


# ============================================
# Athena Operations
# ============================================

def start_query_execution(
    query: str,
    database: str = DATABASE_NAME,
    output_location: str = RESULTS_PATH
) -> str:
    """
    Start a query execution in Athena.
    
    Args:
        query: SQL query to execute
        database: Glue database name
        output_location: S3 path for query results
    
    Returns:
        Query execution ID
    """
    try:
        response = athena_client.start_query_execution(
            QueryString=query,
            QueryExecutionContext={
                'Database': database
            },
            ResultConfiguration={
                'OutputLocation': output_location
            }
        )
        
        query_execution_id = response['QueryExecutionId']
        logger.info(f"Started query execution: {query_execution_id}")
        logger.info(f"Query: {query[:100]}...")
        
        return query_execution_id
        
    except ClientError as e:
        logger.error(f"Athena start query error: {e.response['Error']['Message']}")
        raise


def get_query_status(query_execution_id: str) -> dict:
    """
    Get the status of a query execution.
    
    Args:
        query_execution_id: The query execution ID
    
    Returns:
        Dictionary with status information
    """
    try:
        response = athena_client.get_query_execution(
            QueryExecutionId=query_execution_id
        )
        
        execution = response['QueryExecution']
        status = execution['Status']
        
        return {
            'state': status['State'],
            'state_change_reason': status.get('StateChangeReason'),
            'submission_date_time': str(status.get('SubmissionDateTime')),
            'completion_date_time': str(status.get('CompletionDateTime')),
            'statistics': execution.get('Statistics', {}),
            'query': execution.get('Query'),
        }
        
    except ClientError as e:
        logger.error(f"Error getting query status: {e.response['Error']['Message']}")
        raise


def wait_for_query_completion(
    query_execution_id: str,
    max_wait_time: int = MAX_WAIT_TIME
) -> dict:
    """
    Poll Athena until query completes or timeout.
    
    Args:
        query_execution_id: The query execution ID
        max_wait_time: Maximum time to wait in seconds
    
    Returns:
        Final status dictionary
    
    Raises:
        TimeoutError: If query doesn't complete within max_wait_time
    """
    start_time = time.time()
    poll_interval = 1
    attempt = 0
    
    logger.info(f"Waiting for query {query_execution_id} (max {max_wait_time}s)")
    
    while time.time() - start_time < max_wait_time:
        attempt += 1
        
        status = get_query_status(query_execution_id)
        state = status['state']
        
        logger.info(f"Query state (attempt {attempt}): {state}")
        
        # Terminal states
        if state == 'SUCCEEDED':
            logger.info(f"Query completed successfully: {query_execution_id}")
            return status
        
        if state == 'FAILED':
            reason = status.get('state_change_reason', 'Unknown error')
            logger.error(f"Query failed: {reason}")
            raise RuntimeError(f"Query execution failed: {reason}")
        
        if state == 'CANCELLED':
            logger.warning(f"Query was cancelled: {query_execution_id}")
            raise RuntimeError("Query was cancelled")
        
        # Exponential backoff for polling
        poll_interval = min(poll_interval * 1.5, 5)
        elapsed = int(time.time() - start_time)
        remaining = max_wait_time - elapsed
        
        if remaining < poll_interval:
            poll_interval = remaining
        
        time.sleep(poll_interval)
    
    # Timeout reached
    elapsed = int(time.time() - start_time)
    raise TimeoutError(
        f"Query did not complete within {max_wait_time} seconds "
        f"(elapsed: {elapsed}s, ID: {query_execution_id})"
    )


def get_query_results(
    query_execution_id: str,
    max_rows: int = 1000
) -> dict:
    """
    Retrieve query results from Athena.
    
    Args:
        query_execution_id: The query execution ID
        max_rows: Maximum number of rows to retrieve
    
    Returns:
        Dictionary with rows and column metadata
    """
    try:
        response = athena_client.get_query_results(
            QueryExecutionId=query_execution_id,
            MaxResults=max_rows
        )
        
        result_set = response.get('ResultSet', {})
        result_set_metadata = result_set.get('ResultSetMetadata', {})
        column_info = result_set_metadata.get('ColumnInfo', [])
        
        # Extract column metadata
        column_metadata = [
            {
                'name': col.get('Name', f'col_{i}'),
                'type': col.get('Type', 'unknown'),
                'case_sensitive': col.get('CaseSensitive', False),
                'nullable': col.get('Nullable', 'UNKNOWN'),
                'precision': col.get('Precision'),
                'scale': col.get('Scale'),
            }
            for i, col in enumerate(column_info)
        ]
        
        # Extract rows (skip header row)
        rows = result_set.get('Rows', [])
        data_rows = rows[1:] if len(rows) > 0 else []  # Skip header
        
        # Convert rows to dictionaries
        parsed_rows = []
        for row in data_rows:
            data = row.get('Data', [])
            row_dict = {}
            for i, col in enumerate(data):
                if i < len(column_metadata):
                    col_name = column_metadata[i]['name']
                    value = col.get('VarCharValue')
                    row_dict[col_name] = value
            parsed_rows.append(row_dict)
        
        logger.info(
            f"Retrieved {len(parsed_rows)} rows with {len(column_metadata)} columns"
        )
        
        return {
            'columnMetadata': column_metadata,
            'rows': parsed_rows,
            'rowCount': len(parsed_rows),
        }
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        logger.error(f"Error retrieving results ({error_code}): {str(e)}")
        raise


def execute_athena_query(
    query: str,
    database: Optional[str] = None,
    output_location: Optional[str] = None,
    max_wait_time: int = MAX_WAIT_TIME,
    max_rows: int = 1000
) -> dict:
    """
    Execute a SQL query in Athena and return results.
    
    Args:
        query: SQL query string
        database: Optional database override
        output_location: Optional S3 output path override
        max_wait_time: Maximum wait time in seconds
        max_rows: Maximum rows to return
    
    Returns:
        Dictionary with query results and metadata
    """
    # Validate and sanitize query
    is_valid, error_msg = validate_query(query)
    if not is_valid:
        raise ValueError(error_msg)
    
    # Use environment variables as defaults
    db = database or DATABASE_NAME
    output = output_location or RESULTS_PATH
    
    # Start query execution
    query_execution_id = start_query_execution(query, db, output)
    
    # Wait for completion
    status = wait_for_query_completion(query_execution_id, max_wait_time)
    
    # Get statistics
    statistics = status.get('statistics', {})
    
    # Only retrieve results if query succeeded
    if status['state'] == 'SUCCEEDED':
        results = get_query_results(query_execution_id, max_rows)
        rows = results['rows']
        column_metadata = results['columnMetadata']
    else:
        rows = []
        column_metadata = []
    
    return {
        'message': 'Query executed successfully',
        'queryExecutionId': query_execution_id,
        'state': status['state'],
        'stateChangeReason': status.get('state_change_reason'),
        'rows': rows,
        'columnMetadata': column_metadata,
        'rowCount': len(rows),
        'dataScannedInBytes': statistics.get('DataScannedInBytes', 0),
        'executionTimeInMillis': statistics.get('TotalExecutionTimeInMillis', 0),
        'query': query,
        'database': db,
    }


# ============================================
# Lambda Handler
# ============================================

def lambda_handler(event: dict, context: Any) -> dict:
    """
    AWS Lambda handler for Athena query execution.
    
    Args:
        event: Lambda event (from API Gateway)
        context: Lambda context
    
    Returns:
        API Gateway response
    """
    logger.info(f"Lambda function invoked: {context.function_name}")
    logger.info(f"Event: {json.dumps(event)}")
    
    try:
        # Parse request body
        body = event.get('body')
        if isinstance(body, str):
            body = json.loads(body)
        elif not body:
            body = {}
        
        # Extract parameters
        query = body.get('query', '').strip()
        max_wait_time = int(body.get('maxWaitTime', MAX_WAIT_TIME))
        output_location = body.get('outputLocation')
        
        # Validate max_wait_time
        if max_wait_time < 1 or max_wait_time > 900:
            raise ValueError(
                f"maxWaitTime must be between 1 and 900 seconds, got {max_wait_time}"
            )
        
        # Execute query
        result = execute_athena_query(
            query=query,
            output_location=output_location,
            max_wait_time=max_wait_time
        )
        
        logger.info(f"Query executed successfully: {result['queryExecutionId']}")
        
        return format_response(200, result)
    
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        return format_response(400, {
            'error': 'Invalid JSON',
            'message': str(e)
        })
    
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return format_response(400, {
            'error': 'Invalid request',
            'message': str(e)
        })
    
    except TimeoutError as e:
        logger.error(f"Timeout error: {str(e)}")
        return format_response(408, {
            'error': 'Query timeout',
            'message': str(e)
        })
    
    except RuntimeError as e:
        logger.error(f"Query execution error: {str(e)}")
        return format_response(400, {
            'error': 'Query execution failed',
            'message': str(e)
        })
    
    except BotoCoreError as e:
        logger.error(f"AWS API error: {str(e)}")
        return format_response(500, {
            'error': 'Service error',
            'message': 'An error occurred while processing your request'
        })
    
    except Exception as e:
        logger.error(f"Unexpected error: {type(e).__name__}: {str(e)}")
        return format_response(500, {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred',
            'type': type(e).__name__,
        })


# ============================================
# Local Testing
# ============================================

if __name__ == '__main__':
    # Example usage for local testing
    test_event = {
        'body': json.dumps({
            'query': 'SELECT * FROM student_db LIMIT 5',
            'maxWaitTime': 30
        })
    }
    
    # Set environment variables before testing
    os.environ['DATABASE_NAME'] = 'student_db'
    os.environ['S3_BUCKET'] = 'student-socialmedia-datalake'
    os.environ['RESULTS_PATH'] = 's3://student-socialmedia-datalake/athena-results/'
    
    # Test the handler
    response = lambda_handler(test_event, None)
    print(json.dumps(response, indent=2))


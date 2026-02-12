"""
AWS Lambda Function for Athena Query Execution
==============================================
Enhanced version with dedicated endpoints for each chart type.
Supports GPA vs Social Media, Sleep vs Stress, and Platform Usage queries.

Environment Variables:
    DATABASE_NAME: Name of the Glue database
    S3_BUCKET: S3 bucket for query results
    RESULTS_PATH: S3 path for Athena query results
    MAX_WAIT_TIME: Maximum wait time for query completion (default: 60s)

Author: AWS Serverless Data Lake
Version: 2.0.0
"""

import os
import json
import time
import logging
from typing import Any, Dict, Optional, List
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
# Pre-defined Query Templates
# ============================================

QUERY_TEMPLATES = {
    # GPA vs Social Media Queries
    "gpa_by_platform": """
        SELECT 
            platform,
            AVG(gpa) as avg_gpa,
            AVG(hours_per_day) as avg_hours,
            COUNT(*) as student_count
        FROM student_social_media_usage
        WHERE gpa IS NOT NULL AND hours_per_day IS NOT NULL
        GROUP BY platform
        ORDER BY avg_gpa DESC
        LIMIT 100
    """,
    
    "gpa_vs_hours": """
        SELECT 
            student_id,
            AVG(hours_per_day) as social_media_hours,
            AVG(gpa) as gpa
        FROM student_social_media_usage
        WHERE gpa IS NOT NULL AND hours_per_day IS NOT NULL
        GROUP BY student_id
        LIMIT 500
    """,
    
    "gpa_distribution": """
        SELECT 
            CASE 
                WHEN gpa >= 3.5 THEN '3.5-4.0'
                WHEN gpa >= 3.0 THEN '3.0-3.4'
                WHEN gpa >= 2.5 THEN '2.5-2.9'
                WHEN gpa >= 2.0 THEN '2.0-2.4'
                ELSE '< 2.0'
            END as gpa_range,
            COUNT(*) as student_count,
            AVG(hours_per_day) as avg_social_media_hours
        FROM student_social_media_usage
        WHERE gpa IS NOT NULL
        GROUP BY 1
    """,
    
    # Sleep vs Stress Queries
    "sleep_vs_stress": """
        SELECT 
            student_id,
            AVG(sleep_hours) as sleep_hours,
            AVG(stress_level) as stress_level,
            AVG(mental_health_score) as mental_health
        FROM student_sleep_stress
        WHERE sleep_hours IS NOT NULL AND stress_level IS NOT NULL
        GROUP BY student_id
        LIMIT 500
    """,
    
    "sleep_by_day": """
        SELECT 
            day_of_week,
            AVG(sleep_hours) as avg_sleep,
            AVG(stress_level) as avg_stress
        FROM student_sleep_stress
        WHERE day_of_week IS NOT NULL
        GROUP BY day_of_week
        ORDER BY 
            CASE day_of_week
                WHEN 'Monday' THEN 1
                WHEN 'Tuesday' THEN 2
                WHEN 'Wednesday' THEN 3
                WHEN 'Thursday' THEN 4
                WHEN 'Friday' THEN 5
                WHEN 'Saturday' THEN 6
                WHEN 'Sunday' THEN 7
            END
        LIMIT 50
    """,
    
    "stress_distribution": """
        SELECT 
            CASE 
                WHEN stress_level >= 8 THEN 'Very High'
                WHEN stress_level >= 6 THEN 'High'
                WHEN stress_level >= 4 THEN 'Moderate'
                WHEN stress_level >= 2 THEN 'Low'
                ELSE 'Very Low'
            END as stress_category,
            COUNT(*) as student_count,
            AVG(sleep_hours) as avg_sleep_hours
        FROM student_sleep_stress
        WHERE stress_level IS NOT NULL
        GROUP BY 1
    """,
    
    # Platform Usage Queries
    "platform_usage": """
        SELECT 
            platform,
            AVG(hours_per_day) as avg_hours,
            MIN(hours_per_day) as min_hours,
            MAX(hours_per_day) as max_hours,
            COUNT(DISTINCT student_id) as unique_users
        FROM student_social_media_usage
        GROUP BY platform
        ORDER BY avg_hours DESC
        LIMIT 50
    """,
    
    "platform_popularity": """
        SELECT 
            platform,
            COUNT(DISTINCT student_id) as user_count
        FROM student_social_media_usage
        GROUP BY platform
        ORDER BY user_count DESC
        LIMIT 50
    """,
    
    "weekly_pattern": """
        SELECT 
            day_of_week,
            AVG(hours_per_day) as avg_daily_hours,
            COUNT(DISTINCT student_id) as active_users
        FROM student_social_media_usage
        GROUP BY day_of_week
        ORDER BY 
            CASE day_of_week
                WHEN 'Monday' THEN 1
                WHEN 'Tuesday' THEN 2
                WHEN 'Wednesday' THEN 3
                WHEN 'Thursday' THEN 4
                WHEN 'Friday' THEN 5
                WHEN 'Saturday' THEN 6
                WHEN 'Sunday' THEN 7
            END
        LIMIT 20
    """,
    
    # Mental Health Queries
    "mental_health_correlation": """
        SELECT 
            student_id,
            AVG(hours_per_day) as social_media_hours,
            AVG(mental_health_score) as mental_health_score
        FROM student_social_media_usage u
        JOIN student_mental_health m ON u.student_id = m.student_id
        GROUP BY student_id
        LIMIT 500
    """,
    
    "mental_health_by_platform": """
        SELECT 
            platform,
            AVG(mental_health_score) as avg_mental_health,
            AVG(hours_per_day) as avg_hours
        FROM student_social_media_usage
        WHERE mental_health_score IS NOT NULL
        GROUP BY platform
        ORDER BY avg_mental_health DESC
        LIMIT 50
    """,
    
    # Summary Statistics
    "summary_stats": """
        SELECT 
            COUNT(DISTINCT student_id) as total_students,
            AVG(gpa) as avg_gpa,
            AVG(hours_per_day) as avg_social_media_hours,
            AVG(sleep_hours) as avg_sleep_hours,
            AVG(stress_level) as avg_stress_level
        FROM student_social_media_usage s
        LEFT JOIN student_sleep_stress ss ON s.student_id = ss.student_id
    """,
}


# ============================================
# Helper Functions
# ============================================

def format_response(status_code: int, body: dict) -> dict:
    """Format API Gateway Lambda proxy response."""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        },
        'body': json.dumps(body),
        'isBase64Encoded': False,
    }


def validate_query(query: str) -> tuple[bool, str]:
    """Validate the SQL query for security and format."""
    if not query or not isinstance(query, str):
        return False, "Query must be a non-empty string"
    
    query = query.strip()
    
    if len(query) > 262144:
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
        'EXEC\\s+',
    ]
    
    import re
    for pattern in dangerous_patterns:
        if re.search(pattern, query, re.IGNORECASE):
            return False, f"Query contains disallowed pattern: {pattern}"
    
    return True, ""


def sanitize_value(value: Any) -> Any:
    """Sanitize a single value for JSON serialization."""
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value
    if isinstance(value, str):
        return value.strip() if value else ""
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def sanitize_results(rows: List[Dict], columns: List[Dict]) -> List[Dict]:
    """Sanitize query results for JSON serialization."""
    sanitized = []
    
    for row in rows:
        sanitized_row = {}
        for col in columns:
            col_name = col.get('Name', f'col_{columns.index(col)}')
            value = row.get(col_name)
            sanitized_row[col_name] = sanitize_value(value)
        
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
    """Start a query execution in Athena."""
    try:
        response = athena_client.start_query_execution(
            QueryString=query,
            QueryExecutionContext={'Database': database},
            ResultConfiguration={'OutputLocation': output_location}
        )
        
        query_execution_id = response['QueryExecutionId']
        logger.info(f"Started query execution: {query_execution_id}")
        logger.info(f"Query: {query[:100]}...")
        
        return query_execution_id
        
    except ClientError as e:
        logger.error(f"Athena start query error: {e.response['Error']['Message']}")
        raise


def get_query_status(query_execution_id: str) -> dict:
    """Get the status of a query execution."""
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
    """Poll Athena until query completes or timeout."""
    start_time = time.time()
    poll_interval = 1
    attempt = 0
    
    logger.info(f"Waiting for query {query_execution_id} (max {max_wait_time}s)")
    
    while time.time() - start_time < max_wait_time:
        attempt += 1
        
        status = get_query_status(query_execution_id)
        state = status['state']
        
        logger.info(f"Query state (attempt {attempt}): {state}")
        
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
        
        poll_interval = min(poll_interval * 1.5, 5)
        elapsed = int(time.time() - start_time)
        remaining = max_wait_time - elapsed
        
        if remaining < poll_interval:
            poll_interval = remaining
        
        time.sleep(poll_interval)
    
    elapsed = int(time.time() - start_time)
    raise TimeoutError(
        f"Query did not complete within {max_wait_time} seconds "
        f"(elapsed: {elapsed}s, ID: {query_execution_id})"
    )


def get_query_results(
    query_execution_id: str,
    max_rows: int = 1000
) -> dict:
    """Retrieve query results from Athena."""
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
            }
            for i, col in enumerate(column_info)
        ]
        
        # Extract rows (skip header row)
        rows = result_set.get('Rows', [])
        data_rows = rows[1:] if len(rows) > 0 else []
        
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
        
        logger.info(f"Retrieved {len(parsed_rows)} rows with {len(column_metadata)} columns")
        
        return {
            'columnMetadata': column_metadata,
            'rows': parsed_rows,
            'rowCount': len(parsed_rows),
        }
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        logger.error(f"Error retrieving results ({error_code}): {str(e)}")
        raise


def execute_query(
    query: str,
    database: Optional[str] = None,
    output_location: Optional[str] = None,
    max_wait_time: int = MAX_WAIT_TIME,
    max_rows: int = 1000
) -> dict:
    """Execute a SQL query in Athena and return results."""
    # Validate query
    is_valid, error_msg = validate_query(query)
    if not is_valid:
        raise ValueError(error_msg)
    
    db = database or DATABASE_NAME
    output = output_location or RESULTS_PATH
    
    # Start query execution
    query_execution_id = start_query_execution(query, db, output)
    
    # Wait for completion
    status = wait_for_query_completion(query_execution_id, max_wait_time)
    
    statistics = status.get('statistics', {})
    
    # Get results if query succeeded
    if status['state'] == 'SUCCEEDED':
        results = get_query_results(query_execution_id, max_rows)
        rows = sanitize_results(results['rows'], results['columnMetadata'])
        column_metadata = results['columnMetadata']
    else:
        rows = []
        column_metadata = []
    
    return {
        'queryExecutionId': query_execution_id,
        'state': status['state'],
        'stateChangeReason': status.get('state_change_reason'),
        'rows': rows,
        'columnMetadata': column_metadata,
        'rowCount': len(rows),
        'dataScannedInBytes': statistics.get('DataScannedInBytes', 0),
        'executionTimeInMillis': statistics.get('TotalExecutionTimeInMillis', 0),
        'database': db,
    }


# ============================================
# Dedicated Query Endpoints
# ============================================

def handle_template_query(query_type: str, max_wait_time: int = 60) -> dict:
    """Execute a pre-defined template query."""
    if query_type not in QUERY_TEMPLATES:
        raise ValueError(f"Unknown query type: {query_type}. Available types: {list(QUERY_TEMPLATES.keys())}")
    
    query = QUERY_TEMPLATES[query_type]
    result = execute_query(query, max_wait_time=max_wait_time)
    
    return {
        'message': f'Query type "{query_type}" executed successfully',
        'queryType': query_type,
        **result
    }


def handle_custom_query(query: str, max_wait_time: int = 60) -> dict:
    """Execute a custom SQL query."""
    result = execute_query(query, max_wait_time=max_wait_time)
    
    return {
        'message': 'Custom query executed successfully',
        'query': query[:500] if len(query) > 500 else query,
        **result
    }


def handle_batch_queries(queries: List[Dict], max_wait_time: int = 60) -> dict:
    """Execute multiple queries and return all results."""
    results = []
    
    for i, q in enumerate(queries):
        query_type = q.get('type')
        custom_query = q.get('query')
        
        try:
            if query_type:
                result = handle_template_query(query_type, max_wait_time)
            elif custom_query:
                result = handle_custom_query(custom_query, max_wait_time)
            else:
                result = {
                    'error': f'Query {i+1} missing type or query',
                    'index': i + 1
                }
            
            results.append({
                'index': i + 1,
                'success': 'error' not in result,
                **result
            })
        except Exception as e:
            results.append({
                'index': i + 1,
                'success': False,
                'error': str(e)
            })
    
    return {
        'message': f'Batch query completed with {sum(1 for r in results if r["success"])}/{len(results)} successful',
        'results': results,
        'totalQueries': len(results),
        'successfulQueries': sum(1 for r in results if r['success'])
    }


# ============================================
# Lambda Handler
# ============================================

def lambda_handler(event: dict, context: Any) -> dict:
    """
    AWS Lambda handler for Athena query execution.
    
    Routes:
        POST /query              - Custom SQL query
        POST /query/{query_type} - Pre-defined template query
        GET  /health             - Health check
        POST /batch              - Batch query execution
    
    Expected Event:
    {
        "httpMethod": "POST",
        "path": "/query/gpa_by_platform",
        "body": "{\"maxWaitTime\": 60}"
    }
    """
    logger.info(f"Lambda function invoked: {context.function_name if context else 'unknown'}")
    logger.info(f"Event: {json.dumps(event)}")
    
    try:
        # Parse request
        http_method = event.get('httpMethod', 'POST')
        path = event.get('path', '/query')
        body = event.get('body')
        
        if isinstance(body, str):
            body = json.loads(body) if body else {}
        elif not body:
            body = {}
        
        # Health check endpoint
        if http_method == 'GET' and path in ['/health', '/health/']:
            return format_response(200, {
                'status': 'healthy',
                'timestamp': datetime.utcnow().isoformat(),
                'database': DATABASE_NAME,
                'bucket': S3_BUCKET
            })
        
        # Parse query type from path
        query_type = None
        if path.startswith('/query/'):
            query_type = path.split('/query/')[-1].strip()
        
        # Extract parameters
        custom_query = body.get('query')
        max_wait_time = int(body.get('maxWaitTime', MAX_WAIT_TIME))
        output_location = body.get('outputLocation')
        
        # Validate max_wait_time
        if max_wait_time < 1 or max_wait_time > 900:
            raise ValueError(f"maxWaitTime must be between 1 and 900 seconds, got {max_wait_time}")
        
        # Route: Batch queries
        if http_method == 'POST' and path in ['/batch', '/batch/']:
            queries = body.get('queries', [])
            if not queries:
                raise ValueError("Batch query requires 'queries' array")
            
            result = handle_batch_queries(queries, max_wait_time)
            return format_response(200, result)
        
        # Route: Template query
        if http_method in ['POST', 'GET'] and query_type:
            if query_type not in QUERY_TEMPLATES:
                raise ValueError(f"Unknown query type: {query_type}")
            
            result = handle_template_query(query_type, max_wait_time)
            return format_response(200, result)
        
        # Route: Custom query (POST /query)
        if http_method == 'POST' and path in ['/query', '/query/']:
            if not custom_query:
                raise ValueError("Custom query requires 'query' field in body")
            
            result = handle_custom_query(custom_query, max_wait_time)
            return format_response(200, result)
        
        # Route: List available query types
        if http_method == 'GET' and path in ['/queries', '/queries/']:
            return format_response(200, {
                'message': 'Available query types',
                'queryTypes': list(QUERY_TEMPLATES.keys()),
                'categories': {
                    'gpa': ['gpa_by_platform', 'gpa_vs_hours', 'gpa_distribution'],
                    'sleep_stress': ['sleep_vs_stress', 'sleep_by_day', 'stress_distribution'],
                    'platform': ['platform_usage', 'platform_popularity', 'weekly_pattern'],
                    'mental_health': ['mental_health_correlation', 'mental_health_by_platform'],
                    'summary': ['summary_stats']
                }
            })
        
        # Unknown route
        return format_response(404, {
            'error': 'Not Found',
            'message': f'Route {http_method} {path} not found',
            'availableRoutes': [
                'GET  /health',
                'GET  /queries',
                'POST /query',
                'POST /query/{query_type}',
                'POST /batch'
            ]
        })
    
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
    # Set environment variables
    os.environ['DATABASE_NAME'] = 'student_db'
    os.environ['S3_BUCKET'] = 'student-socialmedia-datalake'
    os.environ['RESULTS_PATH'] = 's3://student-socialmedia-datalake/athena-results/'
    
    # Test template query
    test_event = {
        'httpMethod': 'POST',
        'path': '/query/gpa_by_platform',
        'body': json.dumps({'maxWaitTime': 30})
    }
    
    print("Testing template query...")
    response = lambda_handler(test_event, None)
    print(json.dumps(response, indent=2))
    
    # Test custom query
    test_event_custom = {
        'httpMethod': 'POST',
        'path': '/query',
        'body': json.dumps({
            'query': 'SELECT platform, AVG(hours_per_day) FROM student_social_media_usage GROUP BY platform LIMIT 10',
            'maxWaitTime': 30
        })
    }
    
    print("\nTesting custom query...")
    response = lambda_handler(test_event_custom, None)
    print(json.dumps(response, indent=2))
    
    # Test health check
    test_event_health = {
        'httpMethod': 'GET',
        'path': '/health',
        'body': None
    }
    
    print("\nTesting health check...")
    response = lambda_handler(test_event_health, None)
    print(json.dumps(response, indent=2))


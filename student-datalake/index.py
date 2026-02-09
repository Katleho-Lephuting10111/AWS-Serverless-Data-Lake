import os
import boto3
import json
import time
from botocore.exceptions import ClientError

# Initialize Athena and S3 clients
athena_client = boto3.client('athena')
s3_client = boto3.client('s3')

def handler(event, context):
    """
    Lambda handler to execute Athena queries and return results.
    
    Environment variables:
    - DATABASE_NAME: Glue database name
    - S3_BUCKET: S3 bucket for data and results
    - RESULTS_PATH: S3 path for Athena query results
    
    Expected event body:
    {
        "query": "SELECT * FROM student LIMIT 10"
    }
    """
    
    try:
        # Validate environment variables
        database = validate_env_var('DATABASE_NAME')
        bucket = validate_env_var('S3_BUCKET')
        results_path = os.environ.get('RESULTS_PATH', f's3://{bucket}/athena-results/')
        
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event.get('body', '{}'))
        else:
            body = event.get('body', {})
        
        query = body.get('query', '').strip()
        max_wait_time = int(body.get('maxWaitTime', 60))
        
        # Validate query input
        if not query:
            return format_response(400, {
                'error': 'Invalid input',
                'message': 'Query parameter is required and cannot be empty'
            })
        
        if len(query) > 262144:  # Athena limit is 256 KB
            return format_response(400, {
                'error': 'Query too large',
                'message': f'Query size {len(query)} bytes exceeds maximum of 262144 bytes'
            })
        
        if max_wait_time < 1 or max_wait_time > 900:
            return format_response(400, {
                'error': 'Invalid maxWaitTime',
                'message': 'maxWaitTime must be between 1 and 900 seconds'
            })
        
        print(f"Executing query: {query[:100]}...")
        print(f"Database: {database}, Max wait time: {max_wait_time}s")
        
        # Start query execution
        response = athena_client.start_query_execution(
            QueryString=query,
            QueryExecutionContext={'Database': database},
            ResultConfiguration={
                'OutputLocation': results_path
            }
        )
        
        query_execution_id = response['QueryExecutionId']
        print(f"Query started with ID: {query_execution_id}")
        
        # Wait for query execution to complete
        query_status = wait_for_query_completion(query_execution_id, max_wait_time)
        
        # Handle query failures
        if query_status['State'] == 'FAILED':
            error_reason = query_status.get('StateChangeReason', 'Unknown error')
            print(f"Query failed: {error_reason}")
            return format_response(400, {
                'error': 'Query execution failed',
                'queryExecutionId': query_execution_id,
                'reason': error_reason,
                'state': query_status['State']
            })
        
        if query_status['State'] == 'CANCELLED':
            print("Query was cancelled")
            return format_response(400, {
                'error': 'Query was cancelled',
                'queryExecutionId': query_execution_id,
                'state': query_status['State']
            })
        
        # Query succeeded - retrieve results
        results = get_query_results(query_execution_id)
        
        return format_response(200, {
            'message': 'Query executed successfully',
            'queryExecutionId': query_execution_id,
            'state': query_status['State'],
            'rows': results['rows'],
            'columnMetadata': results['columnMetadata'],
            'rowCount': len(results['rows']),
            'dataScannedInBytes': query_status.get('Statistics', {}).get('DataScannedInBytes', 0),
            'executionTimeInMillis': query_status.get('Statistics', {}).get('TotalExecutionTimeInMillis', 0)
        })
        
    except TimeoutError as e:
        print(f"Timeout error: {str(e)}")
        return format_response(408, {
            'error': 'Query timeout',
            'message': str(e)
        })
    
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        print(f"AWS Error ({error_code}): {error_message}")
        
        # Handle specific AWS errors
        if error_code == 'InvalidRequestException':
            status = 400
            error_type = 'Invalid request'
        elif error_code == 'AccessDeniedException':
            status = 403
            error_type = 'Access denied'
        elif error_code == 'ThrottlingException':
            status = 429
            error_type = 'Rate limited'
        elif error_code == 'InternalServerException':
            status = 503
            error_type = 'Service unavailable'
        else:
            status = 500
            error_type = error_code
        
        return format_response(status, {
            'error': error_type,
            'code': error_code,
            'message': error_message
        })
    
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {str(e)}")
        return format_response(400, {
            'error': 'Invalid JSON',
            'message': f'Failed to parse request body: {str(e)}'
        })
    
    except ValueError as e:
        print(f"Value error: {str(e)}")
        return format_response(400, {
            'error': 'Invalid parameter',
            'message': str(e)
        })
    
    except Exception as e:
        print(f"Unexpected error: {type(e).__name__}: {str(e)}")
        return format_response(500, {
            'error': 'Unexpected error',
            'type': type(e).__name__,
            'message': str(e)
        })


def validate_env_var(var_name):
    """
    Validate that required environment variable is set.
    
    Args:
        var_name: Name of environment variable
    
    Returns:
        Value of environment variable
    
    Raises:
        ValueError: If environment variable is not set
    """
    value = os.environ.get(var_name)
    if not value:
        raise ValueError(f"Required environment variable '{var_name}' is not set")
    return value


def wait_for_query_completion(query_execution_id, max_wait_time=60):
    """
    Poll Athena for query completion status.
    
    Args:
        query_execution_id: The query execution ID
        max_wait_time: Maximum time to wait in seconds
    
    Returns:
        Query status dictionary
    
    Raises:
        TimeoutError: If query doesn't complete within max_wait_time
        ClientError: If AWS API call fails
    """
    start_time = time.time()
    poll_interval = 1  # Start with 1 second polling
    attempt = 0
    
    while time.time() - start_time < max_wait_time:
        attempt += 1
        try:
            response = athena_client.get_query_execution(
                QueryExecutionId=query_execution_id
            )
            
            execution = response['QueryExecution']
            state = execution['Status']['State']
            
            print(f"Query state (attempt {attempt}): {state}")
            
            if state in ['SUCCEEDED', 'FAILED', 'CANCELLED']:
                return execution['Status']
            
            # Exponential backoff up to 5 seconds
            poll_interval = min(poll_interval * 1.5, 5)
            time.sleep(poll_interval)
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            print(f"Error checking query status ({error_code}): {str(e)}")
            
            # Re-raise to be caught by main handler
            raise
    
    # Timeout reached
    elapsed = int(time.time() - start_time)
    error_msg = f"Query did not complete within {max_wait_time} seconds (elapsed: {elapsed}s, ID: {query_execution_id})"
    print(f"Timeout: {error_msg}")
    raise TimeoutError(error_msg)


def get_query_results(query_execution_id):
    """
    Retrieve query results from Athena.
    
    Args:
        query_execution_id: The query execution ID
    
    Returns:
        Dictionary with rows and column metadata
    
    Raises:
        ClientError: If query results cannot be retrieved
    """
    try:
        # Get results
        response = athena_client.get_query_results(
            QueryExecutionId=query_execution_id,
            MaxResults=1000  # Retrieve up to 1000 rows
        )
        
        # Extract column metadata from result set metadata
        result_set = response.get('ResultSet', {})
        result_set_metadata = result_set.get('ResultSetMetadata', {})
        column_info = result_set_metadata.get('ColumnInfo', [])
        
        if not column_info:
            print("Warning: No column info in results")
            return {'columnMetadata': [], 'rows': []}
        
        column_metadata = [
            {
                'name': col.get('Name', 'unknown'),
                'type': col.get('Type', 'unknown')
            }
            for col in column_info
        ]
        
        # Extract rows (skip header row)
        rows = []
        for row in result_set.get('Rows', [])[1:]:  # Skip header
            data = row.get('Data', [])
            try:
                row_data = {
                    column_metadata[i]['name']: data[i].get('VarCharValue', '')
                    for i in range(min(len(data), len(column_metadata)))
                }
                rows.append(row_data)
            except (IndexError, KeyError) as e:
                print(f"Warning: Error parsing row: {str(e)}")
                continue
        
        print(f"Retrieved {len(rows)} rows with {len(column_metadata)} columns")
        return {
            'columnMetadata': column_metadata,
            'rows': rows
        }
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        print(f"Error retrieving query results ({error_code}): {error_message}")
        raise


def format_response(status_code, body):
    """
    Format Lambda response for API Gateway (AWS_PROXY integration).
    
    Args:
        status_code: HTTP status code
        body: Response body dictionary
    
    Returns:
        Formatted API Gateway response
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body)
    }


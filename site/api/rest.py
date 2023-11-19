from heapq import merge
import os
import json
import boto3
import time
from decimal import Decimal
from botocore.exceptions import ClientError

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

# Set the region based on the AWS_REGION environment variable (not needed for Lambda)
# If running locally, you can set the region using os.environ['AWS_REGION']
region_name = os.environ['AWS_REGION'] if 'AWS_REGION' in os.environ else 'us-east-1'

# Create a DynamoDB client with the specified region
dynamodb = boto3.resource('dynamodb', region_name=region_name)

# Get the DynamoDB table name from the environment variable
table_name = "userdata"

# Get the DynamoDB table with the specified name
table = dynamodb.Table(table_name)

# def create_item(item_id, item_data, context):
#     # Convert Python decimal to JSON number string for serialization
#     item_data = DecimalEncoder(item_data)

#     # Update DynamoDB item
#     response = table.put_item(Item={'id': item_id, **item_data})

#     return {
#         "statusCode": 200,
#         "body": json.dumps("Item created successfully!")
#     }

def update_json(obj1, obj2):
    for key, value in obj2.items():
        if isinstance(value, dict) and key in obj1 and isinstance(obj1[key], dict):
            # If the value is a dictionary and the key exists in obj1 as a dictionary,
            # recursively update the nested dictionaries
            update_json(obj1[key], value)
        else:
            # Otherwise, update the value in obj1 with the value from obj2
            obj1[key] = value

    return obj1

def get_item(item_id, key=None):
    response = table.get_item(Key={"id": item_id})
    item = response.get("Item", None)

    if item and 'data' in item:
        data = item['data']
        if key is None:
            return data
        else:
            value = get_nested_value(data, key)
            return {key: value} if value is not None else {}
    
    return None

def get_nested_value(data, key):
    keys = key.split('.')
    value = json.loads(data)
    for k in keys:
        if '[' in k and ']' in k:
            # Handle list index
            list_key, index = k.split('[')
            index = int(index[:-1])  # Remove the ']' character
            if list_key in value and isinstance(value[list_key], list) and len(value[list_key]) > index:
                value = value[list_key][index]
            else:
                return None
        elif k in value:
            value = value[k]
        else:
            return None
    return value

import json
import boto3
from botocore.exceptions import ClientError

def delete_item(item_id, password, key):
    check_password(item_id, password)
    try:
        # Authenticate the user
        password_auth_result = check_password(item_id, password)
        if not password_auth_result == True:
            return password_auth_result

        # Fetch the existing item from the database
        existing_item = get_item(item_id)

        if not existing_item:
            return {
                "statusCode": 404,
                "body": json.dumps("Item not found")
            }

        # Split the key path by dot notation
        keys = key.split('.')

        # Traverse the data object to find the target key to delete
        data = existing_item['data']
        parent = None
        last_key = keys[-1]

        for k in keys[:-1]:
            if k in data:
                parent = data
                data = data[k]
            else:
                return {
                    "statusCode": 400,
                    "body": json.dumps("Key path not found in data object")
                }

        # Check if the last key exists in the parent object and is a dictionary
        if parent is not None and isinstance(parent, dict) and last_key in parent:
            # Delete the key from the parent dictionary
            del parent[last_key]

            # Update the item in the database with the modified data
            response = table.update_item(
                Key={"id": item_id},
                UpdateExpression="set #data = :data",
                ExpressionAttributeNames={"#data": "data"},
                ExpressionAttributeValues={":data": json.dumps(existing_item['data'])},
                ReturnValues="UPDATED_NEW"
            )

            return {
                "statusCode": 200,
                "body": json.dumps("Key deleted successfully!")
            }
        else:
            return {
                "statusCode": 400,
                "body": json.dumps("Key not found in data object")
            }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }



def check_password(item_id, password):
    response = table.get_item(Key={"id": item_id})
    item = response.get("Item", None)
    if not item:
        return {
            "statusCode": 404,
            "body": "User not found."
        }
    if item["password"] != password:
        return {
            "statusCode": 401,
            "body": "Incorrect password."
        }
    else:
        return True

def get_item_public(item_id, password):    
    return get_item(item_id)
                

def update_password(item_id, new_password, old_password, context):
    check_password(id, old_password)

    try:
        response = table.update_item(
            Key={"id": item_id},
            UpdateExpression="SET password = :new_password",
            ExpressionAttributeValues={":new_password": new_password}
        )
        return "Password updated successfully!"
    except Exception as e:
        return str(e)


def create_item(item_data):
    # Check if the item with the given ID already exists
    existing_item = get_item(item_data['id'])
    if existing_item:
        return {
            "statusCode": 409,
            "body": "Item with the specified ID already exists"
        }
    try:
        requests_received_data_json = json.dumps(item_data.get('requests_received', {}))
        responses_received_data_json = json.dumps(item_data.get('responses_received', {}))
        requests_sent_data_json = json.dumps(item_data.get('requests_sent', {}))
        responses_sent_data_json = json.dumps(item_data.get('responses_sent', {}))
        crosschain_transactions = json.dumps(item_data.get('crosschain_transactions', {}))

        # Initialize the available_dashboard list with objects from the data field
        available_dashboard = list(item_data['data'].keys())

        # Add a "last_updated" timestamp for each parent level in the "data" field
        data_with_timestamps = item_data['data']
        for key in data_with_timestamps:
            data_with_timestamps[key]['last_updated'] = str(int(time.time()))
        item_data_json = json.dumps(data_with_timestamps, cls=DecimalEncoder)
        # Add a "last_updated" timestamp for columns outside the "data" field
        item_data['last_updated'] = str(int(time.time()))

        response = table.put_item(Item={
            "id": item_data['id'],
            "data": item_data_json,  # Use the updated "data" field
            "password": item_data.get("password", ""),
            "requests_received": requests_received_data_json,
            "responses_received": responses_received_data_json,
            "requests_sent": requests_sent_data_json,
            "responses_sent": responses_sent_data_json,
            "available_dashboard": available_dashboard,  # Add the available_dashboard list
            "crosschain_transactions": crosschain_transactions
        })

        return "Item created successfully!"
    except Exception as e:
        return str(e)

def update_item(id, password, body):
    check_password(id, password)
    # Check if the item with the given ID exists
    existing_item = get_item(id)
    if not existing_item:
        return {
            "statusCode": 404,
            "body": json.dumps("Item with the specified ID not found")
        }

    try:
        item_id = id
        if not item_id:
            return {
                "statusCode": 400,
                "body": json.dumps("Missing 'id' in the request body")
            }

        # Fetch the existing item from the database
        existing_item = get_item(item_id)
        if not existing_item:
            return {
                "statusCode": 404,
                "body": json.dumps("Item not found")
            }
        
        # Fetch the existing "available_dashboard" set from the database
        response = table.get_item(Key={"id": item_id}, ProjectionExpression="available_dashboard")
        existing_available_dashboard_set = response.get("Item", {}).get("available_dashboard", [])

        # Convert the DynamoDB set to a Python list
        existing_available_dashboard = list(existing_available_dashboard_set)

        # Update the "available_dashboard" list with keys from the "body" object
        for key in body.keys():
            if key not in existing_available_dashboard:
                existing_available_dashboard.append(key)
        
        existing_item = json.loads(existing_item)

        for key in body:
            body[key]['last_updated'] = str(int(time.time()))
        
        # Merge the new data into the existing data, preserving the "last_updated" timestamps
        merged_item = update_json(existing_item, body)
        
        # Update the "last_updated" timestamps for each parent key in the "data" column

        # Convert Decimal fields to float for serialization
        item_data_json = json.dumps(merged_item, cls=DecimalEncoder)

        # Update the item in the database
        response = table.update_item(
            Key={"id": item_id},
            UpdateExpression="set #data = :data, #available_dashboard = :available_dashboard",
            ExpressionAttributeNames={"#data": "data", "#available_dashboard": "available_dashboard"},
            ExpressionAttributeValues={":data": item_data_json, ":available_dashboard": existing_available_dashboard},
            ReturnValues="UPDATED_NEW"
        )

        return response['Attributes']
    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }

def update_timestamps(data):
    # Recursive function to update "last_updated" timestamps for parent keys in the "data" object
    if isinstance(data, dict):
        current_timestamp = str(int(time.time()))
        data['last_updated'] = current_timestamp
        for key, value in data.items():
            if key != 'last_updated':
                update_timestamps(value)
    elif isinstance(data, list):
        for item in data:
            update_timestamps(item)



def add_request(sender_id, requests, password):
    check_password(sender_id, password)
    try:
        # Get sender's data from the database
        sender_response = table.get_item(Key={"id": sender_id})
        sender_data = sender_response.get("Item", None)

        if not sender_data:
            return {
                "statusCode": 404,
                "body": json.dumps("Sender not found")
            }

        # Extract receiver's id from the requests object
        receiver_id = requests[list(requests.keys())[0]]['id']

        # Get receiver's data from the database
        receiver_response = table.get_item(Key={"id": receiver_id})
        receiver_data = receiver_response.get("Item", None)

        if not receiver_data:
            return {
                "statusCode": 404,
                "body": json.dumps("Receiver not found")
            }

        # Update sender's sent_requests
        sender_requests_sent = json.loads(sender_data.get('requests_sent', '{}'))
        sender_requests_sent.update(requests)
        sender_requests_sent_json = json.dumps(sender_requests_sent)

        # Update receiver's received_requests
        receiver_requests_received = json.loads(receiver_data.get('requests_received', '{}'))
        receiver_requests_received.update(requests)
        receiver_requests_received_json = json.dumps(receiver_requests_received)

        # Update sender's and receiver's data in the database
        response = table.update_item(
            Key={"id": sender_id},
            UpdateExpression="set #requests_sent = :requests_sent",
            ExpressionAttributeNames={"#requests_sent": "requests_sent"},
            ExpressionAttributeValues={":requests_sent": sender_requests_sent_json}
        )
        response = table.update_item(
            Key={"id": receiver_id},
            UpdateExpression="set #requests_received = :requests_received",
            ExpressionAttributeNames={"#requests_received": "requests_received"},
            ExpressionAttributeValues={":requests_received": receiver_requests_received_json}
        )

        return {
            "statusCode": 200,
            "body": json.dumps("Request added successfully!")
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }

def add_response(sender_id, responses, password):
    check_password(sender_id, password)
    try:
        # Get sender's data from the database
        sender_response = table.get_item(Key={"id": sender_id})
        sender_data = sender_response.get("Item", None)

        if not sender_data:
            return {
                "statusCode": 404,
                "body": json.dumps("Sender not found")
            }

        # Extract receiver's id from the responses object
        receiver_id = responses[list(responses.keys())[0]]['id']

        # Get receiver's data from the database
        receiver_response = table.get_item(Key={"id": receiver_id})
        receiver_data = receiver_response.get("Item", None)

        if not receiver_data:
            return {
                "statusCode": 404,
                "body": json.dumps("Receiver not found")
            }

        # Update sender's sent_responses
        sender_responses_sent = json.loads(sender_data.get('responses_sent', '{}'))
        sender_responses_sent.update(responses)
        sender_responses_sent_json = json.dumps(sender_responses_sent)

        # Update receiver's received_responses
        receiver_responses_received = json.loads(receiver_data.get('responses_received', '{}'))
        receiver_responses_received.update(responses)
        receiver_responses_received_json = json.dumps(receiver_responses_received)

        # Update sender's and receiver's data in the database
        response = table.update_item(
            Key={"id": sender_id},
            UpdateExpression="set #responses_sent = :responses_sent",
            ExpressionAttributeNames={"#responses_sent": "responses_sent"},
            ExpressionAttributeValues={":responses_sent": sender_responses_sent_json}
        )
        response = table.update_item(
            Key={"id": receiver_id},
            UpdateExpression="set #responses_received = :responses_received",
            ExpressionAttributeNames={"#responses_received": "responses_received"},
            ExpressionAttributeValues={":responses_received": receiver_responses_received_json}
        )

        return {
            "statusCode": 200,
            "body": json.dumps("Response added successfully!")
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }

def get_available_dashboard(item_id, password):
    check_password(item_id, password)
    try:
        # Query the DynamoDB table to fetch the available_dashboard attribute
        response = table.get_item(Key={"id": item_id}, ProjectionExpression="available_dashboard")

        item = response.get("Item", None)
        if not item or "available_dashboard" not in item:
            return {
                "statusCode": 404,
                "body": json.dumps("available_dashboard not found")
            }

        # Retrieve the available_dashboard list from the item
        available_dashboard = item.get('available_dashboard', [])

        return {
            "statusCode": 200,
            "body": json.dumps(available_dashboard)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }

def get_dashboard(item_id, password):
    check_password(item_id, password)
    try:

        # Query the DynamoDB table to fetch the "dashboard" attribute
        response = table.get_item(Key={"id": item_id}, ProjectionExpression="dashboard")
        item = response.get("Item", None)
        if not item or "dashboard" not in item:
            return {
                "statusCode": 404,
                "body": json.dumps("Dashboard not found")
            }

        # Retrieve the "dashboard" list from the item
        dashboard = item.get('dashboard', [])

        return {
            "statusCode": 200,
            "body": json.dumps(dashboard)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }

def add_to_dashboard(item_id, service, password):
    check_password(item_id, password)
    try:

        # Query the DynamoDB table to fetch the "available_dashboard" attribute
        response = table.get_item(Key={"id": item_id}, ProjectionExpression="available_dashboard")

        item = response.get("Item", None)
        if not item or "available_dashboard" not in item:
            return {
                "statusCode": 404,
                "body": json.dumps("Available dashboard not found")
            }

        # Retrieve the "available_dashboard" list from the item
        available_dashboard = item.get('available_dashboard', [])

        # Query the DynamoDB table to fetch the "dashboard" attribute
        response = table.get_item(Key={"id": item_id}, ProjectionExpression="dashboard")

        item = response.get("Item", None)
        if not service or "dashboard" not in item:
            return {
                "statusCode": 404,
                "body": json.dumps("Dashboard not found")
            }
        dashboard = item.get('dashboard', [])

        # Check if the "item" already exists in the "dashboard" list
        if service in dashboard:
            return {
                "statusCode": 400,
                "body": json.dumps("Item already in dashboard")
            }
        if service not in available_dashboard:
            return {
                "statusCode": 400,
                "body": json.dumps("Service not available for user")
            }
        # Add the new item to the "dashboard" list
        dashboard.append(service)

        # Update the "dashboard" list in DynamoDB
        response = table.update_item(
            Key={"id": item_id},
            UpdateExpression="SET dashboard = :dashboard",
            ExpressionAttributeValues={":dashboard": dashboard}
        )

        return {
            "statusCode": 200,
            "body": json.dumps("Item added to dashboard successfully!")
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }

def remove_from_dashboard(item_id, service, password):
    check_password(item_id, password)
    try:

        # Query the DynamoDB table to fetch the "dashboard" attribute
        response = table.get_item(Key={"id": item_id}, ProjectionExpression="dashboard")

        item = response.get("Item", None)
        if not service or "dashboard" not in item:
            return {
                "statusCode": 404,
                "body": json.dumps("Dashboard not found")
            }

        dashboard = item.get('dashboard', [])

        # Check if the "item" already exists in the "dashboard" list
        if service not in dashboard:
            return {
                "statusCode": 400,
                "body": json.dumps("Service not currently assigned to user dashboard")
            }
        # Add the new item to the "dashboard" list
        dashboard.remove(service)

        # Update the "dashboard" list in DynamoDB
        response = table.update_item(
            Key={"id": item_id},
            UpdateExpression="SET dashboard = :dashboard",
            ExpressionAttributeValues={":dashboard": dashboard}
        )

        return {
            "statusCode": 200,
            "body": json.dumps("Item removed from dashboard successfully!")
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }

def add_crosschain_transaction(id, crosschain_transaction, password):
    check_password(id, password)
    try:
        
        # Get users CCTXs from the database
        user = table.get_item(Key={"id": id})
        user_data = user.get("Item", None)

        if not user_data:
            return {
                "statusCode": 404,
                "body": json.dumps("User not found")
            }

        # Update users cctx's
        cctx = json.loads(user_data.get('crosschain_transactions', '{}'))
        cctx.update(crosschain_transaction)
        crosschain_transactions = json.dumps(cctx)

        # Update cctx's in the database
        response = table.update_item(
            Key={"id": id},
            UpdateExpression="set #crosschain_transactions = :crosschain_transactions",
            ExpressionAttributeNames={"#crosschain_transactions": "crosschain_transactions"},
            ExpressionAttributeValues={":crosschain_transactions": crosschain_transactions}
        )

        return {
            "statusCode": 200,
            "body": json.dumps("Crosschain transaction added successfully!")
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }

def get_crosschain_transcation(id, password):
    check_password(id, password)
    try:

        # Query the DynamoDB table to fetch the "crosschain_transactions" attribute
        response = table.get_item(Key={"id": id}, ProjectionExpression="crosschain_transactions")
        item = response.get("Item", None)
        if not item or "crosschain_transactions" not in item:
            return {
                "statusCode": 404,
                "body": json.dumps("Crosschain transactions list not found")
            }

        # Retrieve the "crosschain_transactions" list from the item
        cctx = item.get('crosschain_transactions', [])

        return {
            "statusCode": 200,
            "body": json.dumps(cctx)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }

def get_crosschain_transaction(id, password):
    check_password(id, password)
    try:

        # Query the DynamoDB table to fetch the "crosschain_transactions" attribute
        response = table.get_item(Key={"id": id}, ProjectionExpression="crosschain_transactions")
        item = response.get("Item", None)
        if not item or "crosschain_transactions" not in item:
            return {
                "statusCode": 404,
                "body": json.dumps("Crosschain transactions list not found")
            }

        # Retrieve the "crosschain_transactions" list from the item
        cctx = item.get('crosschain_transactions', [])

        return {
            "statusCode": 200,
            "body": cctx
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }


def handler(event, context):
    event = json.dumps(event)
    event = json.loads(event)
    try:
        inner_body = json.loads(event['body'])
        request_context = event['requestContext']
        http_method = request_context["http"]["method"]
        # http_method = inner_body['httpMethod']

        # Parse the JSON body if it exists
        body = inner_body
        

        # Perform actions based on the HTTP method and action
        # if http_method == 'GET':
        #     # Add handling for other GET actions here
        #     else:
        #         return {
        #             "statusCode": 400,
        #             "body": json.dumps("Invalid action for GET request")
        #         }
        if http_method == 'POST':
            if body and 'action' in body and body['action'] == 'get_item':

                    if 'id' in body:
                        key = None
                        if 'key' in body:
                            key = body['key']
                        
                        key = body['key'] if 'key' in body else None
                        return get_item(body['id'], key)
                    else:
                        return {
                            "statusCode": 400,
                            "body": json.dumps("Missing 'id' in the request body")
                        }

            elif body and 'action' in body and body['action'] == 'create_item':
                if 'id' in body and 'data' in body:
                    return create_item(body)
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id' or 'data' in the request body")
                    }
            elif body and 'action' in body and body['action'] == 'add_request':
                if 'requests' in body and 'id' in body:
                    return add_request(body['id'], body['requests'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'requests' or 'id' in the request body")
                    }

            elif body and 'action' in body and body['action'] == 'add_response':
                if 'responses' in body and 'id' in body:
                    return add_response(body['id'], body['responses'], body['password'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'responses' or 'id' in the request body")
                    }

            elif body['action'] == 'get_available_dashboard':
                if 'id' in body:
                    return get_available_dashboard(body['id'], body['password'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id' or 'password' in the request body")
                    }

            elif body['action'] == 'get_dashboard':
                if 'id' in body:
                    return get_dashboard(body['id'], body['password'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id' or 'password' in the request body")
                    }

            elif body['action'] == 'add_to_dashboard':
                if 'id' in body and 'password' in body and 'service' in body:
                    return add_to_dashboard(body['id'], body['service'], body['password'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id', 'password', or 'service' in the request body")
                        }
            elif body['action'] == 'add_crosschain_transaction':
                if 'id' in body:
                    return add_crosschain_transaction(body['id'], body['transaction'], body['password'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id', 'transaction' or 'password' in the request body")
                        }
            elif body['action'] == 'get_crosschain_transaction':
                if 'id' in body:
                    return get_crosschain_transaction(body['id'], body['password'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id', 'transaction' or 'password' in the request body")
                        }

            # Add handling for other POST actions here
            else:
                return {
                    "statusCode": 400,
                    "body": json.dumps("Invalid action for POST request")
                }

        elif http_method == 'PUT':
            if body and 'action' in body and body['action'] == 'update_item':
                if 'id' in body and 'data' in body and 'password' in body:
                    return update_item(body['id'], body['password'], body['data'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id', 'data', or 'password' in the update item request body")
                    }
            if body and 'action' in body and body['action'] == 'update_password':
                if 'id' in body and 'password' in body:
                    return update_password(body['id'], body['new_password'], body['password'], context)
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id', 'data', or 'password' in the request body")
                    }
            # Add handling for other PUT actions here
            else:
                return {
                    "statusCode": 400,
                    "body": json.dumps("Invalid action for PUT request")
                }
        elif http_method == 'DELETE':
            if body and 'action' in body:
                if body['action'] == 'remove_from_dashboard':
                    if 'id' in body and 'password' in body and 'service' in body:
                        return remove_from_dashboard(body['id'], body['service'], body['password'])
                    else:
                        return {
                            "statusCode": 400,
                            "body": json.dumps("Missing 'id', 'password', or 'service' in the request body")
                        }
                elif body['action'] == 'delete_item':
                    if 'id' in body and 'password' in body and 'key' in body:
                        return delete_item(body['id'], body['password'], body['key'], body['password'])
                    else:
                        return {
                            "statusCode": 400,
                            "body": json.dumps("Missing 'id', 'password', or 'key' in the delete item request body")
                        }
                # Add handling for other DELETE actions here
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Invalid action for DELETE request")
                    }

        # Add handling for other HTTP methods here
        else:
            return {
                "statusCode": 405,
                "body": json.dumps("Method not allowed")
            }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }
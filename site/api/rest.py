from heapq import merge
import os
import json
import boto3
import random
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
        data = json.loads(item['data'])
        if key is None:
            return data
        else:
            value = get_nested_value(data, key)
            return {key: value} if value is not None else {}
    
    return None

def get_nested_value(data, key):
    keys = key.split('.')
    value = data
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


def check_password(item_id, password):
    print("PASSWORD CHECK TIME!")
    print("Supplied password: ")
    print(password)
    response = table.get_item(Key={"id": item_id})
    item = response.get("Item", None)
    print("found password:")
    print(item['password'])
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
        print("password matches:")
        print(item['password'] == password)
    return True

def get_item_public(item_id, password):    
    return get_item(item_id)
                

def update_password(item_id, new_password, old_password, context):

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
        item_data_json = json.dumps(item_data['data'], cls=DecimalEncoder)
        requests_data_json = json.dumps(item_data['requests'])
        responses_data_json = json.dumps(item_data['responses'])
        response = table.put_item(Item={
            "id": item_data['id'],
            "data": item_data_json,
            "password": item_data.get("password", ""),
            "requests": requests_data_json,
            "responses": responses_data_json
        })
        return "Item created successfully!"
    except Exception as e:
        return str(e)

def update_item(id, password, body):
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

        print("here is the body:")
        print(body)
        print("followed by the existing item:")
        print(existing_item)

        merged_item = update_json(existing_item, body)

        # # Remove 'id' from the merged item, as it's used as the key
        # merged_item.pop('id', None)

        # Convert Decimal fields to float for serialization
        item_data_json = json.dumps(merged_item, cls=DecimalEncoder)

        # Update the item in the database
        response = table.update_item(
            Key={"id": item_id},
            UpdateExpression="set #data = :data",
            ExpressionAttributeNames={"#data": "data"},
            ExpressionAttributeValues={":data": item_data_json},
            ReturnValues="UPDATED_NEW"
        )

        return response['Attributes']
    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }


def add_request(sender_id, requests):
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
        print("requests:")
        print(requests)
        print("requests.keys():")
        print(requests.keys())
        print("list(requests.keys()):")
        print(list(requests.keys()))
        print("list(requests.keys())[0]:")
        print(receiver_id)

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


def add_response(user_id, requester_id, requests):
    try:
        # Get the user's data from the database
        response = table.get_item(Key={"id": user_id})
        user_data = response.get("Item", None)

        # Check if the user exists
        if not user_data:
            return {
                "statusCode": 404,
                "body": json.dumps("User not found")
            }

        user_responses = json.loads(user_data['responses'])

        # Check for duplicate titles in the new requests
        existing_titles = set(user_responses.keys())
        new_titles = set(requests.keys())
        if existing_titles.intersection(new_titles):
            return {
                "statusCode": 400,
                "body": json.dumps("Response with duplicate title already exists for this user")
            }

        # Add the new request object to the user's requests
        user_responses.update(requests)

        # Convert the updated requests back to JSON string
        user_requests_json = json.dumps(user_responses)
        print(user_requests_json)
        
        response = table.update_item(
            Key={"id": user_id},
            UpdateExpression="set #requests = :requests",
            ExpressionAttributeNames={
                "#requests": "requests"
            },
            ExpressionAttributeValues={
                ":requests": user_requests_json
            },
            ReturnValues="ALL_NEW"
        )
        print("User responses pre processing:")
        print(user_data['responses'])
        # Now, add the corresponding entry to the user's responses
        user_responses = json.loads(user_data.get('responses', '{}'))
        print("user responses post processing:")
        print(user_responses)
        for request_id, request_data in requests.items():
            response_entry = {
                "requester_id": requester_id,
                "encrypted_request": request_data["encrypted_request"],
                "encrypted_secret_key": request_data["encrypted_secret_key"]
            }
            user_responses[request_id] = response_entry

        # Update the user's responses in the database
        user_responses_json = json.dumps(user_responses)
        response = table.update_item(
            Key={"id": user_id},
            UpdateExpression="set #responses = :responses",
            ExpressionAttributeNames={"#responses": "responses"},
            ExpressionAttributeValues={":responses": user_responses_json},
            ReturnValues="ALL_NEW"
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

def add_response(sender_id, responses):
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




def handler(event, context):
    print("Made it to the handler function!!")
    print("Event: ")
    print(event)
    print("Context: ")
    print(context)
    event = json.dumps(event)
    event = json.loads(event)
    print("Event type:")
    print(type(event))
    print("Event after JSON dumps/loads:")
    print(event)
    try:
        inner_body = json.loads(event['body'])
        request_context = event['requestContext']
        print("request context:")
        print(request_context)
        print("http:")
        print(request_context["http"])
        http_method = request_context["http"]["method"]
        print("inner body:")
        print(inner_body)
        print("inner body type:")
        print(type(inner_body))
        # http_method = inner_body['httpMethod']
        print(http_method)

        # Parse the JSON body if it exists
        body = inner_body
        
        print(body)

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
                password_auth_result = check_password(body['id'], body['password'])
                if(password_auth_result == True):
                    if 'id' in body:
                        key = None
                        if 'key' in body:
                            print("key found in body")
                            print(body['key'])
                            key = body['key']
                        
                        key = body['key'] if 'key' in body else None
                        return get_item(body['id'], key)
                    else:
                        return {
                            "statusCode": 400,
                            "body": json.dumps("Missing 'id' in the request body")
                        }
                else:
                    return password_auth_result
            elif body and 'action' in body and body['action'] == 'create_item':
                if 'id' in body and 'data' in body:
                    return create_item(body)
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id' or 'data' in the request body")
                    }
            elif body and 'action' in body and body['action'] == 'add_request':
                password_auth_result = check_password(body['id'], body['password'])
                if(password_auth_result == True):
                    if 'requests' in body and 'id' in body:
                        return add_request(body['id'], body['requests'])
                    else:
                        return {
                            "statusCode": 400,
                            "body": json.dumps("Missing 'requests' or 'id' in the request body")
                        }
                else:
                    return password_auth_result
            elif body and 'action' in body and body['action'] == 'add_response':
                password_auth_result = check_password(body['id'], body['password'])
                if(password_auth_result == True):
                    if 'requests' in body and 'id' in body:
                        return add_response(body['id'], body['requests'])
                    else:
                        return {
                            "statusCode": 400,
                            "body": json.dumps("Missing 'requests' or 'id' in the request body")
                        }
                else:
                    return password_auth_result
            # Add handling for other POST actions here
            else:
                return {
                    "statusCode": 400,
                    "body": json.dumps("Invalid action for POST request")
                }

        elif http_method == 'PUT':
            password_auth_result = check_password(body['id'], body['password'])
            if(password_auth_result == True):
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
            else:
                return password_auth_result

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
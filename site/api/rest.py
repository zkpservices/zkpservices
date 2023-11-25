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

def get_item(item_id, chain_id, key=None):
    chain_data = get_full_data(item_id)

    # Check if the specified chain_id exists
    if chain_id in chain_data:
        data = chain_data[chain_id]['data']
        print(data)

        if key is None:
            return data
        else:
            print("getting nested value...")
            value = get_nested_value(data, key)
            print("value")
            return {key: value} if value is not None else {}

    return None


def login(item_id, password):
    # Authenticate the user
    password_auth_result = check_password(item_id, password)
    if not password_auth_result == True:
        return password_auth_result
    else:
        return {
                "statusCode": 200,
                "body": json.dumps("User authenticated successfully.")
            } 

    
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

import json
import boto3
from botocore.exceptions import ClientError

def delete_item(item_id, password, key):
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
    # Authenticate the user
    password_auth_result = check_password(item_id, old_password)
    if not password_auth_result == True:
        return password_auth_result

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
    existing_item = get_full_data(item_data['id'])

    if existing_item:
        return {
            "statusCode": 409,
            "body": "Item with the specified ID already exists"
        }
    
    try:
        # Initialize the user item with common user information
        user_item = {
            "id": item_data['id'],
            "password": item_data.get("password", ""),
            "2fa_password": item_data['2fa_password'],
            "contract_password": item_data['contract_password'],
            "rsa_enc_pub_key": item_data['rsa_enc_pub_key'],
            "rsa_enc_priv_key": item_data['rsa_enc_priv_key'],
            "rsa_sign_pub_key": item_data['rsa_sign_pub_key'],
            "rsa_sign_priv_key": item_data['rsa_sign_priv_key'],
            "userdata_check": item_data['userdata_check'],
            "rsa_enc_key_pub_check": item_data['rsa_enc_key_pub_check'],
            "rsa_sign_key_pub_check": item_data['rsa_sign_key_pub_check'],
        }

        # Create a "chain_data" dictionary to store chain-specific data
        chain_data = {}

        # Add data for each chain_id to the "chain_data" dictionary
        for chain_id in item_data['chain_data']:
            # Initialize chain-specific data
            body_data = item_data['chain_data'][chain_id]['data']
            available_dashboard = []
            for key in body_data.keys():
                if key not in available_dashboard:
                    available_dashboard.append(key)
            chain_item = {
                "data": item_data['chain_data'][chain_id]['data'],  # Chain-specific data
                "requests_received": [],  # Chain-specific requests_received
                "responses_received": [],  # Chain-specific responses_received
                "requests_sent": [],  # Chain-specific requests_sent
                "responses_sent": [],  # Chain-specific responses_sent
                "dashboard": [],
                "available_dashboard": available_dashboard,
                "crosschain_transactions": []
            }


            # Add "last_updated" timestamp to immediate child records under "data"
            for key in chain_item['data']:
                chain_item['data'][key]['last_updated'] = str(int(time.time()))

            # # If the user has crosschain_transactions, add them
            # if "crosschain_transactions" in item_data['chain_data'][chain_id]:
            #     chain_item['crosschain_transactions'] = item_data['chain_data'][chain_id]['crosschain_transactions']

            chain_data[chain_id] = chain_item

        # Add the "chain_data" dictionary to the user item
        user_item["chain_data"] = chain_data

        # Set the last_updated for the entire user_item
        user_item['last_updated'] = str(int(time.time()))

        # Add the user item to the table
        response = table.put_item(Item=user_item)

        return "Item created successfully!"
    except Exception as e:
        return str(e)

def get_full_data(item_id):
    response = table.get_item(Key={"id": item_id})
    item = response.get("Item", None)

    if item and "chain_data" in item:
        return item["chain_data"]
    else:
        return None




def update_item(id, password, chain_id, body):
    # Authenticate the user
    password_auth_result = check_password(id, password)
    if not password_auth_result == True:
        return password_auth_result

    try:
        item_id = id
        if not item_id:
            return {
                "statusCode": 400,
                "body": json.dumps("Missing 'id' in the request body")
            }

        # Fetch the existing item from the database
        existing_item = get_full_data(item_id)
        if not existing_item:
            return {
                "statusCode": 404,
                "body": json.dumps("Item not found")
            }

        # Fetch the existing "available_dashboard" list specific to the chain
        existing_available_dashboard = existing_item[chain_id].get("available_dashboard", [])

        # Update the "available_dashboard" list with keys from the "body" object
        for key in body.keys():
            if key not in existing_available_dashboard:
                existing_available_dashboard.append(key)

        for key in body:
            if key != 'chain_id':
                body[key]['last_updated'] = str(int(time.time()))

        # Merge the new data into the existing data for the specified chain
        existing_data = existing_item[chain_id]['data']
        merged_data = update_json(existing_data, body)

        # Update the "last_updated" timestamp for the parent key in the "data" column
        if 'last_updated' not in existing_data:
            existing_data['last_updated'] = str(int(time.time()))

        # Update the item in the database
        response = table.update_item(
            Key={"id": item_id},
            UpdateExpression=f"set #chain_data.#chain_id.#data = :data, #chain_data.#chain_id.#available_dashboard = :available_dashboard",
            ExpressionAttributeNames={
                "#chain_data": "chain_data",
                "#chain_id": chain_id,
                "#data": "data",
                "#available_dashboard": "available_dashboard"
            },
            ExpressionAttributeValues={
                ":data": merged_data,
                ":available_dashboard": existing_available_dashboard
            },
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



def add_request(sender_id, request, password):
    # Authenticate the user
    password_auth_result = check_password(sender_id, password)
    if not password_auth_result == True:
        return password_auth_result
    try:

        chain_id = request['chainID']

        # Get sender's data from the database
        sender_data = get_full_data(sender_id)

        if not sender_data:
            return {
                "statusCode": 404,
                "body": json.dumps("Sender not found")
            }

        # Extract receiver's address from the requests object
        receiver_id = request['address_receiver']

        # Get receiver's data from the database
        receiver_data = get_full_data(receiver_id)

        if not receiver_data:
            return {
                "statusCode": 404,
                "body": json.dumps("Receiver not found")
            }
        

        # Update sender's sent_requests
        sender_chain_data = sender_data[chain_id]
        sender_requests_sent = sender_chain_data['requests_sent']
        sender_requests_sent.append(request)
        
        sender_data[chain_id]['requests_sent'] = sender_requests_sent

        # Update receiver's received_requests
        receiver_chain_data = receiver_data[chain_id]
        receiver_requests_received = receiver_chain_data['requests_received']
        receiver_requests_received.append(request)
        receiver_data[chain_id]['requests_received'] = receiver_requests_received
        # Update sender's and receiver's data in the database
        response = table.update_item(
            Key={"id": sender_id},
            UpdateExpression="set #chain_data = :chain_data",
            ExpressionAttributeNames={"#chain_data": "chain_data"},
            ExpressionAttributeValues={":chain_data": sender_data}
        )
        response = table.update_item(
            Key={"id": receiver_id},
            UpdateExpression="set #chain_data = :chain_data",
            ExpressionAttributeNames={"#chain_data": "chain_data"},
            ExpressionAttributeValues={":chain_data": receiver_data}
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


def add_response(sender_id, response, password):
    # Authenticate the user
    password_auth_result = check_password(sender_id, password)
    if not password_auth_result == True:
        return password_auth_result
    try:
        chain_id = response['chainID']

        # Get sender's data from the database
        sender_data = get_full_data(sender_id)

        if not sender_data:
            return {
                "statusCode": 404,
                "body": json.dumps("Sender not found")
            }

        # Extract receiver's address from the response object
        receiver_id = response['address_receiver']

        # Get receiver's data from the database
        receiver_data = get_full_data(receiver_id)

        if not receiver_data:
            return {
                "statusCode": 404,
                "body": json.dumps("Receiver not found")
            }
        
        # Update sender's sent_responses
        sender_chain_data = sender_data[chain_id]
        sender_responses_sent = sender_chain_data['responses_sent']
        sender_responses_sent.append(response)
        
        sender_data[chain_id]['responses_sent'] = sender_responses_sent

        # Update receiver's received_responses
        receiver_chain_data = receiver_data[chain_id]
        receiver_responses_received = receiver_chain_data['responses_received']
        receiver_responses_received.append(response)
        receiver_data[chain_id]['responses_received'] = receiver_responses_received

        # Update sender's and receiver's data in the database
        response = table.update_item(
            Key={"id": sender_id},
            UpdateExpression="set #chain_data = :chain_data",
            ExpressionAttributeNames={"#chain_data": "chain_data"},
            ExpressionAttributeValues={":chain_data": sender_data}
        )
        response = table.update_item(
            Key={"id": receiver_id},
            UpdateExpression="set #chain_data = :chain_data",
            ExpressionAttributeNames={"#chain_data": "chain_data"},
            ExpressionAttributeValues={":chain_data": receiver_data}
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

def get_available_dashboard(item_id, password, chain_id):
    # Authenticate the user
    password_auth_result = check_password(item_id, password)
    if not password_auth_result == True:
        return password_auth_result
    try:
        # Query the DynamoDB table to fetch the available_dashboard attribute
        response = get_full_data(item_id)

        item = response[chain_id]
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

def get_dashboard(item_id, password, chain_id):
    # Authenticate the user
    password_auth_result = check_password(item_id, password)
    if not password_auth_result == True:
        return password_auth_result
    try:

        # Query the DynamoDB table to fetch the "dashboard" attribute
        response = get_full_data(item_id)
        item = response[chain_id]

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

def add_to_dashboard(item_id, service, password, chain_id):
    # Authenticate the user
    password_auth_result = check_password(item_id, password)
    if not password_auth_result == True:
        return password_auth_result
    try:

        response = get_full_data(item_id)
        item = response[chain_id]

        if not item or "available_dashboard" not in item:
            return {
                "statusCode": 404,
                "body": json.dumps("Available dashboard not found")
            }

        # Retrieve the "available_dashboard" list from the item
        available_dashboard = item.get('available_dashboard', [])


        if not service or "dashboard" not in item:
            return {
                "statusCode": 404,
                "body": json.dumps("Dashboard not found")
            }
        dashboard = item.get('dashboard', [])

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

        response[chain_id]['dashboard'] = dashboard

        # Update the "dashboard" list in DynamoDB
        response = table.update_item(
            Key={"id": item_id},
            UpdateExpression="SET chain_data = :chain_data",
            ExpressionAttributeValues={":chain_data": response}
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

def remove_from_dashboard(item_id, service, password, chain_id):
    # Authenticate the user
    password_auth_result = check_password(item_id, password)
    if not password_auth_result == True:
        return password_auth_result
    try:
        # Query the DynamoDB table to fetch the "dashboard" attribute
        response = get_full_data(item_id)
        item = response[chain_id]
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

        response[chain_id]['dashboard'] = dashboard

        # Update the "dashboard" list in DynamoDB
        response = table.update_item(
            Key={"id": item_id},
            UpdateExpression="SET chain_data = :chain_data",
            ExpressionAttributeValues={":chain_data": response}
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

def add_crosschain_transaction(id, crosschain_transaction, password, chain_id):
    # Authenticate the user
    password_auth_result = check_password(id, password)
    if not password_auth_result == True:
        return password_auth_result

    try:
        # Get user's data from the database
        user_data = get_full_data(id)

        if not user_data:
            return {
                "statusCode": 404,
                "body": json.dumps("User not found")
            }

        # Load the existing cctx data as a list
        cctx = user_data[chain_id]['crosschain_transactions']
        
        # Update the new transaction with a "last_updated" timestamp
        crosschain_transaction['last_updated'] = str(int(time.time()))
        
        # Append the new transaction to the list
        cctx.append(crosschain_transaction)
        user_data[chain_id]['crosschain_transactions'] = cctx

        # Update cctx's in the database
        response = table.update_item(
            Key={"id": id},
            UpdateExpression="set #chain_data = :chain_data",
            ExpressionAttributeNames={"#chain_data": "chain_data"},
            ExpressionAttributeValues={":chain_data": user_data}
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



def get_crosschain_transaction(id, password, chain_id):
    # Authenticate the user
    password_auth_result = check_password(id, password)
    if not password_auth_result == True:
        return password_auth_result
    try:
        # Query the DynamoDB table to fetch the "crosschain_transactions" attribute
        response = get_full_data(id)[chain_id]
        if not response or "crosschain_transactions" not in response:
            return {
                "statusCode": 404,
                "body": json.dumps("Crosschain transactions list not found")
            }

        # Retrieve the "crosschain_transactions" list from the item
        cctx = response.get('crosschain_transactions', [])
        return {
            "statusCode": 200,
            "body": json.dumps(cctx)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }
        
def get_incoming(id, password, chain_id):
    # Authenticate the user
    password_auth_result = check_password(id, password)
    if not password_auth_result == True:
        return password_auth_result

    try:
        full_data = get_full_data(id)

        if not full_data:
            return {
                "statusCode": 404,
                "body": json.dumps("User not found")
            }

        item = full_data[chain_id]

        # Retrieve the "requests_received" and "responses_received" lists from the item
        requests_received = item.get('requests_received', [])
        responses_received = item.get('responses_received', [])

        # Combine the two lists into one
        incoming_data = {
            "requests_received": requests_received,
            "responses_received": responses_received
        }

        return {
            "statusCode": 200,
            "body": json.dumps(incoming_data)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }

def get_outgoing(id, password, chain_id):
    # Authenticate the user
    password_auth_result = check_password(id, password)
    if not password_auth_result == True:
        return password_auth_result

    try:
        full_data = get_full_data(id)

        if not full_data:
            return {
                "statusCode": 404,
                "body": json.dumps("User not found")
            }

        item = full_data[chain_id]

        requests_received = item.get('requests_sent', [])
        responses_received = item.get('responses_sent', [])

        # Combine the two lists into one
        incoming_data = {
            "requests_sent": requests_received,
            "responses_sent": responses_received
        }

        return {
            "statusCode": 200,
            "body": json.dumps(incoming_data)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }


def handler(event, context):
    event = json.dumps(event)
    event = json.loads(event)
    print("event")
    print(event)
    request_context = event['requestContext']
    http_method = request_context["http"]["method"]
    if http_method == 'OPTIONS':
        return {
            "statusCode": 200,
        }
    try:
        inner_body = json.loads(event['body'])
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
                        return get_item(body['id'], body['chain_id'], key)
                    else:
                        return {
                            "statusCode": 400,
                            "body": json.dumps("Missing 'id' in the request body")
                        }

            elif body and 'action' in body and body['action'] == 'create_item':
                if 'id' in body and 'chain_data' in body:
                    return create_item(body)
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id' or 'chain_data' in the request body")
                    }
            elif body and 'action' in body and body['action'] == 'login':
                if 'id' in body and 'password' in body:
                    return login(body['id'], body['password'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id' or 'password' in the request body")
                    }
            elif body and 'action' in body and body['action'] == 'add_request':
                if 'request' in body and 'id' in body:
                    return add_request(body['id'], body['request'], body['password'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'request' or 'id' in the request body")
                    }

            elif body and 'action' in body and body['action'] == 'add_response':
                if 'response' in body and 'id' in body:
                    return add_response(body['id'], body['response'], body['password'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'response' or 'id' in the request body")
                    }

            elif body['action'] == 'get_available_dashboard':
                if 'id' in body:
                    return get_available_dashboard(body['id'], body['password'], body['chain_id'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id' or 'password' in the request body")
                    }

            elif body['action'] == 'get_dashboard':
                if 'id' in body:
                    return get_dashboard(body['id'], body['password'], body['chain_id'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id' or 'password' in the request body")
                    }

            elif body['action'] == 'add_to_dashboard':
                if 'id' in body and 'password' in body and 'service' in body:
                    return add_to_dashboard(body['id'], body['service'], body['password'], body['chain_id'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id', 'password', or 'service' in the request body")
                        }
            elif body['action'] == 'add_crosschain_transaction':
                if 'id' in body:
                    return add_crosschain_transaction(body['id'], body['transaction'], body['password'], body['chain_id'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id', 'transaction' or 'password' in the request body")
                        }
            elif body['action'] == 'get_crosschain_transaction':
                if 'id' in body:
                    return get_crosschain_transaction(body['id'], body['password'], body['chain_id'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id' or 'password' in the request body")
                        }
            elif body['action'] == 'get_incoming':
                if 'id' in body:
                    return get_incoming(body['id'], body['password'], body['chain_id'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id' or 'password' in the request body")
                        }
            elif body['action'] == 'get_outgoing':
                if 'id' in body:
                    return get_outgoing(body['id'], body['password'], body['chain_id'])
                else:
                    return {
                        "statusCode": 400,
                        "body": json.dumps("Missing 'id' or 'password' in the request body")
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
                    return update_item(body['id'], body['password'], body['chain_id'], body['data'])
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
                        return remove_from_dashboard(body['id'], body['service'], body['password'], body['chain_id'])
                    else:
                        return {
                            "statusCode": 400,
                            "body": json.dumps("Missing 'id', 'password', or 'service' in the request body")
                        }
                elif body['action'] == 'delete_item':
                    if 'id' in body and 'password' in body and 'key' in body:
                        return delete_item(body['id'], body['password'], body['key'])
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
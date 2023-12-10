// APICalls.jsx

// Import the Axios library for making HTTP requests
import axios from 'axios';

// Base URL for the API calls
const API_BASE_URL = 'https://api.zkp.services/userdata';

// Counter to keep track of the number of API calls made
let api_call_count = 0;

// Function to make an API call using Axios
export const makeAPICall = async (method, data) => {
  // Increment the API call count
  api_call_count++;

  try {
    // Make the API call using Axios
    const response = await axios({
      method,
      url: `${API_BASE_URL}`,
      data,
    }).then((res) => {
      return res;
    });

    // Return the response from the API call
    return response;
  } catch (error) {
    // Handle errors (e.g., show a toast message or perform other error handling)
    throw error;
  }
}

// Function to login a user
export const login = async (userId, password) => { 
  // Prepare data for the login API call
  const data = {
    id: userId,
    password: password,
    action: 'login',
  };

  // Make the API call using the common makeAPICall function with POST method
  return await makeAPICall('POST', data);
}

// Function to create a user
export const createUser = async (userId, quickstart_JSON) => { 
  // Prepare data for creating a user API call
  const data = {
    id: userId,
    action: 'create_item',
  };

  // Merge additional data from quickstart_JSON with the base data
  const mergedData = {
    ...data,
    ...quickstart_JSON,
  };

  // Make the API call using the common makeAPICall function with POST method
  return makeAPICall('POST', mergedData);
}


// export const getUser = async (userId, password) => {
//   const data = {
//     "id": userId,
//     "password": password,
//     "action": "get_item",
//     "key": "id.name"
//   }
//   return makeAPICall('POST', data);
// };

// Function to retrieve cross-chain transaction data
export const getCCTX = async (userId, password, chainId) => { 
  // Prepare data for the cross-chain transaction API call
  const data = {
    id: userId,
    password: password,
    chain_id: chainId,
    action: 'get_crosschain_transaction',
  };

  // Make the API call using the common makeAPICall function with POST method
  return makeAPICall('POST', data);
}

// Function to retrieve incoming data for a specific chain
export const getIncoming = async (userId, password, chainId) => { 
  // Prepare data for the incoming data API call
  const data = {
    id: userId,
    password: password,
    action: 'get_incoming',
    chain_id: chainId,
  };

  // Make the API call using the common makeAPICall function with POST method
  return makeAPICall('POST', data);
}

// Function to retrieve outgoing data for a specific chain
export const getOutgoing = async (userId, password, chainId) => { 
  // Prepare data for the outgoing data API call
  const data = {
    id: userId,
    password: password,
    action: 'get_outgoing',
    chain_id: chainId,
  };

  // Make the API call using the common makeAPICall function with POST method
  return makeAPICall('POST', data);
}


export const truncateAddress = (address) => {
  if (!address) return ''
  const start = address.substring(0, 6)
  const end = address.substring(address.length - 3)
  return `${start}...${end}`
}

// Function to retrieve field data for a specific key and chain
export const getFieldData = async (userId, password, key, chainId) => { 
  // Prepare data for the field data API call
  const data = {
    id: userId,
    password: password,
    action: 'get_item',
    key: key,
    chain_id: chainId,
  };

  // Make the API call using the common makeAPICall function with POST method
  return makeAPICall('POST', data);
}

// Function to retrieve dashboard data for a specific chain
export const getDashboard = async (userId, password, chainId) => { 
  // Prepare data for the dashboard data API call
  const data = {
    id: userId,
    password: password,
    action: 'get_dashboard',
    chain_id: chainId,
  };

  // Make the API call using the common makeAPICall function with POST method
  return makeAPICall('POST', data);
}

// Function to retrieve available dashboard data for a specific chain
export const getAvailableDashboard = async (userId, password, chainId) => { 
  // Prepare data for the available dashboard data API call
  const data = {
    id: userId,
    password: password,
    action: 'get_available_dashboard',
    chain_id: chainId,
  };

  // Make the API call using the common makeAPICall function with POST method
  return makeAPICall('POST', data);
}


// Function to add a service to the user's dashboard
export const addToDashboard = async (userId, password, service, chainId) => { 
  // Prepare data for the add to dashboard API call
  const data = {
    id: userId,
    password: password,
    action: 'add_to_dashboard',
    service: service,
    chain_id: chainId,
  };

  // Make the API call using the common makeAPICall function with POST method
  return makeAPICall('POST', data);
}

// Function to remove a service from the user's dashboard
export const removeFromDashboard = async ( 
  userId,
  password,
  service,
  chainId,
) => {
  // Prepare data for the remove from dashboard API call
  const data = {
    id: userId,
    password: password,
    action: 'remove_from_dashboard',
    service: service,
    chain_id: chainId,
  };

  // Make the API call using the common makeAPICall function with DELETE method
  return makeAPICall('DELETE', data);
}


// Function to add a request for a specific chain
export const addRequest = async (userId, password, requestData, chainId) => { 
  // Prepare data for the add request API call
  const data = {
    id: userId,
    password: password,
    action: 'add_request',
    chainID: chainId,
  };

  // Merge additional data from requestData with the base data
  const mergedData = {
    ...data,
    ...requestData,
  };

  // Make the API call using the common makeAPICall function with POST method
  return makeAPICall('POST', mergedData);
}

// Function to add a response for a specific chain
export const addResponse = async (userId, password, responseData, chainId) => { 
  // Prepare data for the add response API call
  const data = {
    id: userId,
    password: password,
    action: 'add_response',
    chainID: chainId,
  };

  // Merge additional data from responseData with the base data
  const mergedData = {
    ...data,
    ...responseData,
  };

  // Make the API call using the common makeAPICall function with POST method
  return makeAPICall('POST', mergedData);
}


// Function to update field data for a specific chain
export const updateFieldData = async ( 
  userId,
  password,
  updatedData,
  chainId,
) => {
  // Prepare data for the update field data API call
  const data = {
    id: userId,
    password: password,
    action: 'update_item',
    chain_id: chainId,
  };

  // Merge additional data from updatedData with the base data
  const mergedData = {
    ...data,
    ...updatedData,
  };

  // Make the API call using the common makeAPICall function with PUT method
  return makeAPICall('PUT', mergedData);
}

// Function to retrieve chain data for a specific chain
export const getChainData = async (userId, password, chainId) => { 
  // Prepare data for the get chain data API call
  const data = {
    id: userId,
    password: password,
    chain_id: chainId,
    action: 'get_chain_data',
  };

  // Make the API call using the common makeAPICall function with POST method
  return makeAPICall('POST', data);
}

// Function to add a new chain
export const addNewChain = async (userId, password, oldChainId, chainId) => { 
  // Prepare data for the add new chain API call
  const data = {
    id: userId,
    password: password,
    chain_id: chainId,
    old_chain_id: oldChainId,
    action: 'add_new_chain',
  };

  // Make the API call using the common makeAPICall function with POST method
  return makeAPICall('POST', data);
}

// Function to add a new cross-chain transaction
export const addCCTX = async ( 
  userId,
  password,
  type,
  paramKey,
  sourceChain,
  targetChain,
  ccid,
) => {
  // Prepare data for adding a cross-chain transaction API call
  const data = {
    id: userId,
    password: password,
    target_chain_id: targetChain,
    source_chain_id: sourceChain,
    action: 'add_crosschain_transaction',
    param_key: paramKey,
    type: type,
    ccid: ccid,
  };
  // Make the API call and return the result
  return makeAPICall('POST', data);
}


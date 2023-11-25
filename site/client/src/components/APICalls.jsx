// APICalls.jsx

import axios from 'axios';

const API_BASE_URL = 'https://y1oeimdo63.execute-api.us-east-1.amazonaws.com/userdata';

export const makeAPICall = async (method, data) => {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}`,
      data,
    }).then(res => {
      return res;
    })
    return response
  } catch (error) {
    // Handle errors (e.g., show a toast message or perform other error handling)
    throw error;
  }
};

// You can create more specific functions for different API endpoints
export const login = async (userId, password) => {
  console.log(`logging in with the following data, userId: ${userId}`)
  const data = {
    "id": userId,
    "password": password,
    "action": "login"
  }
  return await makeAPICall('POST', data);
};

export const createUser = async (userId, quickstart_JSON) => {
  const data = {
    "id": userId,
    "action": "create_item"
  }
  const mergedData = {
    ...data,
    ...quickstart_JSON
  }
  console.log(mergedData)
  return makeAPICall('POST', mergedData);
};

// export const getUser = async (userId, password) => {
//   const data = {
//     "id": userId,
//     "password": password,
//     "action": "get_item",
//     "key": "id.name"
//   }
//   return makeAPICall('POST', data);
// };

export const getCCTX = async (userId, password, chainId) => {
  const data = {
    "id": userId,
    "password": password,
    "chain_id": chainId,
    "action": "get_crosschain_transaction",
  }
  return makeAPICall('POST', data);
};

export const getIncoming = async (userId, password, chainId) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "get_incoming",
    "chain_id": chainId
  }
  return makeAPICall('POST', data);
};

export const getOutgoing = async (userId, password, chainId) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "get_outgoing",
    "chain_id": chainId
  }
  return makeAPICall('POST', data);
};

export const truncateAddress = (address) => {
  if (!address) return '';
  const start = address.substring(0, 6);
  const end = address.substring(address.length - 3);
  return `${start}...${end}`;
}

export const getFieldData = async (userId, password, key, chainId) => {
  console.log(`getFieldData params: ${userId}, ${password}, ${key}, ${chainId}`)
  const data = {
    "id": userId,
    "password": password,
    "action": "get_item",
    "key": key,
    "chain_id": chainId
  }
  return makeAPICall('POST', data);
};

export const getDashboard = async (userId, password, chainId) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "get_dashboard",
    "chain_id": chainId
  }
  return makeAPICall('POST', data);
};

export const getAvailableDashboard = async (userId, password, chainId) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "get_available_dashboard",
    "chain_id": chainId
  }
  return makeAPICall('POST', data);
};

export const addToDashboard = async (userId, password, service, chainId) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "add_to_dashboard",
    "service": service,
    "chain_id": chainId
  }
  return makeAPICall('POST', data);
};

export const removeFromDashboard = async (userId, password, service, chainId) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "remove_from_dashboard",
    "service": service,
    "chain_id": chainId
  }
  return makeAPICall('DELETE', data);
};

export const addRequest = async (userId, password, requestData, chainId) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "add_request",
    "chainID": chainId
  }
  const mergedData = {
    ...data,
    ...requestData
  }
  console.log(`API Calls merged request data ${JSON.stringify(mergedData, null, 2)}`)
  return makeAPICall('POST', mergedData);
};

export const addResponse = async (userId, password, responseData, chainId) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "add_response",
    "chainID": chainId
  }
  const mergedData = {
    ...data,
    ...responseData
  }
  console.log(mergedData)
  return makeAPICall('POST', mergedData);
};

export const updateFieldData = async (userId, password, updatedData, chainId) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "update_item",
    "chain_id": chainId
  }
  const mergedData = {
    ...data,
    ...updatedData
  }
  console.log(`Ready to update item ${JSON.stringify(mergedData, null, 2)}`)
  return makeAPICall('PUT', mergedData);
};

export const getChainData = async (userId, password, chainId) => {
  const data = {
    "id": userId,
    "password": password,
    "chain_id": chainId,
    "action": "get_chain_data",
  }
  return makeAPICall('POST', data);
};
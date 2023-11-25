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
  const data = {
    "id": userId,
    "password": password,
    "action": "login"
  }
  return await makeAPICall('POST', data);
};

export const createUser = async (userId, password, quickstart_JSON) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "create_item"
  }
  const mergedData = {
    ...data,
    ...quickstart_JSON
  }
  return makeAPICall('POST', mergedData);
};

export const getUser = async (userId, password) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "get_item",
    "key": "id.name"
  }
  return makeAPICall('POST', data);
};

export const getCCTX = async (userId, password) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "get_crosschain_transaction",
  }
  return makeAPICall('POST', data);
};

export const getIncoming = async (userId, password) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "get_incoming",
  }
  return makeAPICall('POST', data);
};

export const getOutgoing = async (userId, password) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "get_outgoing",
  }
  return makeAPICall('POST', data);
};

export const truncateAddress = (address) => {
  if (!address) return '';
  const start = address.substring(0, 6);
  const end = address.substring(address.length - 3);
  return `${start}...${end}`;
}

export const getFieldData = async (userId, password, key) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "get_item",
    "key": key
  }
  return makeAPICall('POST', data);
};

export const getDashboard = async (userId, password) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "get_dashboard",
  }
  return makeAPICall('POST', data);
};

export const getAvailableDashboard = async (userId, password) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "get_available_dashboard",
  }
  return makeAPICall('POST', data);
};

export const addToDashboard = async (userId, password, service) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "add_to_dashboard",
    "service": service
  }
  return makeAPICall('POST', data);
};

export const removeFromDashboard = async (userId, password, service) => {
  const data = {
    "id": userId,
    "password": password,
    "action": "remove_from_dashboard",
    "service": service
  }
  return makeAPICall('DELETE', data);
};
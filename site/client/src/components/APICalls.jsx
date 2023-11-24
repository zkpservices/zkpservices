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
  return makeAPICall('POST', data);
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


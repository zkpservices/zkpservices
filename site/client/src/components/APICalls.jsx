// APICalls.jsx

import axios from 'axios'

const API_BASE_URL =
  'https://api.zkp.services/userdata'

let api_call_count = 0

export const makeAPICall = async (method, data) => {
  api_call_count++
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}`,
      data,
    }).then((res) => {
      return res
    })
    return response
  } catch (error) {
    // Handle errors (e.g., show a toast message or perform other error handling)
    throw error
  }
}

export const login = async (userId, password) => { //error notifs handled
  const data = {
    id: userId,
    password: password,
    action: 'login',
  }
  return await makeAPICall('POST', data)
}

export const createUser = async (userId, quickstart_JSON) => { //error notifs handled
  const data = {
    id: userId,
    action: 'create_item',
  }
  const mergedData = {
    ...data,
    ...quickstart_JSON,
  }
  return makeAPICall('POST', mergedData)
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

export const getCCTX = async (userId, password, chainId) => { //error notifs handled
  const data = {
    id: userId,
    password: password,
    chain_id: chainId,
    action: 'get_crosschain_transaction',
  }
  return makeAPICall('POST', data)
}

export const getIncoming = async (userId, password, chainId) => { //error notifs handled
  const data = {
    id: userId,
    password: password,
    action: 'get_incoming',
    chain_id: chainId,
  }
  return makeAPICall('POST', data)
}

export const getOutgoing = async (userId, password, chainId) => { //error notifs handled
  const data = {
    id: userId,
    password: password,
    action: 'get_outgoing',
    chain_id: chainId,
  }
  return makeAPICall('POST', data)
}

export const truncateAddress = (address) => {
  if (!address) return ''
  const start = address.substring(0, 6)
  const end = address.substring(address.length - 3)
  return `${start}...${end}`
}

export const getFieldData = async (userId, password, key, chainId) => { //error notifs handled
  const data = {
    id: userId,
    password: password,
    action: 'get_item',
    key: key,
    chain_id: chainId,
  }
  return makeAPICall('POST', data)
}

export const getDashboard = async (userId, password, chainId) => { //error notifs handled
  const data = {
    id: userId,
    password: password,
    action: 'get_dashboard',
    chain_id: chainId,
  }
  return makeAPICall('POST', data)
}

export const getAvailableDashboard = async (userId, password, chainId) => { //error notifs handled
  const data = {
    id: userId,
    password: password,
    action: 'get_available_dashboard',
    chain_id: chainId,
  }
  return makeAPICall('POST', data)
}

export const addToDashboard = async (userId, password, service, chainId) => { //error notifs handled
  const data = {
    id: userId,
    password: password,
    action: 'add_to_dashboard',
    service: service,
    chain_id: chainId,
  }
  return makeAPICall('POST', data)
}

export const removeFromDashboard = async ( //error notifs handled
  userId,
  password,
  service,
  chainId,
) => {
  const data = {
    id: userId,
    password: password,
    action: 'remove_from_dashboard',
    service: service,
    chain_id: chainId,
  }
  return makeAPICall('DELETE', data)
}

export const addRequest = async (userId, password, requestData, chainId) => { //error notifs handled
  const data = {
    id: userId,
    password: password,
    action: 'add_request',
    chainID: chainId,
  }
  const mergedData = {
    ...data,
    ...requestData,
  }
  return makeAPICall('POST', mergedData)
}

export const addResponse = async (userId, password, responseData, chainId) => { //error notifs handled
  const data = {
    id: userId,
    password: password,
    action: 'add_response',
    chainID: chainId,
  }
  const mergedData = {
    ...data,
    ...responseData,
  }
  return makeAPICall('POST', mergedData)
}

export const updateFieldData = async ( //error notifs handled
  userId,
  password,
  updatedData,
  chainId,
) => {
  const data = {
    id: userId,
    password: password,
    action: 'update_item',
    chain_id: chainId,
  }
  const mergedData = {
    ...data,
    ...updatedData,
  }
  return makeAPICall('PUT', mergedData)
}

export const getChainData = async (userId, password, chainId) => { //error notifs handled
  const data = {
    id: userId,
    password: password,
    chain_id: chainId,
    action: 'get_chain_data',
  }
  return makeAPICall('POST', data)
}

export const addNewChain = async (userId, password, oldChainId, chainId) => { //error notifs handled
  const data = {
    id: userId,
    password: password,
    chain_id: chainId,
    old_chain_id: oldChainId,
    action: 'add_new_chain',
  }
  return makeAPICall('POST', data)
}

export const addCCTX = async ( //error notifs handled
  userId,
  password,
  type,
  paramKey,
  sourceChain,
  targetChain,
  ccid,
) => {
  const data = {
    id: userId,
    password: password,
    target_chain_id: targetChain,
    source_chain_id: sourceChain,
    action: 'add_crosschain_transaction',
    param_key: paramKey,
    type: type,
    ccid: ccid,
  }
  return makeAPICall('POST', data)
}

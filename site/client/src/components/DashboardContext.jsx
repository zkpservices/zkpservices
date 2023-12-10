import Web3 from 'web3'
import { useEffect, useRef, useState, useContext } from 'react'
import { UserData } from '@/components/UserData'
import { Services } from '@/components/Services'
import { History } from '@/components/History'
import { useGlobal } from '@/components/GlobalStorage'
import {
  getCCTX,
  getIncoming,
  getOutgoing,
  truncateAddress,
  getDashboard,
  getChainData,
} from '@/components/APICalls'
import coreContractABI from '../../public/contract_ABIs/ZKPServicesCore.json'
import twoFAContractVRFABI from '../../public/contract_ABIs/ZKPServicesVRF2FA.json'
import twoFAContractGenericABI from '../../public/contract_ABIs/ZKPServicesGeneric2FA.json'
import batchSignUpABI from '../../public/contract_ABIs/BatchSignUp.json'

export function DashboardContext() {
  let {
    walletConnected,
    userAddress,
    showLoginNotification,
    setShowLoginNotification,
    loggedIn,
    userPassword,
    username,
    setUsername,
    dashboard,
    chainId,
    setDashboard,
    web3,
    setWeb3,
    setContractPassword,
    setTwoFactorAuthPassword,
    setFujiCoreContract,
    setFujiTwoFAContract,
    setFujiBatchSignUpContract,
    setMumbaiCoreContract,
    setMumbaiTwoFAContract,
    setMumbaiBatchSignUpContract,
    setRippleCoreContract,
    setRippleTwoFAContract,
    setRippleBatchSignUpContract,
    fujiCoreContract,
    mumbaiCoreContract,
    rippleCoreContract,
    fujiTwoFAContract,
    mumbaiTwoFAContract,
    rippleTwoFAContract,
    fujiBatchSignUpContract,
    mumbaiBatchSignUpContract,
    rippleBatchSignUpContract,
    isOnboarding,
    onboardedChain,
    setOnboardedChain,
    metamaskAvailable,
    setMetamaskAvailable,
    apiErrorNotif,
    setApiErrorNotif,
    setApiErrorTopText,
    setApiErrorBottomText
  } = useGlobal()

  async function initializeWeb3() {
    // Check if MetaMask extension is available
    if (window.ethereum) {
      // MetaMask is available
      setMetamaskAvailable(true);
  
      // Initialize Web3 instance with MetaMask provider
      const web3Instance = new Web3(window.ethereum);
      web3 = web3Instance;
      setWeb3(web3Instance);
  
      // Ethereum core contract configurations for different networks
      const coreContractAbi = coreContractABI;
      const fujiCoreContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d';
      const mumbaiCoreContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d';
      const rippleCoreContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d';
  
      // Instantiate core contracts for different networks
      const fujiCoreContractInstance = new web3Instance.eth.Contract(
        coreContractAbi,
        fujiCoreContractAddress,
      );
      const mumbaiCoreContractInstance = new web3Instance.eth.Contract(
        coreContractAbi,
        mumbaiCoreContractAddress,
      );
      const rippleCoreContractInstance = new web3Instance.eth.Contract(
        coreContractAbi,
        rippleCoreContractAddress,
      );
  
      // Set contract instances and state variables
      fujiCoreContract = fujiCoreContractInstance;
      mumbaiCoreContract = mumbaiCoreContractInstance;
      rippleCoreContract = rippleCoreContractInstance;
  
      setFujiCoreContract(fujiCoreContractInstance);
      setMumbaiCoreContract(mumbaiCoreContractInstance);
      setRippleCoreContract(rippleCoreContractInstance);
  
      // Two-Factor Authentication (2FA) contract configurations for different networks
      const twoFAContractVRFAbi = twoFAContractVRFABI;
      const twoFAContractGenericAbi = twoFAContractGenericABI;
      const fujiTwoFAContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d';
      const mumbaiTwoFAContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d';
      const rippleTwoFAContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d';
  
      // Instantiate 2FA contracts for different networks
      const fujiTwoFAContractInstance = new web3Instance.eth.Contract(
        twoFAContractVRFAbi,
        fujiTwoFAContractAddress,
      );
      const mumbaiTwoFAContractInstance = new web3Instance.eth.Contract(
        twoFAContractVRFAbi,
        mumbaiTwoFAContractAddress,
      );
      const rippleTwoFAContractInstance = new web3Instance.eth.Contract(
        twoFAContractGenericAbi,
        rippleTwoFAContractAddress,
      );
  
      // Set 2FA contract instances and state variables
      fujiTwoFAContract = fujiTwoFAContractInstance;
      mumbaiTwoFAContract = mumbaiTwoFAContractInstance;
      rippleTwoFAContract = rippleTwoFAContractInstance;
  
      setFujiTwoFAContract(fujiTwoFAContractInstance);
      setMumbaiTwoFAContract(mumbaiTwoFAContractInstance);
      setRippleTwoFAContract(rippleTwoFAContractInstance);
  
      // Batch Sign-Up contract configurations for different networks
      const batchSignUpContractAbi = batchSignUpABI;
      const fujiBatchSignUpContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d';
      const mumbaiBatchSignUpContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d';
      const rippleBatchSignUpContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d';
  
      // Instantiate Batch Sign-Up contracts for different networks
      const fujiBatchSignUpContractInstance = new web3Instance.eth.Contract(
        batchSignUpContractAbi,
        fujiBatchSignUpContractAddress,
      );
      const mumbaiBatchSignUpContractInstance = new web3Instance.eth.Contract(
        batchSignUpContractAbi,
        mumbaiBatchSignUpContractAddress,
      );
      const rippleBatchSignUpContractInstance = new web3Instance.eth.Contract(
        batchSignUpContractAbi,
        rippleBatchSignUpContractAddress,
      );
  
      // Set Batch Sign-Up contract instances and state variables
      fujiBatchSignUpContract = fujiBatchSignUpContractInstance;
      mumbaiBatchSignUpContract = mumbaiBatchSignUpContractInstance;
      rippleBatchSignUpContract = rippleBatchSignUpContractInstance;
  
      setFujiBatchSignUpContract(fujiBatchSignUpContractInstance);
      setMumbaiBatchSignUpContract(mumbaiBatchSignUpContractInstance);
      setRippleBatchSignUpContract(rippleBatchSignUpContractInstance);
    } else {
      // MetaMask is not available
      setMetamaskAvailable(false);
    }
  }
  

// Initialize state variables for table data and user data fields
const [tableData, setTableData] = useState({
  Incoming: [],
  Outgoing: [],
  'Cross-Chain Sync': [],
});
const [userDataFields, setUserDataFields] = useState([]);

// Function to format incoming data for display in the table
function formatIncomingData(incomingRequests, incomingResponses, outgoingResponses) {
  // Format incoming requests
  const formattedRequests = incomingRequests.map((item) => {
    // Check if there is a matching response for the request
    const hasMatchingResponse = outgoingResponses.some((response) => {
      return response.responseID === item.requestID;
    });

    // Determine operation text based on the type of request
    const operationText = item.operation === 'update' ? 'Update Requested' : 'Data Requested';

    // Create formatted object for the request
    return {
      operation: [
        operationText,
        "By: " + truncateAddress(item.address_sender),
      ],
      field: [item.field, ` Owner: You`],
      status: hasMatchingResponse
        ? ['Response Sent', 'grey']
        : [item.operation === 'update' ? 'Complete Update' : 'Send Response', 'button'],
      details: ['View Details', `ID: ${truncateAddress(item.requestID)}`],
      type: item.operation === 'update' ? 'incoming_request_update' : 'incoming_request_get',
      // ... other properties
      lastUpdated: item.last_updated,
    };
  });

  // Format incoming responses
  const formattedResponses = incomingResponses.map((item) => {
    // Determine operation text based on the type of response
    const operationText = item.operation === 'update' ? 'Update Completed' : 'Data Received';

    // Create formatted object for the response
    return {
      operation: [
        operationText,
        (item.operation === 'update' ? 'By: ' : 'From: ') + truncateAddress(item.address_sender),
      ],
      field: [item.field, ` Owner: ${truncateAddress(item.address_sender)}`],
      status: ['Show Response', 'grey'],
      details: ['View Details', `ID: ${truncateAddress(item.responseID)}`],
      type: item.operation === 'update' ? 'incoming_response_update' : 'incoming_response_get',
      // ... other properties
      lastUpdated: item.last_updated,
    };
  });

  // Combine and sort incoming requests and responses by timestamp
  let allIncoming = [...formattedRequests, ...formattedResponses];
  return allIncoming.sort((a, b) => {
    const timestampA = parseInt(a.lastUpdated, 10);
    const timestampB = parseInt(b.lastUpdated, 10);
  
    // Compare timestamps in descending order (newest first)
    return timestampB - timestampA;
  });
}

// Function to format outgoing data for display in the table
function formatOutgoingData(outgoingRequests, outgoingResponses, incomingResponses) {
  // Format outgoing requests
  const formattedRequests = outgoingRequests.map((item) => {
    // Check if there is a matching response for the request
    const hasMatchingResponse = incomingResponses.some(
      (response) => response.responseID === item.requestID,
    );

    // Determine operation text based on the type of request
    const operationText = item.operation === 'update' ? 'Update Requested' : 'Data Requested';

    // Create formatted object for the request
    return {
      operation: [
        operationText,
        'By you',
      ],
      field: [item.field, 'From: ' + truncateAddress(item.address_receiver)],
      status: hasMatchingResponse
        ? ['Response Received', 'grey']
        : ['Awaiting Response', 'grey'],
      details: ['View Details', ` ID: ${truncateAddress(item.requestID)}`],
      type: item.operation === 'update' ? 'outgoing_request_update' : 'outgoing_request_get',
      // ... other properties
      lastUpdated: item.last_updated,
    };
  });

  // Format outgoing responses
  const formattedResponses = outgoingResponses.map((item) => {
    // Determine operation text based on the type of response
    const operationText = item.operation === 'update' ? 'Update Completed' : 'Data Sent';

    // Create formatted object for the response
    return {
      operation: [operationText, `By you`],
      field: [item.field, item.operation === 'update' ? null : 'To: ' + truncateAddress(item.address_receiver)],
      status: ['Response Sent', 'grey'],
      details: ['View Details',  `ID: ${truncateAddress(item.responseID)}`],
      type: item.operation === 'update' ? 'outgoing_response_update' : 'outgoing_response_get',
      // ... other properties
      lastUpdated: item.last_updated,
    };
  });

  // Combine and sort outgoing requests and responses by timestamp
  let allOutgoing = [...formattedRequests, ...formattedResponses];
  return allOutgoing.sort((a, b) => {
    const timestampA = parseInt(a.lastUpdated, 10);
    const timestampB = parseInt(b.lastUpdated, 10);
  
    // Compare timestamps in descending order (newest first)
    return timestampB - timestampA;
  });
}


  const paramToSyncDict = {
    'data': 'Data',
    'data_request': 'Data Request',
    'update_request': 'Update Request',
    'response': 'Response',
    'public_info': 'Public User Information',
    'rsa_enc_keys': 'RSA Encryption Keys',
    'rsa_sign_keys': 'RSA Signing Keys'
  }

// Asynchronously load user transaction history including Cross-Chain Sync data
async function loadAllHistory() {

  // Asynchronously fetches user transaction history data from the API
  async function fetchHistoryData() {
    try {
      // Fetch initial data from the API, including contract and 2FA passwords
      const initialData = await getChainData(userAddress, userPassword, chainId);
      setContractPassword(initialData['data']['props']['contract_password']);
      setTwoFactorAuthPassword(initialData['data']['props']['2fa_password']);

      try {
        // Fetch CCTX (Cross-Chain Transaction) data
        const cctxData = await getCCTX(userAddress, userPassword, chainId);
        const dataArray = cctxData['data'];

        // Attempt to parse the string into an array
        if (Array.isArray(dataArray)) {
          // The parsed data is an array

          // Mapping and transforming CCTX data for display in the table
          const chains = {
            '0xa869': 'Fuji',
            '0x13881': 'Mumbai',
            '0x15f902': 'Ripple Dev EVM',
          };
          const transformedData = dataArray.map((item) => ({
            operation: ['Sync Data'],
            field: [
              paramToSyncDict[item.parameter],
              `From: ${chains[item.source_chain]} to ${chains[item.target_chain]}`,
            ],
            status: ['Sync Completed', 'grey'],
            details: ['View Details', `CCIP ID: ${truncateAddress(item.ccid)}`],
            type: 'cctx',
            paramKey: item.parameter_key,
            paramType: paramToSyncDict[item.parameter],
            paramTypeRaw: item.parameter,
            sourceChain: item.source_chain,
            destinationChain: item.target_chain,
            ccid: item.ccid,
            lastUpdated: item.last_updated,
          }));

          // Sort CCTX data by timestamp in descending order (newest first)
          const sortedCCTX = transformedData.sort((a, b) => {
            const timestampA = parseInt(a.lastUpdated, 10);
            const timestampB = parseInt(b.lastUpdated, 10);
            return timestampB - timestampA;
          });

          // Update 'Cross-Chain Sync' data in the table state
          setTableData((prevTableData) => ({
            ...prevTableData,
            'Cross-Chain Sync': sortedCCTX,
          }));
        } else {
          // Handle the case where the data is not an array
          console.error('Data is not an array.');
        }
      } catch (error) {
        // Handle errors during CCTX data retrieval
        setApiErrorNotif(true);
        setApiErrorTopText("Error fetching CCTX");
        setApiErrorBottomText(error.toString());
        console.error('Error fetching CCTX', error);
      }

      // Fetch incoming and outgoing data
      const incoming = await getIncoming(userAddress, userPassword, chainId);
      const outgoing = await getOutgoing(userAddress, userPassword, chainId);
      const incomingRequests = incoming['data']['requests_received'];
      const outgoingRequests = outgoing['data']['requests_sent'];
      const incomingResponses = incoming['data']['responses_received'];
      const outgoingResponses = outgoing['data']['responses_sent'];

      // Format incoming and outgoing data for display in the table
      const incomingFinal = formatIncomingData(
        incomingRequests,
        incomingResponses,
        outgoingResponses,
      );
      const outgoingFinal = formatOutgoingData(
        outgoingRequests,
        outgoingResponses,
        incomingResponses,
      );

      // Update 'Incoming' and 'Outgoing' data in the table state
      setTableData((prevTableData) => ({
        ...prevTableData,
        Incoming: incomingFinal,
        Outgoing: outgoingFinal,
      }));

    } catch (error) {
      // Handle errors during the fetching of user data
      setApiErrorNotif(true);
      setApiErrorTopText("Error fetching user data");
      setApiErrorBottomText(error.toString());
      console.error('Error fetching user data:', error);
    }
  }

  // Call the fetchHistoryData function to initiate data retrieval
  fetchHistoryData();
}


  async function fetchUserDataFields() {
    try {
      const localdashboard = await getDashboard(
        userAddress,
        userPassword,
        chainId,
      )
      setDashboard(localdashboard['data'])
      setUserDataFields(localdashboard['data'])
      setOnboardedChain(true)
    } catch (error) {
      
      setApiErrorNotif(true)
      setApiErrorTopText('Error getting dashboard data')
      setApiErrorBottomText(error.toString())
      console.error('Error getting dashboard data:', error)
      setOnboardedChain(false)
    }
  }

  useEffect(() => {
    if (loggedIn && userAddress && chainId && !isOnboarding) {
      initializeWeb3()
      fetchUserDataFields()
      if (onboardedChain) {
        loadAllHistory()
      }
    }
  }, [loggedIn, userAddress, chainId])

  // useEffect(() => {
  //   loadAllHistory()
  //   fetchUserDataFields()
  // }, [chainId]);

  const removeField = (fieldToRemove) => {
    setUserDataFields(userDataFields.filter((i) => i !== fieldToRemove))
  }

  const addField = (fieldToAdd) => {
    setUserDataFields([...userDataFields, fieldToAdd])
  }

  return (
    <div>
      <UserData
        fieldNames={userDataFields}
        handleRemove={removeField}
        handleAdd={addField}
      />
      <Services useLink={false} handleRefresh={loadAllHistory} />
      <History
        tableData={tableData}
        showRefresh={true}
        handleRefresh={loadAllHistory}
      />
    </div>
  )
}
import Web3 from 'web3';
import { useEffect, useRef, useState, useContext } from 'react';
import { UserData }  from '@/components/UserData';
import { Services }  from '@/components/Services';
import { History } from '@/components/History'
import { useGlobal } from '@/components/GlobalStorage';
import { getCCTX, getIncoming, getOutgoing, truncateAddress, getDashboard } from '@/components/APICalls';
import coreContractABI from '../../public/contract_ABIs/ZKPServicesCore.json'; 
import twoFAContractVRFABI from '../../public/contract_ABIs/ZKPServicesVRF2FA.json'; 
import twoFAContractGenericABI from '../../public/contract_ABIs/ZKPServicesGeneric2FA.json'; 
import batchSignUpABI from '../../public/contract_ABIs/BatchSignUp.json'

export function DashboardContext() {
  let { walletConnected, userAddress, showLoginNotification, setShowLoginNotification, loggedIn, 
    userPassword, username, setUsername, dashboard, chainId, setDashboard, web3, setWeb3, 
    setFujiCoreContract, setFujiTwoFAContract, setFujiBatchSignUpContract, setMumbaiCoreContract,
    setMumbaiTwoFAContract, setMumbaiBatchSignUpContract, setRippleCoreContract, 
    setRippleTwoFAContract, setRippleBatchSignUpContract, fujiCoreContract, mumbaiCoreContract,
    rippleCoreContract, fujiTwoFAContract, mumbaiTwoFAContract, rippleTwoFAContract, fujiBatchSignUpContract,
    mumbaiBatchSignUpContract, rippleBatchSignUpContract } = useGlobal();  
  
  async function initializeWeb3(){
    //these are too large for local storage and need to be reinstantiated each time
    const web3Instance = new Web3(window.ethereum);
    web3 = web3Instance;
    setWeb3(web3Instance);

    const coreContractAbi = coreContractABI; 
    const fujiCoreContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 
    const mumbaiCoreContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 
    const rippleCoreContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 
    const fujiCoreContractInstance = new web3Instance.eth.Contract(coreContractAbi, fujiCoreContractAddress);
    const mumbaiCoreContractInstance = new web3Instance.eth.Contract(coreContractAbi, mumbaiCoreContractAddress);
    const rippleCoreContractInstance = new web3Instance.eth.Contract(coreContractAbi, rippleCoreContractAddress);
    fujiCoreContract = fujiCoreContractInstance;
    mumbaiCoreContract = mumbaiCoreContractInstance;
    rippleCoreContract = rippleCoreContractInstance;
    setFujiCoreContract(fujiCoreContractInstance);
    setMumbaiCoreContract(mumbaiCoreContractInstance);
    setRippleCoreContract(rippleCoreContractInstance);

    const twoFAContractVRFAbi = twoFAContractVRFABI;
    const twoFAContractGenericAbi = twoFAContractGenericABI;
    const fujiTwoFAContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 
    const mumbaiTwoFAContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 
    const rippleTwoFAContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 
    const fujiTwoFAContractInstance = new web3Instance.eth.Contract(twoFAContractVRFAbi, fujiTwoFAContractAddress);
    const mumbaiTwoFAContractInstance = new web3Instance.eth.Contract(twoFAContractVRFAbi, mumbaiTwoFAContractAddress);
    const rippleTwoFAContractInstance = new web3Instance.eth.Contract(twoFAContractGenericAbi, rippleTwoFAContractAddress);
    fujiTwoFAContract = fujiTwoFAContractInstance;
    mumbaiTwoFAContract = mumbaiTwoFAContractInstance;
    rippleTwoFAContract = rippleTwoFAContractInstance;
    setFujiTwoFAContract(fujiTwoFAContractInstance);
    setMumbaiTwoFAContract(mumbaiTwoFAContractInstance);
    setRippleTwoFAContract(rippleTwoFAContractInstance);

    const batchSignUpContractAbi = batchSignUpABI;
    const fujiBatchSignUpContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d';
    const mumbaiBatchSignUpContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d';
    const rippleBatchSignUpContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d';
    const fujiBatchSignUpContractInstance = new web3Instance.eth.Contract(batchSignUpContractAbi, fujiBatchSignUpContractAddress);
    const mumbaiBatchSignUpContractInstance = new web3Instance.eth.Contract(batchSignUpContractAbi, mumbaiBatchSignUpContractAddress);
    const rippleBatchSignUpContractInstance = new web3Instance.eth.Contract(batchSignUpContractAbi, rippleBatchSignUpContractAddress);
    fujiBatchSignUpContract = fujiBatchSignUpContractInstance;
    mumbaiBatchSignUpContract = mumbaiBatchSignUpContractInstance;
    rippleBatchSignUpContract = rippleBatchSignUpContractInstance;
    setFujiBatchSignUpContract(fujiBatchSignUpContractInstance);
    setMumbaiBatchSignUpContract(mumbaiBatchSignUpContractInstance);
    setRippleBatchSignUpContract(rippleBatchSignUpContractInstance);
  }

  const [tableData, setTableData] = useState({
    'Incoming': [],
    'Outgoing': [],
    'Cross-Chain Sync': []
  });
  const [userDataFields, setUserDataFields] = useState([])


  function formatIncomingData(incomingRequests, incomingResponses, outgoingResponses) {
    const formattedRequests = incomingRequests.map((item) => {
      const hasMatchingResponse = outgoingResponses.some(
        (response) => {
          // console.log(response)
          return response.responseID === item.requestID
        }
      );
      const operationText = item.operation === 'update' ? 'Update Requested' : 'Data Requested';
      return {
        operation: [operationText, `From: ${truncateAddress(item.address_sender)}`],
        field: [item.field, truncateAddress(item.address_receiver)],
        status: hasMatchingResponse ? ['Response Sent', 'grey'] : [item.operation === 'update' ? 'Complete Update' : 'Send Response', 'button'],
        details: ['View Details', truncateAddress(item.requestID)],
        type: item.operation === 'update' ? 'incoming_request_update' : 'incoming_request_get',
        requestID: item.requestID,
        addressSender: item.address_sender,
        data: item.operation === 'update' ? item.updated_data : item.data,
        addressSender: item.address_sender,
        salt: item.salt,
        limit: item.limit,
        key: item.key,
        response_fee: item.response_fee,
        require2FA: item.require2FA,
        twoFAProvider: item.twoFAProvider,
        twoFARequestID: item.twoFARequestID,
        twoFAOneTimeToken: item.twoFAOneTimeToken
      };
    });
  
    const formattedResponses = incomingResponses.map((item) => {
      const operationText = item.operation === 'update' ? 'Update Completed' : 'Data Received';
      return {
        operation: [operationText, `From: ${truncateAddress(item.address_sender)}`],
        field: [item.field, truncateAddress(item.address_sender)],
        status: ['Show Response', 'button'],
        details: ['View Details', truncateAddress(item.responseID)],
        type: item.operation === 'update' ? 'incoming_response_update' : 'incoming_response_get',
        addressSender: item.address_sender,
        data: item.data,
        salt: item.salt,
        limit: item.limit,
        key: item.key,
        response_fee: item.response_fee,
        require2FA: item.require2FA,
        twoFAProvider: item.twoFAProvider,
        twoFARequestID: item.twoFARequestID,
        twoFAOneTimeToken: item.twoFAOneTimeToken
      };
    });

    return [...formattedRequests, ...formattedResponses];
  }
  
  function formatOutgoingData(outgoingRequests, outgoingResponses, incomingResponses) {
    console.log(outgoingResponses)
    const formattedRequests = outgoingRequests.map((item) => {
      const hasMatchingResponse = incomingResponses.some(
        (response) => response.responseID === item.requestID
      );
      const operationText = item.operation === 'update' ? 'Update Requested' : 'Data Requested';
      return {
        operation: [operationText, `To: ${truncateAddress(item.address_sender)}`],
        field: [item.field, truncateAddress(item.address_receiver)],
        status: hasMatchingResponse ? ['Response Sent', 'grey'] : ['Awaiting Response', 'grey'],
        details: ['View Details', truncateAddress(item.requestID)],
        type: item.operation === 'update' ? 'outgoing_request_update' : 'outgoing_request_get',
        requestID: item.requestID,
        addressSender: item.address_sender,
        data: item.operation === 'update' ? item.updated_data : item.data,
        addressSender: item.address_sender,
        salt: item.salt,
        limit: item.limit,
        key: item.key,
        response_fee: item.response_fee,
        require2FA: item.require2FA,
        twoFAProvider: item.twoFAProvider,
        twoFARequestID: item.twoFARequestID,
        twoFAOneTimeToken: item.twoFAOneTimeToken
      };
    });

    const formattedResponses = outgoingResponses.map((item) => {
      const operationText = item.operation === 'update' ? 'Update Completed' : 'Data Sent';
      return {
        operation: [operationText, `By you`],
        field: [item.field, truncateAddress(item.address_sender)],
        status: ['Response Sent', 'grey'],
        details: ['View Details', truncateAddress(item.responseID)],
        type: item.operation === 'update' ? 'outgoing_response_update' : 'outgoing_response_get',
        requestID: item.requestID,
        addressSender: item.address_sender,
        data: item.data,
        addressSender: item.address_sender,
        salt: item.salt,
        limit: item.limit,
        key: item.key,
        response_fee: item.response_fee,
        require2FA: item.require2FA,
        twoFAProvider: item.twoFAProvider,
        twoFARequestID: item.twoFARequestID,
        twoFAOneTimeToken: item.twoFAOneTimeToken
      };
    });
    return [...formattedRequests, ...formattedResponses];
  }

  async function loadAllHistory() {
    async function fetchHistoryData() {
      try {
        const cctxData = await getCCTX(userAddress, userPassword, chainId);
        const dataArray = cctxData['data']
  
          try {
            // Attempt to parse the string into an array  
            // Check if dataArray is an array
            if (Array.isArray(dataArray)) {
              // The parsed data is an array
              const transformedData = dataArray.map((item) => ({
                operation: ['Sync Data'],
                field: [item.field, `From: ${item.source_chain} to ${item.destination_chain}`],
                status: ['Sync Completed', 'button'],
                details: ['View Details', `${truncateAddress(item.ccid_id)}`],
              }));
              setTableData((prevTableData) => ({
                ...prevTableData,
                'Cross-Chain Sync': transformedData,
              }));
            } else {
              // If it's not an array, handle this case accordingly
              console.error('Data is not an array.');
            }
          } catch (error) {
            // JSON parsing error
            console.error('Error parsing JSON data:', error);
          }
  
        // Fetch incoming and outgoing data
        const incoming = await getIncoming(userAddress, userPassword, chainId);
        const outgoing = await getOutgoing(userAddress, userPassword, chainId);
        const incomingRequests = incoming['data']['requests_received']
        const outgoingRequests = outgoing['data']['requests_sent']
        const incomingResponses = incoming['data']['responses_received']
        const outgoingResponses = outgoing['data']['responses_sent']
        const incomingFinal = formatIncomingData(incomingRequests, incomingResponses, outgoingResponses)
        const outgoingFinal = formatOutgoingData(outgoingRequests, outgoingResponses, incomingResponses)
  
        setTableData((prevTableData) => ({
          ...prevTableData,
          'Incoming': incomingFinal,
          'Outgoing': outgoingFinal,
        }));
      } catch (error) {
        console.error('Error fetching user data A:', error);
      }
    }
    fetchHistoryData();
  }

  async function fetchUserDataFields() {  
    try {
      const localdashboard = await getDashboard(userAddress, userPassword, chainId)
      setDashboard(localdashboard['data'])
      setUserDataFields(localdashboard['data']);
    } catch (error) {
      console.error('Error fetching user data fields:', error);
    }
  }

  useEffect(() => {
    if(loggedIn && userAddress && chainId) {
      loadAllHistory()
      fetchUserDataFields()
      initializeWeb3()
    }
  }, [loggedIn, userAddress, chainId]);

  // useEffect(() => {
  //   console.log(`the chain ID has been changed`)
  //   loadAllHistory()
  //   fetchUserDataFields()
  // }, [chainId]);

  const removeField = (fieldToRemove) => {
    setUserDataFields(userDataFields.filter(i => i !== fieldToRemove))
  }

  const addField = (fieldToAdd) => {
    setUserDataFields([...userDataFields, fieldToAdd])
  }
    
    
  return (
    <div>
      <UserData fieldNames={userDataFields} handleRemove={removeField} handleAdd={addField}/> 
      <Services useLink={false} handleRefresh={loadAllHistory}/>
      <History tableData={tableData} showRefresh={true} handleRefresh={loadAllHistory}/>
    </div>
  )
}
import Web3 from 'web3';
import { useEffect, useRef, useState, useContext } from 'react';
import { UserData }  from '@/components/UserData';
import { Services }  from '@/components/Services';
import { History } from '@/components/History'
import { useGlobal } from '@/components/GlobalStorage';
import { getCCTX, getIncoming, getOutgoing, truncateAddress, getDashboard } from '@/components/APICalls';
import { ZKPFaucetModal } from '@/components/ZKPFaucetModal'
import { ViewFieldModal } from '@/components/ViewFieldModal'
import { NewDashboardDataModal } from '@/components/NewDashboardDataModal'
import { NewUpdateRequestModal } from '@/components/NewUpdateRequestModal'
import { NewDataRequestModal } from '@/components/NewDataRequestModal'
import { NewCrossChainSyncModal } from '@/components/NewCrossChainSyncModal'
import { CrossChainSyncStatusModal } from '@/components/CrossChainSyncStatusModal'
import { CompleteUpdateModal } from '@/components/CompleteUpdateModal'
import { CompletedDataUpdateModal } from '@/components/CompletedDataUpdateModal'
import { RequestedDataSentModal } from '@/components/RequestedDataSentModal'
import { ReceivedUpdateResponseModal } from '@/components/ReceivedUpdateResponseModal'
import { ReceivedDataResponseModal } from '@/components/ReceivedDataResponseModal'
import { AwaitingUpdateCompletionModal} from '@/components/AwaitingUpdateCompletionModal'
import { AwaitingDataModal } from '@/components/AwaitingDataModal'
import { SendDataModal } from '@/components/SendDataModal'
import coreContractABI from '../contract_ABIs/ZKPServicesCore.json'; // Adjust the file path as needed
import twoFAContractABI from '../contract_ABIs/ZKPServicesVRF2FA.json'; // Adjust the file path as needed

export function DashboardContext() {
  let { walletConnected, userAddress, showLoginNotification, setShowLoginNotification, loggedIn, 
    userPassword, username, setUsername, dashboard, setdashboard, setWeb3, setCoreContract, 
    setTwoFAContract} = useGlobal();

  function initializeWeb3(){
    //these are too large for local storage and need to be reinstantiated each time
    const web3Instance = new Web3(window.ethereum);
    setWeb3(web3Instance);

    const coreContractAbi = coreContractABI; 
    const coreContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 

    const coreContractInstance = new web3Instance.eth.Contract(coreContractAbi, coreContractAddress);
    setCoreContract(coreContractInstance);

    const twoFAContractAbi = twoFAContractABI;
    const twoFAContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 

    const twoFAContractInstance = new web3Instance.eth.Contract(twoFAContractAbi, twoFAContractAddress);
    setTwoFAContract(twoFAContractInstance);
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
        operation: [operationText, `From ${truncateAddress(item.address_sender)}`],
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
        twoFAProvider: item.twoFA_provider,
        twoFARequestID: item.twoFA_requestID,
        twoFAOneTimeToken: item.twoFA_one_time_token
      };
    });
  
    const formattedResponses = incomingResponses.map((item) => {
      const operationText = item.operation === 'update' ? 'Update Completed' : 'Data Received';
      return {
        operation: [operationText, `From ${truncateAddress(item.address_sender)}`],
        field: [item.field, truncateAddress(item.address_sender)],
        status: ['Show Response', 'button'],
        details: ['View Details', truncateAddress(item.responseID)],
        type: "response",
        addressSender: item.address_sender,
        data: item.data,
        salt: item.salt,
        limit: item.limit,
        key: item.key,
        response_fee: item.response_fee,
        require2FA: item.require2FA,
        twoFAProvider: item.twoFA_provider,
        twoFARequestID: item.twoFA_requestID,
        twoFAOneTimeToken: item.twoFA_one_time_token
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
        operation: [operationText, `To ${truncateAddress(item.address_sender)}`],
        field: [item.field, truncateAddress(item.address_receiver)],
        status: hasMatchingResponse ? ['Response Received', 'grey'] : ['Awaiting Response', 'grey'],
        details: ['View Details', truncateAddress(item.requestID)],
      };
    });

    const formattedResponses = outgoingResponses.map((item) => {
      const operationText = item.operation === 'update' ? 'Update Completed' : 'Data Sent';
      return {
        operation: [operationText, `From ${truncateAddress(item.address_sender)}`],
        field: [item.field, truncateAddress(item.address_sender)],
        status: ['Response Sent', 'grey'],
        details: ['View Details', truncateAddress(item.responseID)],
      };
    });
    return [...formattedRequests, ...formattedResponses];
  }

  async function loadAllHistory() {
    async function fetchHistoryData() {
      try {
        const cctxData = await getCCTX(userAddress, userPassword);
        const rawData = cctxData['data'];
  
        // Check if rawData is a string
        if (typeof rawData === 'string') {
          try {
            // Attempt to parse the string into an array
            const dataArray = JSON.parse(rawData);
  
            // Check if dataArray is an array
            if (Array.isArray(dataArray)) {
              // The parsed data is an array
              const transformedData = dataArray.map((item) => ({
                operation: ['Sync Data'],
                field: [item.field, `From ${item.source_chain} to ${item.destination_chain}`],
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
        } else {
          // Handle the case where rawData is not a string
          console.error('Data is not a string.');
        }
  
        // Fetch incoming and outgoing data
        const incoming = await getIncoming(userAddress, userPassword);
        const outgoing = await getOutgoing(userAddress, userPassword);
        const incomingData = incoming['data']
        const outgoingData = outgoing['data']
        const incomingRequests = JSON.parse(incomingData['requests_received']);
        const outgoingRequests = JSON.parse(outgoingData['requests_sent']);
        const incomingResponses = JSON.parse(incomingData['responses_received']);
        const outgoingResponses = JSON.parse(outgoingData['responses_sent']);
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
      const localdashboard = await getDashboard(userAddress, userPassword)
      setdashboard(localdashboard['data'])
      setUserDataFields(localdashboard['data']);
    } catch (error) {
      console.error('Error fetching user data fields:', error);
    }
  }

  useEffect(() => {
    loadAllHistory()
    fetchUserDataFields()
    initializeWeb3()
  }, []);
    
    
  return (
    <div>
      <UserData fieldNames={userDataFields}/> 
      <Services useLink={false} />
      <History tableData={tableData} showRefresh={true} handleRefresh={loadAllHistory}/>
    </div>
  )
}
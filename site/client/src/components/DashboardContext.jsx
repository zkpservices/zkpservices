import { useEffect, useRef, useState, useContext } from 'react';
import { UserData }  from '@/components/UserData';
import { Services }  from '@/components/Services';
import { History } from '@/components/History'
import { useGlobal } from '@/components/GlobalStorage';
import { getCCTX, getIncoming, getOutgoing, truncateAddress } from '@/components/APICalls';
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


export function DashboardContext() {

  const [tableData, setTableData] = useState({
    'Incoming': [
      {
        operation: ['Data Requested', 'From You'],
        field: ['Central Melbourne Pharmacy Records', 'Address 0x2344242...3424242'],
        status: ['Response Sent', 'grey'], 
        details: ['View Details', 'Request ID 0x240992222222222229']
      },
      {
        operation: ['Update Requested', 'From You'],
        field: ['Central Melbourne Pharmacy Records', 'Address 0x2344242...3424242'],
        status: ['Complete Update', 'button'], 
        details: ['View Details', 'Request ID 0x240992222222222229']
      }
    ],
    'Outgoing': [],
    'Cross-Chain Sync': []
  });

  let { walletConnected, userAddress, showLoginNotification, 
    setShowLoginNotification, loggedIn, userPassword, username, setUsername } = useGlobal();

  useEffect(() => {
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
                details: ['View Details', `Request ID ${item.ccid_id}`]
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
        const incoming = await getIncoming(userAddress, userPassword);
        const incomingData = incoming['data']
        const incomingRequests = JSON.parse(incomingData['requests_received']);
        const incomingResponses = JSON.parse(incomingData['responses_received']);

        function formatIncomingData(data, isResponse = false) {
          const formattedData = data.map((item) => {
            const isUpdate = item.operation === 'update';
            const hasMatchingResponse = isResponse
              ? data.some((response) => response.responseID === item.requestID)
              : false;
        
            const operationText = isResponse
              ? isUpdate
                ? hasMatchingResponse
                  ? 'Update Completed'
                  : 'Complete Update'
                : hasMatchingResponse
                ? 'Response Sent'
                : 'Send Response'
              : isUpdate
              ? 'Update Requested'
              : 'Data Requested';
        
            const truncatedSenderAddr = truncateAddress(item.address_sender);
            const truncatedReceiverAddr = truncateAddress(item.address_receiver);
        
            return {
              operation: [operationText, `From ${truncatedSenderAddr}`],
              field: [item.field, truncatedReceiverAddr],
              status: isResponse
                ? ['Response Received', 'grey']
                : hasMatchingResponse
                ? ['Response Sent', 'grey']
                : ['Send Response', 'button'],
              details: ['View Details', isResponse ? item.responseID : item.requestID],
            };
          });
          return formattedData;
        } 
        
      // For requests
      const requestsData = formatIncomingData(incomingRequests, false);

      // For responses
      const responsesData = formatIncomingData(incomingResponses, true);
      const mergedIncomingData = [...requestsData, ...responsesData];

      setTableData((prevTableData) => ({
        ...prevTableData,
        'Incoming': mergedIncomingData,
      }));


      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    
    fetchHistoryData()

    function formatOutgoingData(data, isResponse = false) {
      const formattedData = data.map((item) => {
        const isUpdate = item.operation === 'update';
        const hasMatchingResponse = isResponse
          ? data.some((response) => response.responseID === item.requestID)
          : false;
    
        const operationText = isResponse
          ? isUpdate
            ? hasMatchingResponse
              ? 'Update Completed'
              : 'Complete Update'
            : hasMatchingResponse
            ? 'Response Sent'
            : 'Send Response'
          : isUpdate
          ? 'Update Requested'
          : 'Data Requested';
    
        const truncatedSenderAddr = truncateAddress(item.address_sender);
        const truncatedReceiverAddr = truncateAddress(item.address_receiver);
    
        return {
          operation: [operationText, `From ${truncatedSenderAddr}`],
          field: [item.field, truncatedReceiverAddr],
          status: isResponse
            ? ['Response Received', 'grey']
            : hasMatchingResponse
            ? ['Response Sent', 'grey']
            : ['Send Response', 'button'],
          details: ['View Details', isResponse ? item.responseID : item.requestID],
        };
      });
      return formattedData;
    }

    async function fetchOutgoingData() {
      try {
        const outgoing = await getOutgoing(userAddress, userPassword);
        const outgoingData = outgoing['data'];
        const outgoingRequests = JSON.parse(outgoingData['requests_sent']);
        const outgoingResponses = JSON.parse(outgoingData['responses_sent']);
  
        // Reuse the formatOutgoingData function for outgoing data
        const requestsData = formatOutgoingData(outgoingRequests, false);
        const responsesData = formatOutgoingData(outgoingResponses, true);
  
        const mergedOutgoingData = [...requestsData, ...responsesData];
  
        setTableData((prevTableData) => ({
          ...prevTableData,
          'Outgoing': mergedOutgoingData,
        }));
      } catch (error) {
        console.error('Error fetching outgoing data:', error);
      }
    }
  
    fetchOutgoingData();
  }, [])
  return (
    <div>
      {/* <ZKPFaucetModal /> */}
      {/* <ViewFieldModal title="medical records"/>  */}
      {/* <NewDashboardDataModal /> */}
      {/* <NewUpdateRequestModal /> */}
      {/* <NewDataRequestModal /> */}
      <UserData /> {/* to be fed a prop such as userdata eventually */}
      <Services useLink={false} />
      <History tableData={tableData} showRefresh={true} />
    </div>
  )
}
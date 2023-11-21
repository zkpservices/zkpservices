import Link from 'next/link'
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useWallet } from "@/components/Wallet.jsx";
import { UserData }  from '@/components/UserData';
import { Services }  from '@/components/Services';
import { HollowCard }  from '@/components/HollowCard';
import { ZKPFaucetModal } from '@/components/ZKPFaucetModal'
import { ViewFieldModal } from '@/components/ViewFieldModal'
import { NewDashboardDataModal } from '@/components/NewDashboardDataModal'
import { NewUpdateRequestModal } from '@/components/NewUpdateRequestModal'
import { NewDataRequestModal } from '@/components/NewDataRequestModal'
import { NewCrossChainSyncModal } from '@/components/NewCrossChainSyncModal'
import { NewCrossChainSyncStatusModal } from '@/components/NewCrossChainSyncStatusModal'
import { CompleteUpdateModal } from '@/components/CompleteUpdateModal'
import { CompletedDataUpdateModal } from '@/components/CompletedDataUpdateModal'
import { RequestedDataSentModal } from '@/components/RequestedDataSentModal'
import { ReceivedUpdateResponseModal } from '@/components/ReceivedUpdateResponseModal'
import { ReceivedDataResponseModal } from '@/components/ReceivedDataResponseModal'
import { AwaitingUpdateCompletionModal} from '@/components/AwaitingUpdateCompletionModal'
import { AwaitingDataModal } from '@/components/AwaitingDataModal'
import { SendDataModal } from '@/components/SendDataModal'
import { ThreeJSComponent } from '@/components/ThreeJSComponent'
import { GridPattern } from '@/components/GridPattern'
import { Heading } from '@/components/Heading'
// import { UpdateIcon } from '@/components/icons/UpdateIcon'
import { QuestionMarkIcon } from '@/components/icons/QuestionMarkIcon'
import { ChatBubbleIcon } from '@/components/icons/ChatBubbleIcon'
import { EnvelopeIcon } from '@/components/icons/EnvelopeIcon'
import { UserIcon } from '@/components/icons/UserIcon'
import { UsersIcon } from '@/components/icons/UsersIcon'
import { History } from '@/components/History'
import { Notification } from '@/components/Notification'

   
export function Dashboard() {
  const [tableData, setTableData] = useState({
    'Incoming': [],
    'Outgoing': [],
    'Cross-Chain Sync': []
  });


  let { walletConnected, userAddress, showLoginNotification, 
    setShowLoginNotification, loggedIn, userPassword, username, setUsername } = useWallet();

  // temporary overwrite for testing dashboard
  loggedIn = true;
  walletConnected = true;

  // Placeholders for payloads, this is not hardcoding
  const get_item_payload = {
    "id": userAddress,
    "action": "get_item",
    "key": "id.name",
    "password": userPassword       
  };

  const get_ccip_payload = {
    "id": userAddress,
    "action": "get_crosschain_transaction",
    "password": userPassword       
  };

  useEffect(() => {
    // Make a POST request when the Dashboard page is shown
    axios
      .post('https://y1oeimdo63.execute-api.us-east-1.amazonaws.com/userdata', get_item_payload)
      .then((response) => {
        setUsername(response['data']['id.name']);
      })
      .catch((error) => {
        // Handle errors
        console.error('Error making POST request:', error);
      });

    axios
      .post('https://y1oeimdo63.execute-api.us-east-1.amazonaws.com/userdata', get_ccip_payload)
      .then((response) => {
        const responseData = response['data'];

        const transformedData = Object.entries(responseData).map(([ccip_id, data]) => {
          const { source_chain, destination_chain, field } = data;
          return {
            operation: ['Sync Data'],
            field: [field, `From ${source_chain} to ${destination_chain}`],
            status: ['Sync Completed', 'button'],
            details: ['View Details'],
          };
        });

        setTableData((prevTableData) => ({
          ...prevTableData,
          'Cross-Chain Sync': transformedData,
        }));
      })
      .catch((error) => {
        // Handle errors
        console.error('Error making POST request:', error);
      });

    // After 5000 milliseconds (5 seconds), hide the notification
    const notificationTimeout = setTimeout(() => {
      setShowLoginNotification(false);
    }, 5000);

    // Clear the notification timeout when the component unmounts
    return () => {
      clearTimeout(notificationTimeout);
    };
  }, []);

  const [dashboardData, setDashboardData] = useState(null);

  function handleRefreshButtonClick() {
    const get_ccip_payload = {
      "id": userAddress,
      "action": "get_crosschain_transaction",
      "password": userPassword       
    }
    axios
    .post('https://y1oeimdo63.execute-api.us-east-1.amazonaws.com/userdata', get_item_payload)
    .then((response) => {
      console.log(response['data']['id.name'])
      setUsername(response['data']['id.name'])
      console.log('username')
      console.log(username)
    })
    .catch((error) => {
      // Handle errors
      console.error('Error making POST request:', error);
    });

    axios
    .post('https://y1oeimdo63.execute-api.us-east-1.amazonaws.com/userdata', get_ccip_payload)
    .then((response) => {
      const responseData = response['data']

      const transformedData = Object.entries(responseData).map(([ccip_id, data]) => {
        const { source_chain, destination_chain, field } = data;
        return {
          operation: ['Sync Data'],
          field: [field, `From ${source_chain} to ${destination_chain}`],
          status: ['Sync Completed', 'button'],
          details: ['View Details'],
        };
      });
      console.log(transformedData)
      setTableData((prevTableData) => ({
        ...prevTableData,
        'Cross-Chain Sync': transformedData, // Update with your transformed data
      }));
      console.log(tableData)
    })

    .catch((error) => {
      // Handle errors
      console.error('Error making POST request:', error);
    });
  }

  return (
    <>
      <div className="xl:max-w-none">
        {walletConnected && loggedIn ? (
          <>

            <h2 className="mt-10 text-center text-3xl font-bold tracking-tight">
              {username ? `Welcome back, ${username}.` : ''}
            </h2>
            
            <UserData /> {/* to be fed a prop such as userdata eventually */}
            <Services />
            <History tableData={tableData} showRefresh={true} />

          </>
        ) : (
          <div className="flex justify-center">
            <h2 className="text-3xl font-bold tracking-tight text-center">
              Please connect your wallet and log in to get started
            </h2>
          </div>
        )}
      </div>
  
      <div>
        {showLoginNotification && (
          <Notification
            showTopText="Logged in successfully"
            showBottomText={`Logged in as ${userAddress}`}
          />
        )}
      </div>
    </>
  );
}

export default Dashboard;

import Link from 'next/link'
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useG } from "@/components/GlobalStorage.jsx";
import { ThreeJSComponent } from '@/components/ThreeJSComponent'
import { Notification } from '@/components/Notification'
import { DashboardContext } from '@/components/DashboardContext';
import { getUser, getCCTX } from '@/components/APICalls'
import { useGlobal } from '@/components/GlobalStorage'
   
export function Dashboard() {
  const [tableData, setTableData] = useState({
    'Incoming': [],
    'Outgoing': [],
    'Cross-Chain Sync': []
  });


  let { walletConnected, userAddress, showLoginNotification, 
    setShowLoginNotification, loggedIn, userPassword, username, setUsername } = useGlobal();
  
  const [showDashboard, setShowDashboard] = useState(<div className="flex justify-center"><h2 className="text-3xl font-bold tracking-tight text-center">Please connect your wallet and log in to get started</h2></div>)
  const [usernameText, setUsernameText] = useState('')

  const showDashboardConditional = () => {
    if (walletConnected && loggedIn) {
      return (
        <>
          <h2 className="mt-10 text-center text-3xl font-bold tracking-tight">
            {username ? `Welcome back, ${username}.` : ''}
          </h2>
  
          <DashboardContext />
        </>
      );
    } else {
      return (
        <div className="flex justify-center">
          <h2 className="text-3xl font-bold tracking-tight text-center">
            Please connect your wallet and log in to get started.
          </h2>
        </div>
      );
    }
  };

  const usernameTextConditional = () => {
    return (username ? `Welcome back, ${username}.` : '')
  }
  // temporary overwrite for testing dashboard
  // loggedIn = true;
  // walletConnected = true;
  
  useEffect(() => {
    setShowDashboard(showDashboardConditional())
    setUsernameText(usernameTextConditional())
  }, [walletConnected, username])

  useEffect(() => {
    if(loggedIn && walletConnected) {
    async function fetchUsername() {
      try {
        const userData = await getUser(userAddress, userPassword);
        setUsername(userData['data']['id.name'])
      } catch (error) {
        console.error('Error fetching user data:', error);
      }

      try {
        const cctxData = await getUser(userAddress, userPassword);
        setUsername(cctxData['data']['id.name'])
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    fetchUsername()
  }

    // axios
    //   .post('https://y1oeimdo63.execute-api.us-east-1.amazonaws.com/userdata', get_ccip_payload)
    //   .then((response) => {
    //     const responseData = response['data'];

    //     const transformedData = Object.entries(responseData).map(([ccip_id, data]) => {
    //       const { source_chain, destination_chain, field } = data;
    //       return {
    //         operation: ['Sync Data'],
    //         field: [field, `From ${source_chain} to ${destination_chain}`],
    //         status: ['Sync Completed', 'button'],
    //         details: ['View Details'],
    //       };
    //     });

    //     setTableData((prevTableData) => ({
    //       ...prevTableData,
    //       'Cross-Chain Sync': transformedData,
    //     }));
    //   })
    //   .catch((error) => {
    //     // Handle errors
    //     console.error('Error making POST request:', error);
    //   });

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
      setUsername(response['data']['id.name'])
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
      setTableData((prevTableData) => ({
        ...prevTableData,
        'Cross-Chain Sync': transformedData, // Update with your transformed data
      }));
    })

    .catch((error) => {
      // Handle errors
      console.error('Error making POST request:', error);
    });
  }

  return (
    <>
      <div className="xl:max-w-none">
       {showDashboard}
      </div>
  
      <div>
        {/* {showLoginNotification && (
          <Notification
            showTopText="Logged in successfully"
            showBottomText={`Logged in as ${userAddress}`}
          />
        )} */}
      </div>
    </>
  );
}

export default Dashboard;

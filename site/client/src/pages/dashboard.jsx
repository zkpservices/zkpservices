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
  const [loginNotification, setLoginNotification] = useState(<></>)

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

  const loginNotificaitonConditional = () => {
    return (loggedIn ?<Notification
            showTopText="Logged in successfully"
            showBottomText={`Logged in as ${userAddress}`}
          /> : <></>)
  }

  // temporary overwrite for testing dashboard
  // loggedIn = true;
  // walletConnected = true;
  
  useEffect(() => {
    setShowDashboard(showDashboardConditional())
    setUsernameText(usernameTextConditional())
  }, [walletConnected, username])

  useEffect(() => {
    setLoginNotification(loginNotificaitonConditional())
  }, [loggedIn])

  useEffect(() => {
    if(loggedIn && walletConnected) {
    async function fetchUsername() {
      try {
        const userData = await getUser(userAddress, userPassword);
        setUsername(userData['data']['id.name'])
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    fetchUsername()
  }

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

  return (
    <>
      <div className="xl:max-w-none">
       {showDashboard}
      </div>
  
      <div>
        {/* {loginNotification} */}
      </div>
    </>
  );
}

export default Dashboard;

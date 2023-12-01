import Link from 'next/link'
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useG } from "@/components/GlobalStorage.jsx";
import { ThreeJSComponent } from '@/components/ThreeJSComponent'
import { Notification } from '@/components/Notification'
import { DashboardContext } from '@/components/DashboardContext';
import { useGlobal } from '@/components/GlobalStorage'
import { getDashboard } from '@/components/APICalls';
   
export function Dashboard() {
  const [tableData, setTableData] = useState({
    'Incoming': [],
    'Outgoing': [],
    'Cross-Chain Sync': []
  });


  let { walletConnected, userAddress, showLoginNotification, 
    setShowLoginNotification, loggedIn, userPassword, username, setUsername, 
    onboardedChain, setOnboardedChain, chainId, isOnboarding} = useGlobal();

  // loggedIn = true;
  // walletConnected = true;

  const [showDashboard, setShowDashboard] = useState(<div className="flex justify-center"><h2 className="text-3xl font-bold tracking-tight text-center">Please connect your wallet and log in to get started</h2></div>)
  const [usernameText, setUsernameText] = useState('')
  const [loginNotification, setLoginNotification] = useState(<></>)

  const showDashboardConditional = () => {
    if (walletConnected && loggedIn && !onboardedChain && !isOnboarding) {
      return (
        <div className="flex justify-center">
          <h3 className="text-2xl tracking-tight text-center">
            You are currently connected to a network (chain ID: {chainId}) that has not been onboarded to this account.
            <br/>
            <br/>
            Please swap to an onboarded chain and follow the onboarding process for other required networks.
          </h3>
        </div>
      );
    }
    if (walletConnected && loggedIn) {
      return (
        <>
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
  
  async function fetchUserDataFields() {  
    try {
      console.log("fuk yeww..")
      const localdashboard = await getDashboard(userAddress, userPassword, chainId)
      setOnboardedChain(true)
    } catch (error) {
      setOnboardedChain(false)
      console.error(`Error establishing chain onboarded status: ${error}`)
    }
  }

  useEffect(() => {
    if(loggedIn && walletConnected && !isOnboarding) {
      fetchUserDataFields()
    }
    setShowDashboard(showDashboardConditional())
    setUsernameText(usernameTextConditional())
  }, [walletConnected, username, onboardedChain, chainId])

  useEffect(() => {
    setLoginNotification(loginNotificaitonConditional())
  }, [loggedIn])

  useEffect(() => {

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

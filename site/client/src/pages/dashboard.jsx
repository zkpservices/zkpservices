import Link from 'next/link'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useG } from '@/components/GlobalStorage.jsx'
import { Notification } from '@/components/Notification'
import { DashboardContext } from '@/components/DashboardContext'
import { useGlobal } from '@/components/GlobalStorage'
import { getDashboard } from '@/components/APICalls'

export function Dashboard() {
  const [tableData, setTableData] = useState({
    Incoming: [],
    Outgoing: [],
    'Cross-Chain Sync': [],
  })

  let {
    walletConnected,
    userAddress,
    showLoginNotification,
    setShowLoginNotification,
    loggedIn,
    userPassword,
    username,
    setUsername,
    onboardedChain,
    setOnboardedChain,
    chainId,
    isOnboarding,
    metamaskAvailable,
    setApiErrorNotif,
    setApiErrorTopText,
    setApiErrorBottomText
  } = useGlobal()

  // loggedIn = true;
  // walletConnected = true;

  const [showDashboard, setShowDashboard] = useState(
    <div class="min-h-screen"></div>
    // <div className="flex justify-center">
    //   <h2 className="text-center text-3xl font-bold tracking-tight">
    //     Please connect your wallet and log in to get started
    //   </h2>
    // </div>,
  )
  const [usernameText, setUsernameText] = useState('')
  const [loginNotification, setLoginNotification] = useState(<></>)

  const showDashboardConditional = () => {
    if (!metamaskAvailable) {
      return (
        <h2 className="mt-10 text-center text-2xl tracking-tight">
          Web3 is not available on this device.
          <br />
          Our guide is available on all devices, but please connect somewhere
          with Metamask available to use our dApp.
        </h2>
      )
    } else if (
      walletConnected &&
      loggedIn &&
      !onboardedChain &&
      !isOnboarding
    ) {
      return (
        <div className="flex justify-center">
          <h3 className="text-center text-2xl tracking-tight">
            You are currently connected to a network (chain ID: {chainId}) that
            has not been onboarded to this account.
            <br />
            <br />
            Please swap to an onboarded chain and follow the onboarding process
            for other required networks.
          </h3>
        </div>
      )
    }
    if (walletConnected && loggedIn) {
      return (
        <>
          <DashboardContext />
        </>
      )
    } else {
      return (
        <div className="flex justify-center">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Please connect your wallet and log in to get started.
          </h2>
        </div>
      )
    }
  }

  const usernameTextConditional = () => {
    return username ? `Welcome back, ${username}.` : ''
  }

  const loginNotificaitonConditional = () => {
    return loggedIn && showLoginNotification ? (
      <Notification
        showTopText="Logged in successfully"
        showBottomText={`Logged in as ${userAddress}`}
      />
    ) : (
      <></>
    )
  }

  // temporary overwrite for testing dashboard
  // loggedIn = true;
  // walletConnected = true;

  async function fetchUserDataFields() {
    try {
      const localdashboard = await getDashboard(
        userAddress,
        userPassword,
        chainId,
      )
      setOnboardedChain(true)
    } catch (error) {
      setOnboardedChain(false)
      setApiErrorNotif(true)
      setApiErrorTopText("Error establishing chain onboarded status:")
      setApiErrorBottomText(error.toString())
      console.error(`Error establishing chain onboarded status: ${error}`)
    }
  }

  useEffect(() => {
    if (loggedIn && walletConnected && !isOnboarding) {
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
      setShowLoginNotification(false)
      setLoginNotification(loginNotificaitonConditional())
    }, 3000)

    // Clear the notification timeout when the component unmounts
    return () => {
      clearTimeout(notificationTimeout)
    }
  }, [])

  const [dashboardData, setDashboardData] = useState(null)

  return (
    <>
      <div className="xl:max-w-none">{showDashboard}</div>

      <div>
        <Notification
          error={false}
          open={showLoginNotification}
          onClose={() => setShowLoginNotification(false)}
          showTopText="Logged in successfully"
          showBottomText={`Logged in as ${userAddress}`}
        />
      </div>
    </>
  )
}

export default Dashboard

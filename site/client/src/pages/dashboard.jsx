import Link from 'next/link'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useG } from '@/components/GlobalStorage.jsx'
import { Notification } from '@/components/Notification'
import { DashboardContext } from '@/components/DashboardContext'
import { useGlobal } from '@/components/GlobalStorage'
import { getDashboard } from '@/components/APICalls'
import coreContractABI from '../../public/contract_ABIs/ZKPServicesCore.json'
import twoFAContractVRFABI from '../../public/contract_ABIs/ZKPServicesVRF2FA.json'
import twoFAContractGenericABI from '../../public/contract_ABIs/ZKPServicesGeneric2FA.json'
import batchSignUpABI from '../../public/contract_ABIs/BatchSignUp.json'
import Web3 from 'web3'
import { Note } from '@/components/mdx'

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
    setLoggedIn,
    userPassword,
    setUserPassword,
    username,
    setUsername,
    twoFactorAuthPassword,
    setTwoFactorAuthPassword,
    contractPassword,
    setContractPassword,
    chainId,
    web3,
    fujiCoreContract,
    fujiTwoFAContract,
    fujiBatchSignUpContract,
    mumbaiCoreContract,
    mumbaiTwoFAContract,
    mumbaiBatchSignUpContract,
    rippleCoreContract,
    rippleTwoFAContract,
    rippleBatchSignUpContract,
    setWeb3,
    setFujiCoreContract,
    setFujiTwoFAContract,
    setMumbaiCoreContract,
    setMumbaiTwoFAContract,
    setRippleCoreContract,
    setRippleTwoFAContract,
    setFujiBatchSignUpContract,
    setMumbaiBatchSignUpContract,
    setRippleBatchSignUpContract,
    metamaskAvailable,
    setMetamaskAvailable,
    onboardedChain,
    isOnboarding,
    setOnboardedChain,
    setApiErrorNotif,
    setApiErrorTopText,
    setApiErrorBottomText 
  } = useGlobal()

  // loggedIn = true;
  // walletConnected = true;

  const [showDashboard, setShowDashboard] = useState(
    <div className="min-h-screen"></div>
  )
  const [usernameText, setUsernameText] = useState('')
  const [loginNotification, setLoginNotification] = useState(<></>)

  async function initializeWeb3() {
    if (window.ethereum) {
      setMetamaskAvailable(true)
      //these are too large for local storage and need to be reinstantiated each time
      const web3Instance = new Web3(window.ethereum)
      web3 = web3Instance
      setWeb3(web3Instance)

      const coreContractAbi = coreContractABI
      const fujiCoreContractAddress =
        '0x119F505c62B2ddD5A32E3137d66eBC75E92421C5'
      const mumbaiCoreContractAddress =
        '0xCb853FC4788e3e148720d12d787Ed4b4f0D7B43B'
      const rippleCoreContractAddress =
        '0xDf7cb58E4C0302F1FA24048e1B355f4ca5CC5Cc1'
      const fujiCoreContractInstance = new web3Instance.eth.Contract(
        coreContractAbi,
        fujiCoreContractAddress,
      )
      const mumbaiCoreContractInstance = new web3Instance.eth.Contract(
        coreContractAbi,
        mumbaiCoreContractAddress,
      )
      const rippleCoreContractInstance = new web3Instance.eth.Contract(
        coreContractAbi,
        rippleCoreContractAddress,
      )
      fujiCoreContract = fujiCoreContractInstance
      mumbaiCoreContract = mumbaiCoreContractInstance
      rippleCoreContract = rippleCoreContractInstance
      setFujiCoreContract(fujiCoreContractInstance)
      setMumbaiCoreContract(mumbaiCoreContractInstance)
      setRippleCoreContract(rippleCoreContractInstance)

      const twoFAContractVRFAbi = twoFAContractVRFABI
      const twoFAContractGenericAbi = twoFAContractGenericABI
      const fujiTwoFAContractAddress =
        '0x0be63a7958e0eC9E9bd0f80428b6D2aCd620175D'
      const mumbaiTwoFAContractAddress =
        '0xF909B805621a2DF0CD659E87CD679997Cf853455'
      const rippleTwoFAContractAddress =
        '0x4db90ac24648E383e49517947FcfCF357731759E'
      const fujiTwoFAContractInstance = new web3Instance.eth.Contract(
        twoFAContractVRFAbi,
        fujiTwoFAContractAddress,
      )
      const mumbaiTwoFAContractInstance = new web3Instance.eth.Contract(
        twoFAContractVRFAbi,
        mumbaiTwoFAContractAddress,
      )
      const rippleTwoFAContractInstance = new web3Instance.eth.Contract(
        twoFAContractGenericAbi,
        rippleTwoFAContractAddress,
      )
      fujiTwoFAContract = fujiTwoFAContractInstance
      mumbaiTwoFAContract = mumbaiTwoFAContractInstance
      rippleTwoFAContract = rippleTwoFAContractInstance
      setFujiTwoFAContract(fujiTwoFAContractInstance)
      setMumbaiTwoFAContract(mumbaiTwoFAContractInstance)
      setRippleTwoFAContract(rippleTwoFAContractInstance)

      const batchSignUpContractAbi = batchSignUpABI
      const fujiBatchSignUpContractAddress =
        '0x7DDe6e9F67e4214eFB6343734f833ac9F90a3e90'
      const mumbaiBatchSignUpContractAddress =
        '0x86Bdca1Dee159b0e20Ad9107F73E7c0925C4708b'
      const rippleBatchSignUpContractAddress =
        '0x0a7051c92430561D0ee014b572Fb9F6ED2c78f0'
      const fujiBatchSignUpContractInstance = new web3Instance.eth.Contract(
        batchSignUpContractAbi,
        fujiBatchSignUpContractAddress,
      )
      const mumbaiBatchSignUpContractInstance = new web3Instance.eth.Contract(
        batchSignUpContractAbi,
        mumbaiBatchSignUpContractAddress,
      )
      const rippleBatchSignUpContractInstance = new web3Instance.eth.Contract(
        batchSignUpContractAbi,
        rippleBatchSignUpContractAddress,
      )
      fujiBatchSignUpContract = fujiBatchSignUpContractInstance
      mumbaiBatchSignUpContract = mumbaiBatchSignUpContractInstance
      rippleBatchSignUpContract = rippleBatchSignUpContractInstance
      setFujiBatchSignUpContract(fujiBatchSignUpContractInstance)
      setMumbaiBatchSignUpContract(mumbaiBatchSignUpContractInstance)
      setRippleBatchSignUpContract(rippleBatchSignUpContractInstance)
    } else {
      setMetamaskAvailable(false)
    }
  }

  useEffect(() => {
    initializeWeb3().then(() => {
      setShowDashboard(showDashboardConditional());
    });
  }, [walletConnected, userAddress, metamaskAvailable, loggedIn]);

  const showDashboardConditional = () => {
    if (typeof window !== undefined && !window.ethereum) {
      return (
        <div className="my-48 mx-20 font-semibold">
          <Note>
            Web3 is not available on this device.
            Our guide is available on all devices, but please connect somewhere
            with Metamask available to use our dApp.
          </Note>
        </div>
        // <h2 className="text-center text-2xl tracking-tight my-48 text-center">
        //   Web3 is not available on this device.
        //   <br />
        //   Our guide is available on all devices, but please connect somewhere
        //   with Metamask available to use our dApp.
        // </h2>
      )
    } else if (
      walletConnected &&
      loggedIn &&
      !onboardedChain &&
      !isOnboarding
    ) {
      return (
        <div className="my-48 mx-20 font-semibold items-center justify-center">
          <Note>
            You are currently connected to a network (chain ID: <span 
            className="font-mono">{chainId})</span> that has not been onboarded 
            to this account. Please swap to an onboarded chain and follow the 
            onboarding process for other required networks.
          </Note>
        </div>
        // <div className="flex justify-center my-48 text-center">
        //   <h3 className="text-center text-2xl tracking-tight">
        //     You are currently connected to a network (chain ID: {chainId}) that
        //     has not been onboarded to this account.
        //     <br />
        //     <br />
        //     Please swap to an onboarded chain and follow the onboarding process
        //     for other required networks.
        //   </h3>
        // </div>
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
        <div className="my-48 mx-20 font-semibold items-center justify-center">
          <Note>
            Please connect your wallet AND login to get started.
          </Note>
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

      {/* <HeroPattern /> */}
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

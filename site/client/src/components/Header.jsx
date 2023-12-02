import Link from 'next/link'
import clsx from 'clsx'
import { forwardRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useGlobal } from './GlobalStorage'
import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'
import { getDashboard } from './APICalls'
import { useMobileNavigationStore } from '@/components/MobileNavigation'
import { ModeToggle } from '@/components/ModeToggle'
import Web3 from 'web3'
import coreContractABI from '../../public/contract_ABIs/ZKPServicesCore.json'
import twoFAContractVRFABI from '../../public/contract_ABIs/ZKPServicesVRF2FA.json'
import twoFAContractGenericABI from '../../public/contract_ABIs/ZKPServicesGeneric2FA.json'
import batchSignUpABI from '../../public/contract_ABIs/BatchSignUp.json'
import {
  MobileNavigation,
  useIsInsideMobileNavigation,
} from '@/components/MobileNavigation'

function TopLevelNavItem({ href, children }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm leading-5 text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

export const Header = forwardRef(function Header({ className }, ref) {
  let { isOpen: mobileNavIsOpen } = useMobileNavigationStore()
  let isInsideMobileNavigation = useIsInsideMobileNavigation()

  let { scrollY } = useScroll()
  let bgOpacityLight = useTransform(scrollY, [0, 72], [0.5, 0.5])
  let bgOpacityDark = useTransform(scrollY, [0, 72], [0.2, 0.2])
  const [accountText, setAccountText] = useState('')
  let {
    walletConnected,
    setWalletConnected,
    userAddress,
    userPassword,
    setUserAddress,
    loggedIn,
    setLoggedIn,
    chainId,
    setChainId,
    setWeb3,
    web3,
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
    setOnboardedChain,
    onboardedChain,
    isOnboarding,
    metamaskAvailable,
    setMetamaskAvailable,
  } = useGlobal()
  const [isHovered, setIsHovered] = useState(false)
  const [textOpacity, setTextOpacity] = useState(1) // Initialize opacity to 1
  const [loginButtonText, setLoginButtonText] = useState('Login')

  function handleChainChanged(metamask_chain_id) {
    // We recommend reloading the page, unless you must do otherwise.
    setChainId(metamask_chain_id)
    console.log(metamask_chain_id)
  }

  // window.ethereum.on('chainChanged', handleChainChanged);

  useEffect(() => {
    if (walletConnected) {
      connectToMetaMask()
    }
  }, [])

  useEffect(() => {
    if (userAddress) {
      // Update accountText when account changes
      setAccountText(truncateAddress(userAddress))
    } else {
      setAccountText('Connect Wallet')
    }
  }, [userAddress, loggedIn])

  useEffect(() => {
    // This effect will run after the component is mounted and rendered on the client
    // Here, you can set the initial button text based on the wallet and login state
    setLoginButtonText(loggedIn ? 'Logout' : 'Login')
  }, [walletConnected, loggedIn])

  async function connectToMetaMask() {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      // User has granted access
      setWalletConnected(true)
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      const metamask_chain_id = await window.ethereum.request({
        method: 'eth_chainId',
      })
      setChainId(metamask_chain_id)
      console.log(metamask_chain_id)
      setUserAddress(accounts[0])
      initializeWeb3()
    } catch (error) {
      // User denied access or there was an error
      console.error(error)
    }
  }

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
      console.error(`Error establishing chain onboarded status: ${error}`)
    }
  }

  useEffect(() => {
    initializeWeb3()

    const handleChainChanged = (_chainId) => {
      console.log(_chainId)
      setChainId(_chainId)
      if (loggedIn && walletConnected && !isOnboarding) {
        fetchUserDataFields()
      }
    }

    if (metamaskAvailable) {
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        // Clean up the event listener when the component is unmounted
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const truncateAddress = (address) => {
    if (!address) return ''
    const start = address.substring(0, 6)
    const end = address.substring(address.length - 3)
    return `${start}...${end}`
  }

  async function disconnectWallet() {
    try {
      // Reset your application state related to the wallet
      // For example, set userAddress to null
      // setConnected(false);
      setUserAddress('')
      setLoggedIn(false)
      setWalletConnected(false)
      localStorage.clear()
    } catch (error) {
      console.error(error)
    }
  }

  async function initializeWeb3() {
    if (window.ethereum) {
      setMetamaskAvailable(true)
      //these are too large for local storage and need to be reinstantiated each time
      const web3Instance = new Web3(window.ethereum)
      web3 = web3Instance
      setWeb3(web3Instance)

      const coreContractAbi = coreContractABI
      const fujiCoreContractAddress =
        '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'
      const mumbaiCoreContractAddress =
        '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'
      const rippleCoreContractAddress =
        '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'
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
        '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'
      const mumbaiTwoFAContractAddress =
        '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'
      const rippleTwoFAContractAddress =
        '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'
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
        '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'
      const mumbaiBatchSignUpContractAddress =
        '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'
      const rippleBatchSignUpContractAddress =
        '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'
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

  function updateWalletConnect() {
    if (metamaskAvailable) {
      if (walletConnected) {
        disconnectWallet()
      } else {
        connectToMetaMask()
      }
    }
  }

  function loginButtonClicked() {
    if (loggedIn) {
      setLoggedIn(false)
    }
  }

  return (
    <motion.div
      ref={ref}
      className={clsx(
        className,
        'fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:z-30 lg:px-8',
        !isInsideMobileNavigation &&
          'backdrop-blur-sm dark:backdrop-blur lg:left-72 xl:left-80',
        isInsideMobileNavigation
          ? 'bg-white dark:bg-zinc-900'
          : 'bg-white/[var(--bg-opacity-light)] dark:bg-zinc-900/[var(--bg-opacity-dark)]',
      )}
      style={{
        '--bg-opacity-light': bgOpacityLight,
        '--bg-opacity-dark': bgOpacityDark,
      }}
    >
      <div
        className={clsx(
          'absolute inset-x-0 top-full h-px transition',
          (isInsideMobileNavigation || !mobileNavIsOpen) &&
            'bg-zinc-900/7.5 dark:bg-white/7.5',
        )}
      />
      <div className="flex items-center gap-5 lg:hidden">
        <MobileNavigation />
        <Link href="/" aria-label="Home">
          <Logo className="h-6" />
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-5">
        <nav className="hidden md:block">
          <ul role="list" className="flex items-center gap-8">
            <TopLevelNavItem href="#">API</TopLevelNavItem>
            <TopLevelNavItem href="#">Documentation</TopLevelNavItem>
            <TopLevelNavItem href="#">Support</TopLevelNavItem>
          </ul>
        </nav>
        <div className="hidden md:block md:h-5 md:w-px md:bg-zinc-900/10 md:dark:bg-white/15" />
        <div className="flex gap-4">
          <ModeToggle />
        </div>
        <div className="flex hidden gap-4 min-[416px]:contents">
          <Button
            href="#"
            id="connectWalletButtonNav"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
              updateWalletConnect()
            }}
          >
            {isHovered && walletConnected ? 'Disconnect' : accountText}
          </Button>
          <Button
            href="/login"
            id="loginButtonNav"
            onClick={loginButtonClicked}
            className={'cursor-pointer opacity-100'}
            // disabled={!walletConnected}
          >
            {loginButtonText}
          </Button>
        </div>
      </div>
    </motion.div>
  )
})

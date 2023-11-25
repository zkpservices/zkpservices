import Link from 'next/link'
import Web3 from 'web3'; // Import the web3 library
import clsx from 'clsx'
import coreContractABI from '../contract_ABIs/ZKPServicesCore.json'; // Adjust the file path as needed
import twoFAContractABI from '../contract_ABIs/ZKPServicesVRF2FA.json'; // Adjust the file path as needed
import { forwardRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MetaMaskSDK } from '@metamask/sdk';
import { useGlobal } from './GlobalStorage';
import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'
import { useMobileNavigationStore } from '@/components/MobileNavigation'
import { ModeToggle } from '@/components/ModeToggle'
import { MobileSearch, Search } from '@/components/Search'
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
  const [accountText, setAccountText] = useState('');
  const {walletConnected, setWalletConnected, userAddress, setUserAddress, 
        loggedIn, setLoggedIn, chainId, setChainId, web3, setWeb3, 
        coreContract, setCoreContract, twoFAContract, setTwoFAContract} = useGlobal();
  const [isHovered, setIsHovered] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1); // Initialize opacity to 1
  const [loginButtonText, setLoginButtonText] = useState('Login');

  function handleChainChanged(metamask_chain_id) {
    // We recommend reloading the page, unless you must do otherwise.
    setChainId(metamask_chain_id)
    console.log(metamask_chain_id)
  }

  // window.ethereum.on('chainChanged', handleChainChanged);

  useEffect(() => {
    if (userAddress) {
      // Update accountText when account changes
      setAccountText(truncateAddress(userAddress));
    } else {
      setAccountText('Connect Wallet');
    }
  }, [userAddress, loggedIn]);

  useEffect(() => {
    // This effect will run after the component is mounted and rendered on the client
    // Here, you can set the initial button text based on the wallet and login state
    setLoginButtonText(loggedIn ? 'Logout' : 'Login');
  }, [walletConnected, loggedIn]);

  async function connectToMetaMask() {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      // User has granted access
      setWalletConnected(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const metamask_chain_id = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(metamask_chain_id)
      console.log(metamask_chain_id)
      setUserAddress(accounts[0]);

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
    } catch (error) {
      // User denied access or there was an error
      console.error(error);
    }
  }

  const truncateAddress = (address) => {
    if (!address) return '';
    const start = address.substring(0, 6);
    const end = address.substring(address.length - 3);
    return `${start}...${end}`;
  }
  
  async function disconnectWallet() {
    try {
      // Reset your application state related to the wallet
      // For example, set userAddress to null
      // setConnected(false);
      setUserAddress('');
      setLoggedIn(false)
      setWalletConnected(false);
    } catch (error) {
      console.error(error);
    }
  }
  
  function updateWalletConnect() {
    if(walletConnected) {
      disconnectWallet()
    } else {
      connectToMetaMask()
    }
  }

  function loginButtonClicked() {
    if(loggedIn) {
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
        : 'bg-white/[var(--bg-opacity-light)] dark:bg-zinc-900/[var(--bg-opacity-dark)]'
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
          'bg-zinc-900/7.5 dark:bg-white/7.5'
      )}
    />
    {/* <Search /> */}
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
        {/* <MobileSearch /> */}
        <ModeToggle />
      </div>
      <div className="hidden min-[416px]:contents flex gap-4">
        <Button href="#" id="connectWalletButtonNav"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => { 
          updateWalletConnect()
        }}>
            {(isHovered && walletConnected) ? 'Disconnect' : accountText}
        </Button>
        <Button
      href="/login"
      id="loginButtonNav"
      onClick={loginButtonClicked}
      className={'opacity-100 cursor-pointer'}
      // disabled={!walletConnected}
    >
      {loginButtonText}
    </Button>
        </div>
      </div>
    </motion.div>
  )
})

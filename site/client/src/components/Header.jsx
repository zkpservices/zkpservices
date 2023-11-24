import { forwardRef, useState, useEffect } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MetaMaskSDK } from '@metamask/sdk';
import { useGlobal } from './GlobalStorage';

import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'
import {
  MobileNavigation,
  useIsInsideMobileNavigation,
} from '@/components/MobileNavigation'
import { useMobileNavigationStore } from '@/components/MobileNavigation'
import { ModeToggle } from '@/components/ModeToggle'
import { MobileSearch, Search } from '@/components/Search'

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

// const options = {
//   injectProvider: false,
//   dAppMetadata: {name: "zkp.services", url: "https://zkp.services"},
//   communicationLayerPreference: 'webrtc',
// };

// const MMSDK = new MetaMaskSDK(options);

// const ethereum = MMSDK.getProvider();


export const Header = forwardRef(function Header({ className }, ref) {
  let { isOpen: mobileNavIsOpen } = useMobileNavigationStore()
  let isInsideMobileNavigation = useIsInsideMobileNavigation()

  let { scrollY } = useScroll()
  let bgOpacityLight = useTransform(scrollY, [0, 72], [0.5, 0.9])
  let bgOpacityDark = useTransform(scrollY, [0, 72], [0.2, 0.8])
  const [accountText, setAccountText] = useState('');
  const {walletConnected, setWalletConnected, userAddress, setUserAddress, loggedIn, setLoggedIn} = useGlobal();
  const [isHovered, setIsHovered] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1); // Initialize opacity to 1


  useEffect(() => {
    console.log('made it to useeffect, userAddress:')
    console.log(userAddress)
    if (userAddress) {
      // Update accountText when account changes
      console.log('using effect, setting account text')
      console.log('userAddress')
      console.log(userAddress)
      setAccountText(truncateAddress(userAddress));
      console.log('set account text')
    } else {
      setAccountText('');
    }
  }, [userAddress, loggedIn]);

  async function connectToMetaMask() {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      // User has granted access
      setWalletConnected(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('setting account')
      setUserAddress(accounts[0]);
      console.log('set account to:')
      console.log(accounts[0])
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
      setUserAddress(null);
      setLoggedIn(false)
      setWalletConnected(false);
    } catch (error) {
      console.error(error);
    }
  }
  
  function updateWalletConnect() {
    console.log("updating wallet connect")
    console.log(loggedIn)
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
          <span className={`transition-opacity ${textOpacity !== 1 ? 'duration-300 ease-in-out' : ''}`} style={{ opacity: textOpacity }}>
            {walletConnected && isHovered ? 'Disconnect' : walletConnected ? accountText : 'Connect Wallet'}
          </span>
        </Button>
        <Button
        href="/login"
        id="loginButtonNav"
        onClick={loginButtonClicked}
        className={`${walletConnected ? 'opacity-100 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
        disabled={!walletConnected}
      >
        {walletConnected && loggedIn ? 'Logout' : walletConnected ? 'Login' : 'Login'}
      </Button>
        </div>
      </div>
    </motion.div>
  )
})

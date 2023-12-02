import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'

import { Button } from '@/components/Button'
import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { useSectionStore } from '@/components/SectionProvider'
import { Tag } from '@/components/Tag'
import { remToPx } from '@/lib/remToPx'
import { useGlobal } from '@/components/GlobalStorage'
import Web3 from 'web3'
import coreContractABI from '../../public/contract_ABIs/ZKPServicesCore.json'
import twoFAContractVRFABI from '../../public/contract_ABIs/ZKPServicesVRF2FA.json'
import twoFAContractGenericABI from '../../public/contract_ABIs/ZKPServicesGeneric2FA.json'
import batchSignUpABI from '../../public/contract_ABIs/BatchSignUp.json'

function useInitialValue(value, condition = true) {
  let initialValue = useRef(value).current
  return condition ? initialValue : value
}

function TopLevelNavItem({ href, children }) {
  return (
    <li className="md:hidden">
      <Link
        href={href}
        className="block py-1 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

function NavLink({ href, tag, active, isAnchorLink = false, children }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pr-3 text-sm transition',
        isAnchorLink ? 'pl-7' : 'pl-4',
        active
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
      )}
    >
      <span className="truncate">{children}</span>
      {tag && (
        <Tag variant="small" color="zinc">
          {tag}
        </Tag>
      )}
    </Link>
  )
}

function VisibleSectionHighlight({ group, pathname }) {
  let [sections, visibleSections] = useInitialValue(
    [
      useSectionStore((s) => s.sections),
      useSectionStore((s) => s.visibleSections),
    ],
    useIsInsideMobileNavigation(),
  )

  let isPresent = useIsPresent()
  let firstVisibleSectionIndex = Math.max(
    0,
    [{ id: '_top' }, ...sections].findIndex(
      (section) => section.id === visibleSections[0],
    ),
  )
  let itemHeight = remToPx(2)
  let height = isPresent
    ? Math.max(1, visibleSections.length) * itemHeight
    : itemHeight
  let top =
    group.links.findIndex((link) => link.href === pathname) * itemHeight +
    firstVisibleSectionIndex * itemHeight

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
      style={{ borderRadius: 8, height, top }}
    />
  )
}

function ActivePageMarker({ group, pathname }) {
  let itemHeight = remToPx(2)
  let offset = remToPx(0.25)
  let activePageIndex = group.links.findIndex((link) => link.href === pathname)
  let top = offset + activePageIndex * itemHeight

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-emerald-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  )
}

function NavigationGroup({ group, className }) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let [router, sections] = useInitialValue(
    [useRouter(), useSectionStore((s) => s.sections)],
    isInsideMobileNavigation,
  )

  let isActiveGroup =
    group.links.findIndex((link) => link.href === router.pathname) !== -1

  return (
    <li className={clsx('relative mt-6', className)}>
      <motion.h2
        layout="position"
        className="text-xs font-semibold text-zinc-900 dark:text-white"
      >
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pl-2">
        <AnimatePresence initial={!isInsideMobileNavigation}>
          {isActiveGroup && (
            <VisibleSectionHighlight group={group} pathname={router.pathname} />
          )}
        </AnimatePresence>
        <motion.div
          layout
          className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
        />
        <AnimatePresence initial={false}>
          {isActiveGroup && (
            <ActivePageMarker group={group} pathname={router.pathname} />
          )}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link) => (
            <motion.li key={link.href} layout="position" className="relative">
              <NavLink href={link.href} active={link.href === router.pathname}>
                {link.title}
              </NavLink>
              <AnimatePresence mode="popLayout" initial={false}>
                {link.href === router.pathname && sections.length > 0 && (
                  <motion.ul
                    role="list"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { delay: 0.1 },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15 },
                    }}
                  >
                    {sections.map((section) => (
                      <li key={section.id}>
                        <NavLink
                          href={`${link.href}#${section.id}`}
                          tag={section.tag}
                          isAnchorLink
                        >
                          {section.title}
                        </NavLink>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export const navigation = [
  {
    title: 'Guides',
    links: [
      { title: 'Introduction', href: '/' },
      { title: 'Overview', href: '/docs' },
      { title: 'dApp Guide', href: '/guides' },
      { title: 'Your data', href: '/yourdata' },
      { title: '2FA', href: '/2FA' },
      { title: 'API Guide', href: '/api_docs' },
    ],
  },
  {
    title: 'Services',
    links: [
      { title: 'Quickstart', href: '/quickstart' },
      { title: 'Login', href: '/login' },
      { title: 'Dashboard', href: '/dashboard' },
    ],
  },
]

export function Navigation(props) {
  const [accountText, setAccountText] = useState('')
  let {
    walletConnected,
    setWalletConnected,
    userAddress,
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

  useEffect(() => {
    initializeWeb3()

    const handleChainChanged = (_chainId) => {
      console.log(_chainId)
      setChainId(_chainId)
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
    if (walletConnected) {
      disconnectWallet()
    } else {
      connectToMetaMask()
    }
  }

  function loginButtonClicked() {
    if (loggedIn) {
      setLoggedIn(false)
    }
  }
  return (
    <nav {...props}>
      <ul role="list">
        <TopLevelNavItem href="#">API</TopLevelNavItem>
        <TopLevelNavItem href="#">Documentation</TopLevelNavItem>
        <TopLevelNavItem href="#">Support</TopLevelNavItem>
        {navigation.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 && 'md:mt-0'}
          />
        ))}
        {/* <li className="sticky bottom-0 z-10 mt-6 min-[416px]:hidden">
          <Button href="#" variant="filled" className="w-full">
            Connect Wallet
          </Button>
        </li> */}
      </ul>
    </nav>
  )
}

// GlobalStorage.jsx
import { createContext, useContext, useState, useEffect } from 'react'

// Create a context
const GlobalContext = createContext()

// Create a context provider component
export function GlobalProvider({ children }) {
  const [walletConnected, setWalletConnected] = useState(() => {
    if (typeof window !== 'undefined') {
      const localWalletConnected = localStorage.getItem('walletConnected')
      return localWalletConnected === 'true' || false
    }
    return false
  })
  const [loggedIn, setLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      const localLoggedIn = localStorage.getItem('loggedIn')
      return localLoggedIn === 'true' || false
    }
    return false
  })
  const [userAddress, setUserAddress] = useState(() => {
    console.log("NIGHTMARE NIGHTMARE NIGHTMARE")
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userAddress') || ''
    }
    return ''
  })
  const [userPassword, setUserPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userPassword') || ''
    }
    return ''
  })
  const [showLoginNotification, setShowLoginNotification] = useState(false)
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('username') || ''
    }
    return ''
  })
  const [twoFactorAuthPassword, setTwoFactorAuthPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('twoFactorAuthPassword') || ''
    }
    return ''
  })
  const [contractPassword, setContractPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('contractPassword') || ''
    }
    return ''
  })

  const [chainId, setChainId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chainId') || ''
    }
    return ''
  })

  const [fieldData, setFieldData] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fieldData') || ''
    }
    return ''
  })
  const [dashboard, setDashboard] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboard') || ''
    }
    return ''
  })
  const [web3, setWeb3] = useState(() => {
    if (typeof window !== 'undefined') {
      const localWeb3 = localStorage.getItem('web3')
      return localWeb3 || null
    }
    return null
  })

  const [fujiCoreContract, setFujiCoreContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('fujiCoreContract')
      return localContract || null
    }
    return null
  })

  const [fujiTwoFAContract, setFujiTwoFAContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('fujiTwoFAContract')
      return localContract || null
    }
    return null
  })

  const [fujiBatchSignUpContract, setFujiBatchSignUpContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('fujiBatchSignUpContract')
      return localContract || null
    }
    return null
  })

  const [mumbaiCoreContract, setMumbaiCoreContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('mumbaiCoreContract')
      return localContract || null
    }
    return null
  })

  const [mumbaiTwoFAContract, setMumbaiTwoFAContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('mumbaiTwoFAContract')
      return localContract || null
    }
    return null
  })

  const [mumbaiBatchSignUpContract, setMumbaiBatchSignUpContract] = useState(
    () => {
      if (typeof window !== 'undefined') {
        const localContract = localStorage.getItem('mumbaiBatchSignUpContract')
        return localContract || null
      }
      return null
    },
  )

  const [rippleCoreContract, setRippleCoreContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('rippleCoreContract')
      return localContract || null
    }
    return null
  })

  const [rippleTwoFAContract, setRippleTwoFAContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('rippleTwoFAContract')
      return localContract || null
    }
    return null
  })

  const [rippleBatchSignUpContract, setRippleBatchSignUpContract] = useState(
    () => {
      if (typeof window !== 'undefined') {
        const localContract = localStorage.getItem('rippleBatchSignUpContract')
        return localContract || null
      }
      return null
    },
  )

  const [isOnboarding, setIsOnboarding] = useState(false)

  const [onboardedChain, setOnboardedChain] = useState(() => {
    if (typeof window !== 'undefined') {
      const localLoggedIn = localStorage.getItem('onboardedChain')
      return localLoggedIn === 'true' || false
    }
    return false
  })

  const [metamaskAvailable, setMetamaskAvailable] = useState(() => {
    if (typeof window !== 'undefined') {
      const localShowLoginNotification =
        localStorage.getItem('metamaskAvailable')
      return localShowLoginNotification === 'true' || false
    }
    return false
  })

  const [apiErrorNotif, setApiErrorNotif] = useState(() => {
    if (typeof window !== 'undefined') {
      const localShowLoginNotification =
        localStorage.getItem('apiErrorNotif')
      return localShowLoginNotification === 'true' || false
    }
    return false
  })

  const [apiErrorTopText, setApiErrorTopText] = useState(() => {
    if (typeof window !== 'undefined') {
      const localShowLoginNotification =
        localStorage.getItem('apiErrorTopText')
      return localShowLoginNotification === 'true' || false
    }
    return false
  })

  const [apiErrorBottomText, setApiErrorBottomText] = useState(() => {
    if (typeof window !== 'undefined') {
      const localShowLoginNotification =
        localStorage.getItem('apiErrorBottomText')
      return localShowLoginNotification === 'true' || false
    }
    return false
  })

  useEffect(() => {
    // Update localStorage when any relevant state variable changes
    localStorage.setItem('walletConnected', walletConnected)
    localStorage.setItem('userAddress', userAddress)
    localStorage.setItem('loggedIn', loggedIn)
    localStorage.setItem('userPassword', userPassword)
    localStorage.setItem('username', username)
    localStorage.setItem('twoFactorAuthPassword', twoFactorAuthPassword)
    localStorage.setItem('contractPassword', contractPassword)
    localStorage.setItem('chainId', chainId)
    localStorage.setItem('fieldData', fieldData)
    localStorage.setItem('dashboard', dashboard)
    localStorage.setItem('web3', web3)
    localStorage.setItem('fujiCoreContract', fujiCoreContract)
    localStorage.setItem('fujiTwoFAContract', fujiTwoFAContract)
    localStorage.setItem('fujiBatchSignUpContract', fujiBatchSignUpContract)
    localStorage.setItem('mumbaiCoreContract', mumbaiCoreContract)
    localStorage.setItem('mumbaiTwoFAContract', mumbaiTwoFAContract)
    localStorage.setItem('mumbaiBatchSignUpContract', mumbaiBatchSignUpContract)
    localStorage.setItem('rippleCoreContract', rippleCoreContract)
    localStorage.setItem('rippleTwoFAContract', rippleTwoFAContract)
    localStorage.setItem('rippleBatchSignUpContract', rippleBatchSignUpContract)
    localStorage.setItem('onboardedChain', onboardedChain)
    localStorage.setItem('metamaskAvailable', metamaskAvailable)
    localStorage.setItem('apiErrorNotif', apiErrorNotif),
    localStorage.setItem('apiErrorTopText', apiErrorTopText),
    localStorage.setItem('apiErrorBottomText', apiErrorBottomText)
  }, [
    userAddress,
    walletConnected,
    loggedIn,
    userPassword,
    showLoginNotification,
    username,
    twoFactorAuthPassword,
    contractPassword,
    chainId,
    fieldData,
    dashboard,
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
    isOnboarding,
    onboardedChain,
    metamaskAvailable,
    apiErrorNotif,
    apiErrorTopText,
    apiErrorBottomText
  ])

  return (
    <GlobalContext.Provider
      value={{
        walletConnected,
        setWalletConnected,
        loggedIn,
        setLoggedIn,
        userAddress,
        setUserAddress,
        showLoginNotification,
        setShowLoginNotification,
        userPassword,
        setUserPassword,
        username,
        setUsername,
        twoFactorAuthPassword,
        setTwoFactorAuthPassword,
        contractPassword,
        setContractPassword,
        chainId,
        setChainId,
        fieldData,
        setFieldData,
        dashboard,
        setDashboard,
        web3,
        setWeb3,
        fujiCoreContract,
        setFujiCoreContract,
        fujiTwoFAContract,
        setFujiTwoFAContract,
        fujiBatchSignUpContract,
        setFujiBatchSignUpContract,
        mumbaiCoreContract,
        setMumbaiCoreContract,
        mumbaiTwoFAContract,
        setMumbaiTwoFAContract,
        mumbaiBatchSignUpContract,
        setMumbaiBatchSignUpContract,
        rippleCoreContract,
        setRippleCoreContract,
        rippleTwoFAContract,
        setRippleTwoFAContract,
        rippleBatchSignUpContract,
        setRippleBatchSignUpContract,
        isOnboarding,
        setIsOnboarding,
        onboardedChain,
        setOnboardedChain,
        metamaskAvailable,
        setMetamaskAvailable,
        apiErrorNotif,
        setApiErrorNotif,
        apiErrorTopText,
        setApiErrorTopText,
        apiErrorBottomText,
        setApiErrorBottomText
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

// Create a custom hook to easily access the context
export function useGlobal() {
  return useContext(GlobalContext)
}

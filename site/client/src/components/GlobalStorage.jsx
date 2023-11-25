// GlobalStorage.jsx

import { createContext, useContext, useState, useEffect } from 'react';

// Create a context
const GlobalContext = createContext();

// Create a context provider component
// Create a context provider component
export function GlobalProvider({ children }) {
  const [walletConnected, setWalletConnected] = useState(() => {
    if (typeof window !== 'undefined') {
      const localWalletConnected = localStorage.getItem('walletConnected');
      return localWalletConnected === 'true' || false;
    }
    return false;
  });
  const [loggedIn, setLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      const localLoggedIn = localStorage.getItem('loggedIn');
      return localLoggedIn === 'true' || false;
    }
    return false;
  });
  const [userAddress, setUserAddress] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userAddress') || '';
    }
    return '';
  });
  const [userPassword, setUserPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userPassword') || '';
    }
    return '';
  });
  const [showLoginNotification, setShowLoginNotification] = useState(() => {
    if (typeof window !== 'undefined') {
      const localShowLoginNotification = localStorage.getItem('showLoginNotification');
      return localShowLoginNotification === 'true' || false;
    }
    return false;
  });
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('username') || '';
    }
    return '';
  });
  const [twoFactorAuthPassword, setTwoFactorAuthPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('twoFactorAuthPassword') || '';
    }
    return '';
  });
  const [contractPassword, setContractPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('contractPassword') || '';
    }
    return '';
  });

  const [chainId, setChainId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chainId') || '';
    }
    return '';
  });

  const [fieldData, setFieldData] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fieldData') || '';
    }
    return '';
  });
  const [dashboard, setDashboard] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboard') || '';
    }
    return '';
  });
  const [availableDashboard, setAvailableDashboard] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('availableDashboard') || '';
    }
    return '';
  });
  const [web3, setWeb3] = useState(() => {
    if (typeof window !== 'undefined') {
      const localWeb3 = localStorage.getItem('web3');
      return localWeb3 || null;
    }
    return null;
  });

  const [fujiCoreContract, setFujiCoreContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('fujiCoreContract');
      return localContract || null;
    }
    return null;
  });

  const [fujiTwoFAContract, setFujiTwoFAContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('fujiTwoFAContract');
      return localContract || null;
    }
    return null;
  });

  const [mumbaiCoreContract, setMumbaiCoreContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('mumbaiCoreContract');
      return localContract || null;
    }
    return null;
  });

  const [mumbaiTwoFAContract, setMumbaiTwoFAContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('mumbaiTwoFAContract');
      return localContract || null;
    }
    return null;
  });

  const [rippleCoreContract, setRippleCoreContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('rippleCoreContract');
      return localContract || null;
    }
    return null;
  });

  const [rippleTwoFAContract, setRippleTwoFAContract] = useState(() => {
    if (typeof window !== 'undefined') {
      const localContract = localStorage.getItem('rippleTwoFAContract');
      return localContract || null;
    }
    return null;
  });


  useEffect(() => {
    // Update localStorage when any relevant state variable changes
    localStorage.setItem('walletConnected', walletConnected);
    localStorage.setItem('userAddress', userAddress);
    localStorage.setItem('loggedIn', loggedIn);
    localStorage.setItem('userPassword', userPassword);
    localStorage.setItem('showLoginNotification', showLoginNotification);
    localStorage.setItem('username', username);
    localStorage.setItem('twoFactorAuthPassword', twoFactorAuthPassword);
    localStorage.setItem('contractPassword', contractPassword);
    localStorage.setItem('chainId', chainId);
    localStorage.setItem('fieldData', fieldData);
    localStorage.setItem('dashboard', dashboard);
    localStorage.setItem('availableDashboard', dashboard);
    localStorage.setItem('web3', dashboard);
    localStorage.setItem('fujiCoreContract', dashboard);
    localStorage.setItem('fujiTwoFAContract', dashboard);
    localStorage.setItem('mumbaiCoreContract', dashboard);
    localStorage.setItem('mumbaiTwoFAContract', dashboard);
    localStorage.setItem('rippleCoreContract', dashboard);
    localStorage.setItem('rippleTwoFAContract', dashboard);
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
    availableDashboard,
    web3,
    fujiCoreContract,
    fujiTwoFAContract,
    mumbaiCoreContract,
    mumbaiTwoFAContract,
    rippleCoreContract,
    rippleTwoFAContract
  ]);

  return (
    <GlobalContext.Provider value={{ walletConnected, setWalletConnected, loggedIn, setLoggedIn, 
      userAddress, setUserAddress,  showLoginNotification, setShowLoginNotification, userPassword, 
      setUserPassword, username, setUsername, twoFactorAuthPassword, setTwoFactorAuthPassword, 
      contractPassword, setContractPassword, chainId, setChainId, fieldData, setFieldData, 
      dashboard, setDashboard, availableDashboard, setAvailableDashboard, web3, setWeb3,
      fujiCoreContract, setFujiCoreContract, fujiTwoFAContract, setFujiTwoFAContract,
      mumbaiCoreContract, setMumbaiCoreContract, mumbaiTwoFAContract, setMumbaiTwoFAContract,
      rippleCoreContract, setRippleCoreContract, rippleTwoFAContract, setRippleTwoFAContract}}>
      {children}
    </GlobalContext.Provider>
  );
}

// Create a custom hook to easily access the context
export function useGlobal() {
  return useContext(GlobalContext);
}

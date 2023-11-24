// GlobalStorage.jsx

import { createContext, useContext, useState } from 'react';

// Create a context
const GlobalContext = createContext();

// Create a context provider component
export function GlobalProvider({ children }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const [username, setUsername] = useState('');
  const [twoFactorAuthPassword, setTwoFactorAuthPassword] = useState('');
  const [contractPassword, setContractPassword] = useState('');

  return (
    <GlobalContext.Provider value={{ walletConnected, setWalletConnected, loggedIn, setLoggedIn, userAddress, setUserAddress, 
      showLoginNotification, setShowLoginNotification, userPassword, setUserPassword, username, setUsername, twoFactorAuthPassword, setTwoFactorAuthPassword,
      contractPassword, setContractPassword}}>
      {children}
    </GlobalContext.Provider>
  );
}

// Create a custom hook to easily access the context
export function useGlobal() {
  return useContext(GlobalContext);
}

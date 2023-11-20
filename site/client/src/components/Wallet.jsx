// WalletContext.js

import { createContext, useContext, useState } from 'react';

// Create a context
const WalletContext = createContext();

// Create a context provider component
export function WalletProvider({ children }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const [username, setUsername] = useState('');
  const [twoFactorAuthPassword, setTwoFactorAuthPassword] = useState('');
  const [contractPassword, setContractPassword] = useState('');

  return (
    <WalletContext.Provider value={{ walletConnected, setWalletConnected, loggedIn, setLoggedIn, userAddress, setUserAddress, 
      showLoginNotification, setShowLoginNotification, userPassword, setUserPassword, username, setUsername, twoFactorAuthPassword, setTwoFactorAuthPassword,
      contractPassword, setContractPassword}}>
      {children}
    </WalletContext.Provider>
  );
}

// Create a custom hook to easily access the context
export function useWallet() {
  return useContext(WalletContext);
}

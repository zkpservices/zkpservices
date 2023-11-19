// WalletContext.js

import { createContext, useContext, useState } from 'react';

// Create a context
const WalletContext = createContext();

// Create a context provider component
export function WalletProvider({ children }) {
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <WalletContext.Provider value={{ walletConnected, setWalletConnected }}>
      {children}
    </WalletContext.Provider>
  );
}

// Create a custom hook to easily access the context
export function useWallet() {
  return useContext(WalletContext);
}

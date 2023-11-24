import { Logo } from "../components/Logo.jsx"
import { useEffect, useState } from 'react'
import { useGlobal } from "@/components/GlobalStorage.jsx";
import { login } from '@/components/APICalls.jsx';
import axios, { formToJSON } from 'axios';
import Router from 'next/router';
/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/

export default function Example() {
  const { walletConnected, loggedIn, userAddress, setLoggedIn, userPassword, setUserPassword, showLoginNotification, setShowLoginNotification } = useGlobal();
  const [loginHeader, setLoginHeader] = useState(<h2 className="mt-10 text-center text-3xl font-bold tracking-tight">Please connect your wallet to get started.</h2>)
  const [loginForm, setLoginForm] = useState(<></>)
  const showLoginHeader = () => {
    if(walletConnected) {
      return (
        <>
        <h2 className="mt-10 text-center text-3xl font-bold tracking-tight ">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm">
          Or{' '}
          <a href="/quickstart" className="font-medium text-emerald-400 hover:text-emerald-600">
            set up your account 
          </a>
        </p>
        </>
      )
    } else {
      return (
        <h2 className="mt-10 text-center text-3xl font-bold tracking-tight">
        Please connect your wallet to get started.
        </h2>
      )
    }
  }

  const showLoginForm = () => {
    if(walletConnected) {
      return (
      <>
      <form className="mt-8 space-y-6" action="#" method="POST" onSubmit={handleSubmit}>
  
          <div>
            <label htmlFor="provider" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Data Provider:
            </label>
            <div className="mt-2">
              <input
                id="provider"
                name="provider"
                type="text"
                defaultValue="https://y1oeimdo63.execute-api.us-east-1.amazonaws.com/userdata"
                autoComplete=""
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>
  
          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Password:
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>
  
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm ">
              Remember me
            </label>
          </div>
  
          <div className="text-sm">
            <a href="#" className="font-medium text-emerald-400 hover:text-emerald-600">
              Forgot your password?
            </a>
          </div>
        </div>
  
        <div>
          <button
            type="submit"
            className="relative flex w-full justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            </span>
            Sign in
          </button>
        </div>
      </form>
      </>
      )
    } else {
      return (
        <></>
      )
    }
  }

  useEffect(() => {
    setLoginHeader(showLoginHeader(walletConnected))
    setLoginForm(showLoginForm(walletConnected))
  }, [walletConnected])
  const handleSubmit = async (event) => {
    // event.preventDefault();

    // Extract form data here
    const formData = new FormData(event.target);

    if (walletConnected) {
      try {
        console.log(`Inside login.jsx, here is the userAddress: ${userAddress}`)
        const formDataJSON = formToJSON(formData)
        const response = login(userAddress, formDataJSON['password'])
        setLoggedIn(true);
        setUserPassword(formDataJSON['password'])
        Router.push('/dashboard')
        setShowLoginNotification(true)
        
      } catch (error) {
        // Handle errors, e.g., show an error message
        console.error('Authentication failed', error);
      }
    }
  };
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-50">
        <body class="h-full">
        ```
      */}
      <div className="flex min-h-full items-center justify-center pt-6 pb-32 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Logo className="mx-20" />
          {loginHeader}
          </div>
          {loginForm}
        </div>
      </div>
    </>
  )
}

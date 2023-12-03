import Link from 'next/link'
import { Logo } from '../components/Logo.jsx'
import { useEffect, useState } from 'react'
import { useGlobal } from '@/components/GlobalStorage.jsx'
import { login, getChainData, getDashboard } from '@/components/APICalls.jsx'
import axios, { formToJSON } from 'axios'
import { useRouter } from 'next/router'
import { Notification } from '@/components/Notification'
import { Note } from '@/components/mdx'

export default function Login() {
  const {
    walletConnected,
    loggedIn,
    userAddress,
    setLoggedIn,
    userPassword,
    setUserPassword,
    showLoginNotification,
    setShowLoginNotification,
    chainId,
    contractPassword,
    setContractPassword,
    twoFactorAuthPassword,
    setTwoFactorAuthPassword,
    onboardedChain,
    setOnboardedChain,
    metamaskAvailable,
  } = useGlobal()
  const [loginHeader, setLoginHeader] = useState(
    <div className="mt-32 mb-20 font-semibold">
      <Note>
        Please connect your wallet to get started.
      </Note>
    </div>,
  )
  const [loginForm, setLoginForm] = useState(<></>)
  const [badLogin, setBadLogin] = useState(false)
  const [notifTopText, setNotifTopText] = useState('')
  const [notifBottomText, setNotifBottomText] = useState('')
  const [userAddressLocal, setUserAddressLocal] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userAddress') || ''
    }
    return ''
  })
 
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
  }, [rememberMe]);

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  const router = useRouter()
  const showLoginHeader = () => {
    if (typeof window !== undefined && !window.ethereum) {
      return (
        <div className="mt-32 mb-20 font-semibold">
          <Note>
            Web3 is not available on this device.
            Our guide is available on all devices, but please connect somewhere
            with Metamask available to use our dApp.
          </Note>
        </div>
      )
    } else if (walletConnected) {
      return (
        <>
          <h2 className="mt-10 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm">
            Or{' '}
            <Link
              href="/quickstart"
              className="font-medium text-emerald-400 hover:text-emerald-600"
            >
              set up your account
            </Link>
          </p>
        </>
      )
    } else {
      return (
        <div className="mt-32 mb-20 font-semibold items-center justify-center">
          <Note>
            Please connect your wallet to get started.
          </Note>
        </div>
      )
    }
  }

  const showLoginForm = () => {
    if (walletConnected) {
      return (
        <>
          <form
            className="mt-8 space-y-6"
            action="#"
            method="POST"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="provider"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
              >
                Data Provider:
              </label>
              <div className="mt-2 font-mono">
                <input
                  id="provider"
                  name="provider"
                  type="text"
                  defaultValue="https://api.zkp.services/"
                  autoComplete=""
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
              >
                Password:
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  onChange={handleRememberMeChange}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm ">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-emerald-400 hover:text-emerald-600"
                >
                  Forgot your password?
                </a>
              </div>
            </div>
            <div>
              <button
                type="submit"
                id="submitButton"
                disabled={false}
                className="relative flex w-full justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"></span>
                Sign in
              </button>
            </div>
          </form>
        </>
      )
    } else {
      return <></>
    }
  }

  useEffect(() => {
    setLoginHeader(showLoginHeader(walletConnected))
    setLoginForm(showLoginForm(walletConnected))
    setUserAddressLocal(userAddress)
  }, [walletConnected, userAddress])

  const badLoginNotifClose = () => setBadLogin(false)
  const handleSubmit = async (event) => {
    document.getElementById('submitButton').disabled = true
    document.getElementById('submitButton').textContent = 'Signing in...'
    document.getElementById('submitButton').className =
      'relative flex w-full justify-center rounded-md border border-transparent bg-gray-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
    event.preventDefault()
    // Extract form data here
    const formData = new FormData(event.target)

    if (walletConnected) {
      try {
        const formDataJSON = formToJSON(formData)
        const response = await login(userAddress, formDataJSON['password'])
        setLoggedIn(true)
        setUserPassword(formDataJSON['password'])
        setShowLoginNotification(true)
        router.push('/dashboard')
      } catch (error) {
        if(error.response) {
          if (error.response.status == 401) {
            setBadLogin(true)
            setNotifTopText("Login Failed")
            setNotifBottomText("Incorrect password.")
          } else if (error.response.status == 404) {
            setBadLogin(true)
            setNotifTopText("Login Failed")
            setNotifBottomText("User not found with current address.")
          }
        }
        document.getElementById('submitButton').disabled = false
        document.getElementById('submitButton').textContent = 'Sign in'
        document.getElementById('submitButton').className =
          'relative flex w-full justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
        console.error('Authentication failed', error)
      }
    }
  }
  return (
    <div className="max-w-none">
      <Notification
        open={badLogin}
        showTopText={notifTopText}
        showBottomText={notifBottomText}
        error={true}
        onClose={badLoginNotifClose}
      />
      <div className="max-w-none">
        <div className="flex min-h-full items-center justify-center pb-20 pt-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <Logo className="mx-20" />
              {loginHeader}
            </div>
            {loginForm}
          </div>
        </div>
      </div>
    </div>
  )
}

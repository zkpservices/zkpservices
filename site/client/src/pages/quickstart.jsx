import Web3 from 'web3'
import Router from 'next/router'
import axios, { formToJSON } from 'axios'
import { useEffect, useState } from 'react'
import Guide from './quickstart_guide.mdx'
import { useGlobal } from '@/components/GlobalStorage'
import { createUser } from '@/components/APICalls'
import { poseidon } from '@/components/PoseidonHash'
import { stringToBigInt } from '@/components/HelperCalls'
import {
  generateRSAKeys,
  generateRSASigningKeys,
} from '@/components/HelperCalls'
import coreContractABI from '../../public/contract_ABIs/ZKPServicesCore.json'
import twoFAContractVRFABI from '../../public/contract_ABIs/ZKPServicesVRF2FA.json'
import twoFAContractGenericABI from '../../public/contract_ABIs/ZKPServicesGeneric2FA.json'
import batchSignUpABI from '../../public/contract_ABIs/BatchSignUp.json'
import { Notification } from '@/components/Notification'
import { Note } from '@/components/mdx'

const chains = {
  fuji: 43113,
  mumbai: 80001,
  ripple: 1440002,
}

export default function Quickstart() {
  let {
    walletConnected,
    userAddress,
    showLoginNotification,
    setShowLoginNotification,
    loggedIn,
    setLoggedIn,
    userPassword,
    setUserPassword,
    username,
    setUsername,
    twoFactorAuthPassword,
    setTwoFactorAuthPassword,
    contractPassword,
    setContractPassword,
    chainId,
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
    setWeb3,
    setFujiCoreContract,
    setFujiTwoFAContract,
    setMumbaiCoreContract,
    setMumbaiTwoFAContract,
    setRippleCoreContract,
    setRippleTwoFAContract,
    setFujiBatchSignUpContract,
    setMumbaiBatchSignUpContract,
    setRippleBatchSignUpContract,
    metamaskAvailable,
    setMetamaskAvailable,
    setApiErrorNotif,
    setApiErrorTopText,
    setApiErrorBottomText
  } = useGlobal()
  // const [showErrorNotif, setShowErrorNotif] = useState(false);
  // const [errorTopText, setApiErrorTopText] = useState('')
  // const [errorBottomText, setApiErrorBottomText] = useState('')
  const [showQuickstart, setShowQuickstart] = useState(
    <div className="min-h-screen">
      {/* setApiErrorNotif
        open={showErrorNotif}
        error={true}
        showTopText={errorTopText}
        showBottomText={errorBottomText}
        onClose={() => setShowErrorNotif(false)}
      /> */}
      {/* <h2 className="mt-10 text-center text-3xl font-bold tracking-tight">
        Please connect your wallet to get started.
      </h2> */}
    </div>
  )

  // const makeErrorNotif = (topText, bottomText) => {
  //   setShowErrorNotif(true)
  //   setApiErrorTopText(topText)
  //   setApiErrorBottomText(bottomText)
  // }

  const resetSubmitButton = () => {
    if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent = 'Onboard'
      document.getElementById('submitButton').className =
        'ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
      document.getElementById('submitButton').disabled = false
    }
  }

  const handleGenerateRSAKeys = async () => {
    try {
      const keys = await generateRSAKeys()
      // Set the values of rsa_enc_pub_key and rsa_enc_priv_key fields directly
      document.getElementById('rsa_enc_pub_key').value = keys.publicKey
      document.getElementById('rsa_enc_priv_key').value = keys.privateKey
    } catch (error) {
      console.error('Error generating RSA keys:', error)
    }
  }

  const handleGenerateRSASigningKeys = async () => {
    try {
      const keys = await generateRSASigningKeys()
      // Set the values of rsa_enc_pub_key and rsa_enc_priv_key fields directly
      document.getElementById('rsa_sign_pub_key').value = keys.publicKey
      document.getElementById('rsa_sign_priv_key').value = keys.privateKey
    } catch (error) {
      console.error('Error generating RSA keys:', error)
    }
  }

  const callContractMethods = async (
    targetChainId,
    formDataJSON,
    userSecretHash,
    publicInformation,
  ) => {

    if (fujiBatchSignUpContract == null) {
      await initializeWeb3()
    }


    const batchSignUpContract =
      targetChainId == chains['fuji']
        ? fujiBatchSignUpContract
        : targetChainId == chains['mumbai']
          ? mumbaiBatchSignUpContract
          : rippleBatchSignUpContract

    let data = batchSignUpContract.methods
      .batchSignUp(
        userSecretHash,
        formDataJSON['rsa_enc_pub_key'],
        formDataJSON['rsa_sign_pub_key'],
        publicInformation,
      )
      .encodeABI()

    let txObject = {
      from: userAddress,
      to: batchSignUpContract.options.address,
      data: data,
      gas: 3000000,
    }
    if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent = 'Awaiting sign-up acceptance...'
    }
    try {
      let receipt = await web3.eth.sendTransaction(txObject)
    } catch (error) {
      console.error('Batch SignUp Transaction error:', error.toString())
      resetSubmitButton()
      setApiErrorNotif(true)
      setApiErrorTopText('Batch SignUp Transaction error:')
      setApiErrorBottomText(error.data.message.toString())
      return false
      
    }
    return true
  }

  const switchChain = async (targetChainId) => {
    const chainIdHex = `0x${targetChainId.toString(16)}`
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
    } catch (error) {
      console.error('Error switching chains:', error)
      resetSubmitButton()
      setApiErrorNotif(true)
      setApiErrorTopText('Error switching chains:')
      setApiErrorBottomText(error.toString())
    }
  }

  const handleSubmit = async (event) => {
    if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent = 'Submitting...'
      document.getElementById('submitButton').className =
        'ml-3 inline-flex justify-center rounded-md border border-transparent bg-gray-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
      document.getElementById('submitButton').disabled = true
    }

    event.preventDefault()

    const formData = new FormData(event.target)
    const formDataJSON = formToJSON(formData)
        if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent = 'Submitting...'
      document.getElementById('submitButton').className =
        'ml-3 inline-flex justify-center rounded-md border border-transparent bg-gray-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
      document.getElementById('submitButton').disabled = true
    }
    try {
      const chainsToSwitch = Object.entries(chains)
        .filter(([key, value]) => formDataJSON[key + '_checkbox'] === 'on')
        .map(([key, value]) => value)
      let chain_data = {}
      chainsToSwitch.forEach((chain) => {
        chain_data[`0x${chain.toString(16)}`] = {
          rsa_enc_pub_key: formDataJSON['rsa_enc_pub_key'],
          rsa_enc_priv_key: formDataJSON['rsa_enc_priv_key'],
          rsa_sign_pub_key: formDataJSON['rsa_sign_pub_key'],
          rsa_sign_priv_key: formDataJSON['rsa_sign_priv_key'],
          public_info: formDataJSON['data'],
        }
      })
      const quickstart_JSON = {
        contract_password: formDataJSON['contract_password'],
        '2fa_password': formDataJSON['2fa_password'],
        password: formDataJSON['password'],
        chain_data: chain_data,
        rsa_enc_key_pub_check: formDataJSON['rsa_enc_key_pub_check'] === 'on',
        rsa_sign_key_pub_check: formDataJSON['rsa_sign_key_pub_check'] === 'on',
        userdata_check: true,
        rsa_enc_key_pub_check: true,
        rsa_sign_key_pub_check: true,
      }


      const userSecretHashBigint = stringToBigInt(formDataJSON['2fa_password'])
      const userSecretHash = await poseidon([userSecretHashBigint.toString()])
      if (document.getElementById('submitButton')) {
        document.getElementById('submitButton').textContent = 'Switching chains...'
      }
      for (const targetChainId of chainsToSwitch) {
        await switchChain(targetChainId)
        const chainResponse = await callContractMethods(
          targetChainId,
          formDataJSON,
          userSecretHash,
          formDataJSON['data'],
        )
        if(!chainResponse) {
          return
        }
      }

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId }],
        })
      } catch (error) {
        console.error('User Rejected Switching to Original Chain', error)
        resetSubmitButton()
        setApiErrorNotif(true)
        setApiErrorTopText('User Rejected Switching to Original Chain')
        setApiErrorBottomText(error.toString())
        return
      }

      async function callCreateUser() {
        try {
          const createUserResponse = await createUser(
            userAddress,
            quickstart_JSON,
          )
          if (createUserResponse['data'] === 'Item created successfully!') {
            Router.push('/dashboard')
            setLoggedIn(true)
            setShowLoginNotification(true)
            setContractPassword(formDataJSON['contract_password'])
            setTwoFactorAuthPassword(formDataJSON['2fa_password'])
            setUserPassword(formDataJSON['password'])
          }
          // } else {
          //   console.error('Error in signing up user.', createUserResponse)
          //   setApiErrorNotif(true)
          //   setApiErrorTopText('Error in signing up user.')
          //   setApiErrorBottomText(createUserResponse['data'])
          // }
        } catch (error) {
          resetSubmitButton()
          setApiErrorNotif(true)
          setApiErrorTopText('Error in signing up user.')
          setApiErrorBottomText(error.toString())
          return
        }
      }
      if (document.getElementById('submitButton')) {
        document.getElementById('submitButton').textContent = 'Submitting sign-up...'
      }
      callCreateUser()
    } catch (error) {
      resetSubmitButton()
      setApiErrorNotif(true)
      setApiErrorTopText('Error in signing up user.')
      setApiErrorBottomText(error)
      return
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

  const showQuickstartConditional = () => {
    if (typeof window !== undefined && !window.ethereum) {
      return (
        <div className="my-48 mx-20 font-semibold">
          <Note>
            Web3 is not available on this device.
            Our guide is available on all devices, but please connect somewhere
            with Metamask available to use our dApp.
          </Note>
        </div>
        // <h2 className="my-48 text-center text-2xl tracking-tight">
        //   Web3 is not available on this device.
        //   <br />
        //   Our guide is available on all devices, but please connect somewhere
        //   with Metamask available to use our dApp.
        // </h2>
      )
    } else if (!walletConnected) {
      return (
        <>
        <div className="my-48 mx-20 font-semibold items-center justify-center">
          <Note>
            Please connect your wallet to get started.
          </Note>
        </div>
        {/* <h2 className="my-48 text-center text-3xl font-bold tracking-tight">
          Please connect your wallet to get started.
        </h2> */}
        </>
      )
    } else if (loggedIn) {
      return (
        <div className="my-48 mx-20 font-semibold">
          <Note>
            Account already exists for address <span className="font-mono">{userAddress}</span>. 
            Please disconnect wallet and reconnect with a new wallet to create a new account.
          </Note>
        </div>
        // <h2 className="my-48 text-center text-2xl tracking-tight">
        //   Account already exists for address {userAddress}.
        //   <br />
        //   Please disconnect wallet and reconnect with a new wallet to create a
        //   new account.
        // </h2>
      )
    } else {
      return (
        <>
          <Guide />
          <form
            className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700"
            action="#"
            method="POST"
            onSubmit={handleSubmit}
          >
            <div className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700 sm:space-y-5">
              <div className="space-y-6 sm:space-y-5">
                <div>
                  <h2 className="text-2xl font-bold leading-6">Sign Up</h2>
                  <p className="mt-4 max-w-2xl text-sm">
                    Please enter the following information to get started.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold leading-6">Passwords</h3>
                  <p className="mt-1 max-w-2xl text-sm">
                    Select a secure password for each of the following services.
                  </p>
                </div>

                <div className="dark:border-gray-700 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold sm:mt-px sm:pt-2"
                  >
                    Database Password:
                  </label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete=""
                      className="relative block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="dark:border-gray-700 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold sm:mt-px sm:pt-2"
                  >
                    2FA Password:
                  </label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      id="2fa_password"
                      name="2fa_password"
                      type="password"
                      autoComplete=""
                      className="relative block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="dark:border-gray-700 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold sm:mt-px sm:pt-2"
                  >
                    Smart Contract Password:
                  </label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      id="contract_password"
                      name="contract_password"
                      type="password"
                      autoComplete=""
                      className="relative block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-3 sm:space-y-5 sm:pt-5">
                <div>
                  <h3 className="text-lg font-bold leading-6">
                    RSA Encryption Keys
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm">
                    Generate new RSA Keys instantly, or provide your own.
                  </p>
                </div>

                <div className="dark:border-gray-700 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="about"
                    className="block text-sm font-bold sm:mt-px sm:pt-2"
                  >
                    RSA Encryption Key - Public Key
                  </label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0 font-mono">
                    <textarea
                      id="rsa_enc_pub_key"
                      name="rsa_enc_pub_key"
                      rows={3}
                      className="relative block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      defaultValue={''}
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div className="dark:border-gray-700 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="about"
                    className="block text-sm font-bold sm:mt-px sm:pt-2"
                  >
                    RSA Encryption Key - Private Key
                  </label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0 font-mono">
                    <textarea
                      id="rsa_enc_priv_key"
                      name="rsa_enc_priv_key"
                      rows={3}
                      className="relative block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      defaultValue={''}
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      onClick={handleGenerateRSAKeys}
                    >
                      Generate Random Keys
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-3 sm:space-y-5 sm:pt-5">
                <div>
                  <h3 className="text-lg font-bold leading-6">
                    RSA Signing Keys
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm">
                    Generate new RSA Keys instantly, or provide your own.
                  </p>
                </div>

                <div className="dark:border-gray-700 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="about"
                    className="block text-sm font-bold sm:mt-px sm:pt-2"
                  >
                    RSA Signing Key - Public Key
                  </label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0 font-mono">
                    <textarea
                      id="rsa_sign_pub_key"
                      name="rsa_sign_pub_key"
                      rows={3}
                      className="relative block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      defaultValue={''}
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div className="dark:border-gray-700 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="about"
                    className="block text-sm font-bold sm:mt-px sm:pt-2"
                  >
                    RSA Signing Key - Private Key
                  </label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0 font-mono">
                    <textarea
                      id="rsa_sign_priv_key"
                      name="rsa_sign_priv_key"
                      rows={3}
                      className="relative block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      defaultValue={''}
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      onClick={handleGenerateRSASigningKeys}
                    >
                      Generate Random Keys
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-3 sm:space-y-5 sm:pt-5">
                <div>
                  <h3 className="text-lg font-bold leading-6">
                    (Optional) Public Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm">
                    Enter some basic information to be publicly available for
                    your account.
                  </p>
                </div>

                <div className="dark:border-gray-700 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="about"
                    className="block text-sm font-bold sm:mt-px sm:pt-2"
                  >
                    Public Information
                  </label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0">
                    <textarea
                      id="data"
                      name="data"
                      rows={3}
                      className="relative block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      defaultValue={''}
                      spellCheck="false"
                    />
                    <p className="mt-2 text-sm">
                      Write a few sentences about yourself.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 divide-y divide-gray-200 pt-8 dark:divide-gray-700 sm:space-y-5 sm:pt-10">
                <div>
                  <h3 className="text-lg font-bold leading-6">
                    Onboard to Smart Contract
                  </h3>
                  <p className="mt-1 max-w-none text-sm">
                    Please select to which chains you&apos;d like to onboard
                    immediately. You can onboard to other chains in the
                    &quot;onboard to new chains&quot; section.
                  </p>
                </div>
                <div className="space-y-6 divide-y divide-gray-200 dark:divide-gray-700 sm:space-y-5">
                  <div className="pt-6 sm:pt-5">
                    <div role="group" aria-labelledby="label-email">
                      <div className="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4">
                        <div>
                          <div
                            className="text-base font-bold sm:text-sm"
                            id="label-email"
                          >
                            Blockchain:
                          </div>
                        </div>
                        <div className="mt-4 sm:col-span-2 sm:mt-0">
                          <div className="max-w-lg space-y-4">
                            <div className="relative flex items-start">
                              <div className="flex h-5 items-center">
                                <input
                                  id="fuji_checkbox"
                                  name="fuji_checkbox"
                                  type="checkbox"
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-700"
                                  defaultChecked
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  htmlFor="comments"
                                  className="font-medium"
                                >
                                  Avalanche Fuji Testnet
                                </label>
                                <p>
                                  The Fuji Testnet serves as the official
                                  testnet for the Avalanche ecosystem.
                                </p>
                              </div>
                            </div>
                            <div className="relative flex items-start">
                              <div className="flex h-5 items-center">
                                <input
                                  id="mumbai_checkbox"
                                  name="mumbai_checkbox"
                                  type="checkbox"
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-700"
                                  defaultChecked
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  htmlFor="candidates"
                                  className="font-medium"
                                >
                                  Polygon Mumbai Testnet
                                </label>
                                <p>
                                  The Mumbai testnet is the testnet of the
                                  Polygon network, which replicates the Polygon
                                  mainnet.
                                </p>
                              </div>
                            </div>
                            <div className="relative flex items-start">
                              <div className="flex h-5 items-center">
                                <input
                                  id="ripple_checkbox"
                                  name="ripple_checkbox"
                                  type="checkbox"
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-700"
                                  defaultChecked
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="offers" className="font-medium">
                                  Ripple EVM Sidechain
                                </label>
                                <p>
                                  The Ethereum Virtual Machine (EVM) compatible
                                  XRP Ledger sidechain is a fast and secure
                                  blockchain that brings web3 applications to
                                  the XRP Ledger community.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  id="submitButton"
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Submit Form
                </button>
              </div>
            </div>
          </form>
        </>
      )
    }
  }

  // useEffect(() => {
  //   setShowQuickstart(showQuickstartConditional())
  //   initializeWeb3()
  // }, [walletConnected, userAddress])

  // useEffect(() => {
  //   // Call the initialization function when the component mounts
  //   console.log('useEffect initializeWeb3 called')
  //   initializeWeb3()
  // }, [])

  useEffect(() => {
    initializeWeb3().then(() => {
      setShowQuickstart(showQuickstartConditional());
    });
  }, [walletConnected, userAddress, metamaskAvailable, loggedIn]);

  return <div className="max-w-none">
    {showQuickstart}
    </div>
}

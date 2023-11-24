import Guide from './quickstart_guide.mdx';
import { useGlobal } from '@/components/GlobalStorage';
import { useState } from 'react';
import axios, { formToJSON } from 'axios';
import Router from 'next/router';
import { createUser } from '@/components/APICalls'

export default function Example() {
  let { walletConnected, userAddress, showLoginNotification, 
    setShowLoginNotification, loggedIn, setLoggedIn, userPassword, setUserPassword, username, setUsername, twoFactorAuthPassword, setTwoFactorAuthPassword,
    contractPassword, setContractPassword } = useGlobal();
  const [rsaEncPubKey, setRsaEncPubKey] = useState('');
  const [rsaEncPrivKey, setRsaEncPrivKey] = useState('');
  const [rsaSignPubKey, setRsaSignPubKey] = useState('');
  const [rsaSignPrivKey, setRsaSignPrivKey] = useState('');
  const [userData, setUserData] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();


      try {
        const quickstart_JSON = {
          "contract_password": contractPassword,
          "2fa_password": twoFactorAuthPassword,
          "rsa_enc_pub_key": rsaEncPubKey,
          "rsa_enc_priv_key": rsaEncPubKey,
          "rsa_sign_pub_key": rsaEncPubKey,
          "rsa_sign_priv_key": rsaEncPubKey,
          "data": JSON.parse(userData),
          "requests_sent": {},
          "requests_received": {},
          "responses_sent": {},
          "responses_received": {}
        }
        console.log(quickstart_JSON)

        async function callCreateUser() {
          try {
            const createUserResponse = await createUser(userAddress, userPassword, quickstart_JSON);
            Router.push('/dashboard')
            setLoggedIn(true)
            setShowLoginNotification(true)
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
    
        callCreateUser()
        
        
      } catch (error) {
        // Handle errors, e.g., show an error message
        console.error('Authentication failed', error);
      }
  };

  return (

    <>
    {!walletConnected ? (
      <h2 className="mt-10 text-center text-3xl font-bold tracking-tight">
        Please connect your wallet to get started.
      </h2>
    ) : (
    <>
    <Guide />
    <form className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700 sm:space-y-5">
        <div className="space-y-6 sm:space-y-5">
          <div>
            <h2 className="text-2xl font-bold leading-6 ">Sign Up</h2>
            <p className="mt-4 max-w-2xl text-sm ">
              Please enter the following information to get started.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium leading-6 ">Passwords</h3>
            <p className="mt-1 max-w-2xl text-sm ">Use a permanent address where you can receive mail.</p>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 dark:border-gray-700 sm:pt-5">
            <label htmlFor="email" className="block text-sm font-medium sm:mt-px sm:pt-2">
              Database Password: 
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete=""
                onChange={(e) => setUserPassword(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 dark:border-gray-700 sm:pt-5">
            <label htmlFor="email" className="block text-sm font-medium sm:mt-px sm:pt-2">
              2FA Password: 
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <input
                id="2fa_password"
                name="2fa_password"
                type="password"
                autoComplete=""
                onChange={(e) => setTwoFactorAuthPassword(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 dark:border-gray-700 sm:pt-5">
            <label htmlFor="email" className="block text-sm font-medium sm:mt-px sm:pt-2">
              Smart Contract Password: 
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <input
                id="contract_password"
                name="contract_password"
                type="password"
                autoComplete=""
                onChange={(e) => setContractPassword(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>

        </div>

        <div className="space-y-6 pt-3 sm:space-y-5 sm:pt-5">
          <div>
            <h3 className="text-lg font-medium leading-6 ">RSA Encryption Keys</h3>
            <p className="mt-1 max-w-2xl text-sm ">Use a permanent address where you can receive mail.</p>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 dark:border-gray-700 sm:pt-5">
            <label htmlFor="about" className="block text-sm font-medium sm:mt-px sm:pt-2">
              RSA Encryption Key - Public Key 
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <textarea
                id="rsa_enc_pub_key"
                name="rsa_enc_pub_key"
                rows={3}
                onChange={(e) => setRsaEncPubKey(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
                defaultValue={''}
                spellcheck="false"
              />
              <p className="mt-2 text-sm ">Write a few sentences about yourself.</p>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 dark:border-gray-700 sm:pt-5">
            <label htmlFor="about" className="block text-sm font-medium sm:mt-px sm:pt-2">
              RSA Encryption Key - Private Key
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <textarea
                id="rsa_enc_priv_key"
                name="rsa_enc_priv_key"
                rows={3}
                onChange={(e) => setRsaEncPrivKey(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
                defaultValue={''}
                spellcheck="false"
              />
              <p className="mt-2 text-sm ">Write a few sentences about yourself.</p>
            </div>
          </div>


          <div className="pt-1">
            <div className="flex justify-end">
              <button
                type="button"
                className="mt-3 ml-3 inline-flex w-full justify-center rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-slate-200 dark:hover:bg-slate-900 sm:mt-0 sm:w-auto"
              >
                Generate Random Keys
              </button>
              <button
                type="button"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Validate Keys
              </button>
            </div>
          </div>
        

        </div>
         
        <div className="space-y-6 pt-3 sm:space-y-5 sm:pt-5">
          <div>
            <h3 className="text-lg font-medium leading-6 ">RSA Signing Keys</h3>
            <p className="mt-1 max-w-2xl text-sm ">Use a permanent address where you can receive mail.</p>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 dark:border-gray-700 sm:pt-5">
            <label htmlFor="about" className="block text-sm font-medium sm:mt-px sm:pt-2">
              RSA Signing Key - Public Key 
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <textarea
                id="rsa_sign_pub_key"
                name="rsa_sign_pub_key"
                rows={3}
                onChange={(e) => setRsaSignPubKey(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
                defaultValue={''}
                spellcheck="false"
              />
              <p className="mt-2 text-sm ">Write a few sentences about yourself.</p>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 dark:border-gray-700 sm:pt-5">
            <label htmlFor="about" className="block text-sm font-medium sm:mt-px sm:pt-2">
              RSA Signing Key - Private Key
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <textarea
                id="rsa_sign_priv_key"
                name="rsa_sign_priv_key"
                rows={3}
                onChange={(e) => setRsaSignPrivKey(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
                defaultValue={''}
                spellcheck="false"
              />
              <p className="mt-2 text-sm ">Write a few sentences about yourself.</p>
            </div>
          </div>

          <div className="pt-1">
            <div className="flex justify-end">
              <button
                type="button"
                className="mt-3 ml-3 inline-flex w-full justify-center rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-slate-200 dark:hover:bg-slate-900 sm:mt-0 sm:w-auto"
              >
                Generate Random Keys
              </button>
              <button
                type="button"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Validate Keys
              </button>
            </div>
          </div>
        
        </div>

        <div className="space-y-6 pt-3 sm:space-y-5 sm:pt-5">
          <div>
            <h3 className="text-lg font-medium leading-6 ">(Optional) Public Information</h3>
            <p className="mt-1 max-w-2xl text-sm ">Use a permanent address where you can receive mail.</p>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 dark:border-gray-700 sm:pt-5">
            <label htmlFor="about" className="block text-sm font-medium sm:mt-px sm:pt-2">
              Public Information
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <textarea
                id="data"
                name="data"
                rows={3}
                onChange={(e) => setUserData(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
                defaultValue={''}
                spellcheck="false"
              />
              <p className="mt-2 text-sm ">Write a few sentences about yourself.</p>
            </div>
          </div>

        </div>


        <div className="space-y-6 divide-y divide-gray-200 dark:divide-gray-700 pt-8 sm:space-y-5 sm:pt-10">
          <div>
            <h3 className="text-lg font-medium leading-6 ">Onboard to Smart Contract</h3>
            <p className="mt-1 max-w-2xl text-sm ">
              Please select which of the parameters you would like to onboard to the smart contract.
            </p>
          </div>
          <div className="space-y-6 divide-y divide-gray-200 dark:divide-gray-700 sm:space-y-5">
            <div className="pt-6 sm:pt-5">
              <div role="group" aria-labelledby="label-email">
                <div className="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4">
                  <div>
                    <div className="text-base font-medium sm:text-sm" id="label-email">
                      Parameter: 
                    </div>
                  </div>
                  <div className="mt-4 sm:col-span-2 sm:mt-0">
                    <div className="max-w-lg space-y-4">
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="comments"
                            name="comments"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="comments" className="font-medium ">
                            RSA Encryption Key - Public 
                          </label>
                          <p>Allows others to look up your public key through the smart contract.</p>
                        </div>
                      </div>
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="candidates"
                            name="candidates"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="candidates" className="font-medium ">
                            RSA Signing Key - Public 
                          </label>
                          <p className="">Allows others to verify your signatures.</p>
                        </div>
                      </div>
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="offers"
                            name="offers"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="offers" className="font-medium ">
                            Public Information 
                          </label>
                          <p className="">Allows others to look up public information associated with your account.</p>
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
            onClick={handleSubmit}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Submit Form
          </button>
        </div>
      </div>
    </form>
    </>
    )}
    </>
  )
}

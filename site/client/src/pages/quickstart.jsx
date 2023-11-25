import Web3 from 'web3';
import Router from 'next/router';
import axios, { formToJSON } from 'axios';
import { useEffect, useState } from 'react';
import Guide from './quickstart_guide.mdx';
import { useGlobal } from '@/components/GlobalStorage';
import { createUser } from '@/components/APICalls'
import { poseidon } from '@/components/PoseidonHash';
import { stringToBigInt } from '@/components/HelperCalls';
import { generateRSAKeys, generateRSASigningKeys } from '@/components/HelperCalls';
import coreContractABI from '../../public/contract_ABIs/ZKPServicesCore.json'; 
import twoFAContractABI from '../../public/contract_ABIs/ZKPServicesVRF2FA.json'; 

const chains = {
  "fuji": 43113, 
  "mumbai": 80001, 
  "ripple": 1440002
}

export default function Quickstart() {
  let { walletConnected, userAddress, showLoginNotification, 
    setShowLoginNotification, loggedIn, setLoggedIn, userPassword, 
    setUserPassword, username, setUsername, twoFactorAuthPassword, 
    setTwoFactorAuthPassword, contractPassword, setContractPassword, 
    chainId, web3, fujiCoreContract, fujiTwoFAContract, 
    mumbaiCoreContract, mumbaiTwoFAContract, rippleCoreContract,
    rippleTwoFAContract, setWeb3, setFujiCoreContract,
    setFujiTwoFAContract, setMumbaiCoreContract, setMumbaiTwoFAContract,
    setRippleCoreContract, setRippleTwoFAContract } = useGlobal();
  const [showQuickstart, setShowQuickstart] = useState(<h2 className="mt-10 text-center text-3xl font-bold tracking-tight">
  Please connect your wallet to get started.
</h2>)

  const handleGenerateRSAKeys = async () => {
    try {
      const keys = await generateRSAKeys();
      // Set the values of rsa_enc_pub_key and rsa_enc_priv_key fields directly
      document.getElementById('rsa_enc_pub_key').value = keys.publicKey;
      document.getElementById('rsa_enc_priv_key').value = keys.privateKey;
    } catch (error) {
      console.error('Error generating RSA keys:', error);
    }
  };

  const handleGenerateRSASigningKeys = async () => {
    try {
      const keys = await generateRSASigningKeys();
      // Set the values of rsa_enc_pub_key and rsa_enc_priv_key fields directly
      document.getElementById('rsa_sign_pub_key').value = keys.publicKey;
      document.getElementById('rsa_sign_priv_key').value = keys.privateKey;
    } catch (error) {
      console.error('Error generating RSA keys:', error);
    }
  };

  const callContractMethods = async (targetChainId, formDataJSON, userSecretHash, publicInformation) => {
    if(fujiCoreContract === null){
      await initializeWeb3();
    }
    const coreContract = targetChainId == chains['fuji'] ? fujiCoreContract :
                        targetChainId == chains['mumbai'] ? mumbaiCoreContract :
                        rippleCoreContract;
                    
    console.log(chainId);
    console.log(coreContract, targetChainId);

    const twoFAContract = targetChainId == chains['fuji'] ? fujiTwoFAContract :
                        targetChainId == chains['mumbai'] ? mumbaiTwoFAContract :
                        rippleTwoFAContract;

    let data = coreContract.methods.setRSAEncryptionKey(formDataJSON['rsa_enc_pub_key']).encodeABI();
    let txObject = {
      from: userAddress,
      to: coreContract.options.address,
      data: data,
      gas: 1000000,
    };
    let receipt = await web3.eth.sendTransaction(txObject);
    console.log('RSA Encryption Key Transaction Receipt:', receipt);

    data = coreContract.methods.setRSASigningKey(formDataJSON['rsa_sign_pub_key']).encodeABI();
    txObject = {
      from: userAddress,
      to: coreContract.options.address,
      data: data,
      gas: 1000000,
    };
    receipt = await web3.eth.sendTransaction(txObject);
    console.log('RSA Signing Key Transaction Receipt:', receipt);

    if(publicInformation.length>0){
      data = coreContract.methods.setPublicUserInformation(publicInformation).encodeABI();
      txObject = {
        from: userAddress,
        to: coreContract.options.address,
        data: data,
        gas: 1000000,
      };
      receipt = await web3.eth.sendTransaction(txObject);
      console.log('Set Public Information Transaction Receipt:', receipt);
    }
    
    data = twoFAContract.methods.setSecret(userSecretHash).encodeABI();
    txObject = {
      from: userAddress,
      to: twoFAContract.options.address,
      data: data,
      gas: 1000000, 
    };
    receipt = await web3.eth.sendTransaction(txObject);
    console.log('2FA Secret Set Transaction Receipt:', receipt);
  };

  const switchChain = async (targetChainId) => {
    const chainIdHex = `0x${targetChainId.toString(16)}`; 
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (error) {
      // Log the error
      console.error('Could not switch chains:', error);
    }
  };

  const handleSubmit = async (event) => {

    event.preventDefault();

    const formData = new FormData(event.target);
    const formDataJSON = formToJSON(formData); 

    try {
      const quickstart_JSON = {
        "contract_password": formDataJSON['contract_password'],
        "2fa_password": formDataJSON['2fa_password'],
        "rsa_enc_pub_key": formDataJSON['rsa_enc_pub_key'],
        "rsa_enc_priv_key": formDataJSON['rsa_enc_priv_key'],
        "rsa_sign_pub_key": formDataJSON['rsa_sign_pub_key'],
        "rsa_sign_priv_key": formDataJSON['rsa_sign_priv_key'],
        "chain_data": {
          [chainId]: {
            "data": {
              "public_info": {
                "message": formDataJSON['data']
              } 
            }
          }
        },
        "rsa_enc_key_pub_check": formDataJSON['rsa_enc_key_pub_check'] === 'on', 
        "rsa_sign_key_pub_check": formDataJSON['rsa_sign_key_pub_check'] === 'on' ,
        "userdata_check": true,
        "rsa_enc_key_pub_check": true,
        "rsa_sign_key_pub_check": true
      };

      const userSecretHashBigint = stringToBigInt(formDataJSON['2fa_password']);
      const userSecretHash = await poseidon([userSecretHashBigint.toString()]);
      const chainsToSwitch = Object.entries(chains).filter(([key, value]) => formDataJSON[key + '_checkbox'] === 'on').map(([key, value]) => value);

      // for (const targetChainId of chainsToSwitch) {
      //   await switchChain(targetChainId);
      //   console.log(`targetChainId: ${targetChainId}, formDataJSON: ${formDataJSON}, userSecretHash: ${userSecretHash}, formDataJSON['data']: ${formDataJSON['data']}`)
      //   await callContractMethods(targetChainId, formDataJSON, userSecretHash, formDataJSON['data']);
      // }

      // try {
      //   await window.ethereum.request({
      //     method: 'wallet_switchEthereumChain',
      //     params: [{ chainId: chainId }],
      //   });
      // } catch {
      //   // Log the error
      //   console.log('User Rejected Switching to Original Chain');
      // }

      async function callCreateUser() {
        try {
          const createUserResponse = await createUser(userAddress, userPassword, quickstart_JSON);
          if(createUserResponse['data'] === "Item created successfully!") {
            console.log(createUserResponse)
            Router.push('/dashboard');
            setLoggedIn(true);
            setShowLoginNotification(true);
          } else {
            console.error('Error in signing up user.', createUserResponse)
          }
          
        } catch (error) {
          console.error('Error fetching user data C:', error);
        }
      }
      
      callCreateUser();
    } catch (error) {
      console.error('Authentication failed', error);
    }
  };

  async function initializeWeb3(){
    //these are too large for local storage and need to be reinstantiated each time
    const web3Instance = new Web3(window.ethereum);
    setWeb3(web3Instance);

    const coreContractAbi = coreContractABI; 
    const fujiCoreContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 
    const mumbaiCoreContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 
    const rippleCoreContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 

    const fujiCoreContractInstance = new web3Instance.eth.Contract(coreContractAbi, fujiCoreContractAddress);
    const mumbaiCoreContractInstance = new web3Instance.eth.Contract(coreContractAbi, mumbaiCoreContractAddress);
    const rippleCoreContractInstance = new web3Instance.eth.Contract(coreContractAbi, rippleCoreContractAddress);
    setFujiCoreContract(fujiCoreContractInstance);
    console.log(`fujiCoreContractInstance: ${fujiCoreContractInstance}`)
    setMumbaiCoreContract(mumbaiCoreContractInstance);
    setRippleCoreContract(rippleCoreContractInstance);

    const twoFAContractAbi = twoFAContractABI;
    const fujiTwoFAContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 
    const mumbaiTwoFAContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 
    const rippleTwoFAContractAddress = '0x84713a3a001E2157d134B97C59D6bdAb351dd69d'; 

    const fujiTwoFAContractInstance = new web3Instance.eth.Contract(twoFAContractAbi, fujiTwoFAContractAddress);
    const mumbaiTwoFAContractInstance = new web3Instance.eth.Contract(twoFAContractAbi, mumbaiTwoFAContractAddress);
    const rippleTwoFAContractInstance = new web3Instance.eth.Contract(twoFAContractAbi, rippleTwoFAContractAddress);
    setFujiTwoFAContract(fujiTwoFAContractInstance);
    setMumbaiTwoFAContract(mumbaiTwoFAContractInstance);
    setRippleTwoFAContract(rippleTwoFAContractInstance);
  }

  const showQuickstartConditional = () => {
    return !walletConnected ?         
        <h2 className="mt-10 text-center text-3xl font-bold tracking-tight">
          Please connect your wallet to get started.
        </h2> : <>
        <Guide />
        <form className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700" action="#" method="POST" onSubmit={handleSubmit}>
          <div className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700 sm:space-y-5">
            <div className="space-y-6 sm:space-y-5">
              <div>
                <h2 className="text-2xl font-bold leading-6">Sign Up</h2>
                <p className="mt-4 max-w-2xl text-sm">
                  Please enter the following information to get started.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium leading-6">Passwords</h3>
                <p className="mt-1 max-w-2xl text-sm">Use a permanent address where you can receive mail.</p>
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
                    className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-3 sm:space-y-5 sm:pt-5">
              <div>
                <h3 className="text-lg font-medium leading-6">RSA Encryption Keys</h3>
                <p className="mt-1 max-w-2xl text-sm">Use a permanent address where you can receive mail.</p>
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
                    className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
                    defaultValue={''}
                    spellCheck="false"
                  />
                  <p className="mt-2 text-sm">Write a few sentences about yourself.</p>
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
                    className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
                    defaultValue={''}
                    spellCheck="false"
                  />
                  <p className="mt-2 text-sm">Write a few sentences about yourself.</p>
                </div>
              </div>

              <div className="pt-1">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    onClick={handleGenerateRSAKeys}
                  >
                    Generate Random Keys
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-3 sm:space-y-5 sm:pt-5">
              <div>
                <h3 className="text-lg font-medium leading-6">RSA Signing Keys</h3>
                <p className="mt-1 max-w-2xl text-sm">Use a permanent address where you can receive mail.</p>
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
                    className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
                    defaultValue={''}
                    spellCheck="false"
                  />
                  <p className="mt-2 text-sm">Write a few sentences about yourself.</p>
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
                    className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
                    defaultValue={''}
                    spellCheck="false"
                  />
                  <p className="mt-2 text-sm">Write a few sentences about yourself.</p>
                </div>
              </div>

              <div className="pt-1">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    onClick={handleGenerateRSASigningKeys}
                  >
                    Generate Random Keys
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-3 sm:space-y-5 sm:pt-5">
              <div>
                <h3 className="text-lg font-medium leading-6">(Optional) Public Information</h3>
                <p className="mt-1 max-w-2xl text-sm">Use a permanent address where you can receive mail.</p>
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
                    className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-800 focus:ring-emerald-500 sm:text-sm"
                    defaultValue={''}
                    spellCheck="false"
                  />
                  <p className="mt-2 text-sm">Write a few sentences about yourself.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 divide-y divide-gray-200 dark:divide-gray-700 pt-8 sm:space-y-5 sm:pt-10">
              <div>
                <h3 className="text-lg font-medium leading-6">Onboard to Smart Contract</h3>
                <p className="mt-1 max-w-none text-sm">
                  Please select to which chains you'd like to onboard immediately. You can onboard to other chains in the "onboard to new chains" section.
                </p>
              </div>
              <div className="space-y-6 divide-y divide-gray-200 dark:divide-gray-700 sm:space-y-5">
                <div className="pt-6 sm:pt-5">
                  <div role="group" aria-labelledby="label-email">
                    <div className="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4">
                      <div>
                        <div className="text-base font-medium sm:text-sm" id="label-email">
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
                                className="h-4 w-4 mt-1 rounded border-gray-300 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="comments" className="font-medium">
                                Avalanche Fuji Testnet
                              </label>
                              <p>Allows others to look up your public key through the smart contract.</p>
                            </div>
                          </div>
                          <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                              <input
                                id="mumbai_checkbox"
                                name="mumbai_checkbox"
                                type="checkbox"
                                className="h-4 w-4 mt-1 rounded border-gray-300 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="candidates" className="font-medium">
                                Polygon Mumbai Testnet
                              </label>
                              <p>Allows others to verify your signatures.</p>
                            </div>
                          </div>
                          <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                              <input
                                id="ripple_checkbox"
                                name="ripple_checkbox"
                                type="checkbox"
                                className="h-4 w-4 mt-1 rounded border-gray-300 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="offers" className="font-medium">
                                Ripple EVM Sidechain
                              </label>
                              <p>Allows others to look up public information associated with your account.</p>
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
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Submit Form
              </button>
            </div>
          </div>
        </form>
      </>
    }

  useEffect(() => {
    setShowQuickstart(showQuickstartConditional())
  }, [walletConnected])

  return (
    <div className="max-w-none">
      {showQuickstart}
    </div>
  );
};  
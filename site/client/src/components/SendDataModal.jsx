import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useGlobal } from '@/components/GlobalStorage';
import { stringToBigInt, bigIntToString, generateCoreProof, generate2FAProof } from '@/components/HelperCalls';
import { poseidon } from '@/components/PoseidonHash';

export function SendDataModal({ 
  open = true,
  onClose,
  onSubmit,
  requestID,
  addressOfRequestingParty = "",
  fieldRequested = "",
  data = "",
  oneTimeKey = "",
  oneTimeSalt = "",
  timeLimit = "",
  twoFAProvider = "",
  twoFARequestID = "",
  twoFAOneTimeToken = "",
  responseFee = "",
  require2FA = false
}) {

  let {
    userAddress,
    fujiCoreContract,
    mumbaiCoreContract,
    rippleCoreContract,
    fujiTwoFAContract,
    mumbaiTwoFAContract,
    rippleTwoFAContract,
    web3,
    chainId
  } = useGlobal();

  const coreContract = chainId == 43113 ? fujiCoreContract :
                    chainId == 80001 ? mumbaiCoreContract :
                    chainId == 1440002 ? rippleCoreContract : null;
  const _2FAContract = chainId == 43113 ? fujiTwoFAContract:
                    chainId == 80001 ? mumbaiTwoFAContract:
                    chainId == 1440002 ? rippleTwoFAContract: null;

  const handleSubmit = () => {
    console.log("2FA _id", twoFARequestID);
    console.log("2FA _oneTimeKey", twoFAOneTimeToken);
    console.log("2FA two_factor_secret", "");
    console.log("core requestId", requestID);
    //dataLocation = poseidon(field + salt + user secret)
    console.log("core dataLocation", dataLocation);
    console.log("core saltHash", saltHash);
    console.log("core user_secret", "");
    //*3 smart contract calls
    //2FA steps:
    // 1*) requestRandomNumber(uint256 _id, string memory _oneTimeKey)
    // 2) getRandomNumber(uint256 _id) (public view function)
    // 3) get ZKP for next step by calling generate2FAProof
    //      ZKP requirements:
    //        random_number
    //        two_factor_secret
    //        secret_hash
    // 4*) verifyProof(
    //     uint256 _id,
    //     uint256 _randomNumber,
    //     uint256 _userSecretHash,
    //     uint256[2] calldata _pA,
    //     uint256[2][2] calldata _pB,
    //     uint256[2] calldata _pC,
    //     uint256[2] calldata _pubSignals
    // )
    //Response steps:
    // 5) get ZKP for next step by calling generateCoreProof
    //      ZKP requirements:
    //        field_0
    //        field_1
    //        field_salt
    //        one_time_key_0
    //        one_time_key_1
    //        user_secret_0
    //        user_secret_1
    //        provided_field_and_key_hash
    //        provided_field_and_salt_and_user_secret_hash
    //        provided_salt_hash
    // 6*) function respond(
    //     uint256 requestId,
    //     uint256 dataLocation,
    //     uint256 saltHash,
    //     uint256[2] calldata _pA,
    //     uint256[2][2] calldata _pB,
    //     uint256[2] calldata _pC,
    //     uint256[3] calldata _pubSignals,
    //     bool isUpdate
    // )
    onClose()
    onSubmit()
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-y-auto z-10 dark:bg-opacity-75 shadow-emerald-600" onClose={onClose}>
        <div className="min-h-screen flex items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-opacity-75" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div>
              <div className="relative bg-white rounded-lg max-w-screen-2xl mx-auto mt-6 px-4 pt-5 pb-4 text-left shadow-xl dark:bg-gray-800 sm:my-20 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-600 hover:text-gray-500 dark:hover-text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon
                      className="h-6 w-6 text-emerald-500 dark:text-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  Send Requested Data
                </Dialog.Title>
                <div className="mt-2 px-1 pb-1 lg:max-h-[65vh] max-h-[40vh] overflow-y-auto min-w-[16rem] md:min-w-[40rem] lg:min-w-[40rem]">

                  <div className="mt-4">
                    <label htmlFor="addressOfRequestingParty" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Address of Requesting Party:
                    </label>
                    <textarea
                      id="addressOfRequestingParty"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={addressOfRequestingParty}
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="fieldRequested" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Field Requested:
                    </label>
                    <textarea
                      id="fieldRequested"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={fieldRequested}
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="data" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Data:
                    </label>
                    <textarea
                      id="data"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={8}
                      readOnly
                      spellCheck="false"
                      value={data}
                    />
                  </div>

                  <hr className="my-4 border-gray-300 dark:border-gray-700" />

                  <div className="mt-4">
                    <label htmlFor="oneTimeKey" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      One Time Key:
                    </label>
                    <textarea
                      id="oneTimeKey"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={oneTimeKey}
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="oneTimeSalt" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      One Time Salt:
                    </label>
                    <textarea
                      id="oneTimeSalt"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={oneTimeSalt}
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="timeLimit" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Time Limit of Request (in seconds):
                    </label>
                    <textarea
                      id="timeLimit"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={timeLimit}
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="require2FA" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      2FA Required?
                    </label>
                    <input
                      type="checkbox"
                      id="require2FA"
                      className="mt-2 ml-1 h-4 w-4 rounded border border-gray-300 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500"
                      disabled
                      checked={require2FA}
                    />
                  </div>

                  {require2FA && (
                    <>
                      <div className="mt-4">
                        <label htmlFor="twoFAProvider" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                          2FA Provider (address/name):
                        </label>
                        <textarea
                          id="twoFAProvider"
                          className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                          rows={1}
                          readOnly
                          spellCheck="false"
                          value={twoFAProvider}
                        />
                      </div>

                      <div className="mt-4">
                        <label htmlFor="twoFARequestID" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                          2FA Request ID:
                        </label>
                        <textarea
                          id="twoFARequestID"
                          className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                          rows={1}
                          readOnly
                          spellCheck="false"
                          value={twoFARequestID}
                        />
                      </div>

                      <div className="mt-4">
                        <label htmlFor="twoFAOneTimeToken" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                          2FA One Time Token:
                        </label>
                        <textarea
                          id="twoFAOneTimeToken"
                          className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                          rows={1}
                          readOnly
                          spellCheck="false"
                          value={twoFAOneTimeToken}
                        />
                      </div>
                      
                      {(twoFAProvider.includes("zkp.services") || twoFAProvider.includes(_2FAContract?._address)) && (
                        <>
                          <div className="mt-6">
                            <label htmlFor="disclaimer" className="block text-sm font-bold leading-5 text-gray-900 dark:text-white">
                              Additional Contract Calls:
                            </label>
                            <p className="text-gray-500 dark:text-gray-300 mt-2 whitespace-normal">
                              Since the 2FA provider is zkp.services, a few smart contract calls may precede the core update smart 
                              contract call if 2FA has not already been completed.
                            </p>
                          </div>
                        </>
                      )}

                      <div className="mt-6">
                        <label htmlFor="disclaimer" className="block text-sm font-bold leading-5 text-gray-900 dark:text-white">
                          Disclaimer:
                        </label>
                        <p className="text-gray-500 dark:text-gray-300 mt-2 whitespace-normal">
                          2FA can only be completed via this dApp if a zkp.services 2FA provider has been chosen and the one time token was attached. For other providers, please use the dApp/frontend/etc. to complete 2FA.
                        </p>
                      </div>
                    </>
                  )}

                  <hr className="my-4 border-gray-300 dark:border-gray-700" />

                  <div className="mt-4">
                    <label htmlFor="responseFee" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Response Fee:
                    </label>
                    <textarea
                      id="responseFee"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={responseFee}
                    />
                  </div>

                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="mt-3 ml-3 inline-flex w-full justify-center rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-slate-200 dark:hover:bg-slate-900 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    onClick={handleSubmit}
                  >
                    Send Data
                  </button> 
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

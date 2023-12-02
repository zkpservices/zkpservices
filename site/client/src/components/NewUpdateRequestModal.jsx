import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { formToJSON } from 'axios'
import {
  generateRandomAsciiString24,
  stringToBigInt,
  flattenJsonAndComputeHash,
} from '@/components/HelperCalls'
import { Notification } from '@/components/Notification'
import { poseidon } from '@/components/PoseidonHash'
import { useGlobal } from '@/components/GlobalStorage'

const handleGenerateRandomKey = () => {
  try {
    const key = generateRandomAsciiString24()
    document.getElementById('oneTimeKey').value = key
  } catch (error) {
    console.error('Error generating random key:', error)
  }
}

const handleGenerateRandomToken = () => {
  try {
    const key = generateRandomAsciiString24()
    document.getElementById('twoFAOneTimeToken').value = key
  } catch (error) {
    console.error('Error generating random token:', error)
  }
}

const handleGenerateRandomSalt = () => {
  try {
    const salt = generateRandomAsciiString24()
    document.getElementById('oneTimeSalt').value = salt
  } catch (error) {
    console.error('Error generating random salt:', error)
  }
}

const handleGenerateRandomID = () => {
  try {
    const id = generateRandomAsciiString24()
    document.getElementById('twoFARequestID').value = id
  } catch (error) {
    console.error('Error generating random ID:', error)
  }
}

export function NewUpdateRequestModal({
  open,
  onClose,
  onSubmit,
  showNotif,
  receiverAddress = '',
  fieldToUpdate = '',
  newData = '',
  oneTimeKey = '',
  oneTimeSalt = '',
  timeLimit = '600',
  twoFAProvider = 'zkp.services',
  twoFARequestID = '',
  twoFAOneTimeToken = '',
  responseFee = '10',
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
    chainId,
  } = useGlobal()
  console.log(web3)

  const coreContract =
    chainId == 43113
      ? fujiCoreContract
      : chainId == 80001
      ? mumbaiCoreContract
      : chainId == 1440002
      ? rippleCoreContract
      : null
  const _2FAContract =
    chainId == 43113
      ? fujiTwoFAContract
      : chainId == 80001
      ? mumbaiTwoFAContract
      : chainId == 1440002
      ? rippleTwoFAContract
      : null

  const [isTwoFAEnabled, setIsTwoFAEnabled] = useState(false)
  const [twoFAForm, setTwoFAForm] = useState(<></>)

  const [showErrorNotif, setShowErrorNotif] = useState(false);
  const [errorTopText, setErrorTopText] = useState('')
  const [errorBottomText, setErrorBottomText] = useState('')

  const makeErrorNotif = (topText, bottomText) => {
    setShowErrorNotif(true)
    setErrorTopText(topText)
    setErrorBottomText(bottomText)
  }

  const resetSubmitButton = () => {
    if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent = 'Call Smart Contract'
      document.getElementById('submitButton').className =
        'ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
      document.getElementById('submitButton').disabled = false
    }
  }

  useEffect(() => {
    setTwoFAForm(twoFAFormConditional())
  }, [isTwoFAEnabled])

  const twoFAFormConditional = () => {
    if (isTwoFAEnabled) {
      return (
        <>
          <div className="mt-4">
            <label
              htmlFor="twoFAProvider"
              className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
            >
              2FA Provider (address/name):
            </label>
            <textarea
              id="twoFAProvider"
              name="twoFAProvider"
              className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
              rows={1}
              defaultValue={twoFAProvider}
              spellCheck="false"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="twoFARequestID"
              className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
            >
              2FA Request ID:
            </label>
            <textarea
              id="twoFARequestID"
              name="twoFARequestID"
              className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
              rows={1}
              // onChange={(e) => setTwoFARequestID(e.target.value)}
              spellCheck="false"
              defaultValue={
                document.getElementById('twoFARequestID') &&
                document.getElementById('twoFARequestID').value != ''
                  ? document.getElementById('twoFARequestID').value
                  : generateRandomAsciiString24()
              }
            />
            <button
              className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              type="button"
              onClick={handleGenerateRandomID}
            >
              Generate Random ID
            </button>
          </div>

          <div className="mt-4">
            <label
              htmlFor="twoFAOneTimeToken"
              className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
            >
              2FA One Time Token:
            </label>
            <textarea
              id="twoFAOneTimeToken"
              name="twoFAOneTimeToken"
              className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
              rows={1}
              // onChange={(e) => setTwoFARequestID(e.target.value)}
              spellCheck="false"
              defaultValue={
                document.getElementById('twoFAOneTimeToken') &&
                document.getElementById('twoFAOneTimeToken').value != ''
                  ? document.getElementById('twoFAOneTimeToken').value
                  : generateRandomAsciiString24()
              }
            />
            <button
              className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              type="button"
              onClick={handleGenerateRandomToken}
            >
              Generate Random Token
            </button>
          </div>

          <div className="mt-4">
            <label
              htmlFor="attachToken"
              className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
            >
              Attach One Time Token to Request (optional)?
            </label>
            <input
              type="checkbox"
              name="attachToken"
              id="attachToken"
              defaultChecked
              className="ml-1 mt-2 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-700"
            />
          </div>
        </>
      )
    } else {
      return <></>
    }
  }

  const handleSubmit = async (event) => {
    if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent = 'Running...'
      document.getElementById('submitButton').className =
        'ml-3 inline-flex justify-center rounded-md border border-transparent bg-gray-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
      document.getElementById('submitButton').disabled = true
    }

    event.preventDefault()
    const formData = new FormData(event.target)
    const formDataJSON = formToJSON(formData)

    const requestID = await poseidon([
      stringToBigInt(formDataJSON['fieldToUpdate'].substring(0, 24)),
      stringToBigInt(formDataJSON['fieldToUpdate'].substring(24, 48)),
      stringToBigInt(formDataJSON['oneTimeKey'].substring(0, 24)),
      stringToBigInt(formDataJSON['oneTimeKey'].substring(24, 48)),
    ])

    const twoFARequestIDBigInt = stringToBigInt(formDataJSON['twoFARequestID'])
      ? stringToBigInt(formDataJSON['twoFARequestID'])
      : ''
    const request = {
      address_receiver: formDataJSON['receiverAddress'].toLowerCase(),
      requestID: requestID.toString(),
      operation: 'update',
      field: formDataJSON['fieldToUpdate'],
      key: formDataJSON['oneTimeKey'],
      limit: formDataJSON['timeLimit'],
      timestamp: Date.now().toString(),
      updated_data: JSON.parse(formDataJSON['newData']),
      salt: formDataJSON['oneTimeSalt'],
      response_fee: formDataJSON['responseFee'],
      require2FA: isTwoFAEnabled,
      twoFAProvider:
        formDataJSON['twoFAProvider'] == 'zkp.services'
          ? _2FAContract['_address']
          : formDataJSON['twoFAProvider'],
      twoFARequestID: String(twoFARequestIDBigInt),
      twoFAOneTimeToken: formDataJSON['twoFAOneTimeToken'],
      attach_token: formDataJSON['attachToken'] === 'on',
    }

    let dataHashes = await flattenJsonAndComputeHash(formDataJSON['newData'])
    let rootHash = dataHashes['rootHash']
    console.log('rootHash', rootHash)

    if (isTwoFAEnabled) {
      try {
        const _2FASmartContractCallData = {
          _id: String(twoFARequestIDBigInt),
          _oneTimeKeyHash: web3.utils.keccak256(
            formDataJSON['twoFAOneTimeToken']
          ),
        }

        console.log(_2FASmartContractCallData)

        const data = _2FAContract.methods
          .generate2FA(
            _2FASmartContractCallData._id,
            _2FASmartContractCallData._oneTimeKeyHash
          )
          .encodeABI()

        const txObject = {
          from: userAddress,
          to: _2FAContract.options.address,
          data: data,
          gas: 500000,
        }
        if (document.getElementById('submitButton')) {
          document.getElementById('submitButton').textContent =
            'Awaiting 2FA acceptance...'
        }
        const receipt = await web3.eth.sendTransaction(txObject)
        console.log('2FA Contract Transaction Receipt:', receipt)
      } catch (error) {
        console.error('Error in 2FA Contract Call:', error)
        resetSubmitButton()
        makeErrorNotif("Error in 2FA Contract Call", error.toString())
        return
      } 
    }

    try {
      const coreContractCallData = {
        requestID: requestID.toString(),
        encryptedRequest: '',
        encryptedKey: '',
        timeLimit: formDataJSON['timeLimit'],
        _2FAProvider:
          formDataJSON['twoFAProvider'] == 'zkp.services' && isTwoFAEnabled
            ? _2FAContract['_address']
            : !isTwoFAEnabled
            ? "0x84713a3a001E2157d134B97C59D6bdAb351dd69d"
            : formDataJSON['twoFAProvider'],
        _2FAID: String(stringToBigInt(formDataJSON['twoFARequestID'])),
        responseFeeAmount: formDataJSON['responseFee'],
        dataHash: rootHash,
        saltHash: await poseidon([
          stringToBigInt(formDataJSON['oneTimeSalt'].substring(0, 24)),
        ]),
      }

      console.log(coreContractCallData)

      const data = coreContract.methods
        .requestUpdate(
          coreContractCallData.requestID,
          coreContractCallData.encryptedRequest,
          coreContractCallData.encryptedKey,
          coreContractCallData.timeLimit,
          coreContractCallData._2FAProvider,
          coreContractCallData._2FAID,
          coreContractCallData.responseFeeAmount,
          coreContractCallData.dataHash,
          coreContractCallData.saltHash
        )
        .encodeABI()

      const txObject = {
        from: userAddress,
        to: coreContract.options.address,
        data: data,
        gas: 500000,
      }
      if (document.getElementById('submitButton')) {
        document.getElementById('submitButton').textContent =
          'Awaiting request acceptance...'
      }
      const receipt = await web3.eth.sendTransaction(txObject)
      console.log('Core Contract Transaction Receipt:', receipt)
    } catch (error) {
      console.error('Error in Core Contract Call:', error)
      if (document.getElementById('submitButton')) {
        resetSubmitButton()
        makeErrorNotif("Error in Core Contract Call", error.toString())
        return  
      }
    }

    console.log(request)
    document.getElementById('submitButton').textContent =
      'Submitting request...'
    try {
      const result = await onSubmit(request)
    } catch (error) {
      console.error('Error submitting request to API:', error)
      resetSubmitButton()
      makeErrorNotif("Error submitting request to API:", error.toString())
      return    
    }
    if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent =
        'Call Smart Contract'
      document.getElementById('submitButton').className =
        'ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
      document.getElementById('submitButton').disabled = false
    }
    showNotif(false, 'New Update Request', 'Request submitted successfully.')
    onClose()
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto dark:bg-opacity-75"
        onClose={onClose}
      >
        <div className="flex min-h-screen items-center justify-center">
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
          <form onSubmit={handleSubmit}>
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
                <div className="relative mx-auto mt-6 max-w-screen-2xl rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl dark:bg-gray-800 sm:my-20 sm:w-full sm:max-w-3xl sm:p-6">
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-600 dark:hover:text-gray-400"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon
                        className="h-6 w-6 text-emerald-500 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-400"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    New Update Request
                  </Dialog.Title>
                  <div className="mt-2 max-h-[40vh] min-w-[16rem] overflow-y-auto px-1 pb-1 md:min-w-[40rem] lg:max-h-[65vh] lg:min-w-[40rem]">
                    <div className="mt-4">
                      <label
                        htmlFor="receiverAddress"
                        className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                      >
                        Address of Receiver:
                      </label>
                      <textarea
                        id="receiverAddress"
                        name="receiverAddress"
                        className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                        rows={1}
                        spellCheck="false"
                        defaultValue={receiverAddress}
                      />
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="fieldToUpdate"
                        className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                      >
                        Field to Update:
                      </label>
                      <textarea
                        id="fieldToUpdate"
                        name="fieldToUpdate"
                        className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                        rows={1}
                        spellCheck="false"
                        defaultValue={fieldToUpdate}
                      />
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="newData"
                        className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                      >
                        Enter New Data for Field:
                      </label>
                      <textarea
                        id="newData"
                        name="newData"
                        className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                        rows={8}
                        spellCheck="false"
                        defaultValue={newData}
                      />
                    </div>

                    <hr className="my-4 border-gray-300 dark:border-gray-700" />

                    <div className="mt-4">
                      <label
                        htmlFor="oneTimeKey"
                        className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                      >
                        One Time Key:
                      </label>
                      <textarea
                        id="oneTimeKey"
                        name="oneTimeKey"
                        className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                        rows={1}
                        spellCheck="false"
                        defaultValue={
                          document.getElementById('oneTimeKey') &&
                          document.getElementById('oneTimeKey').value != ''
                            ? document.getElementById('oneTimeKey').value
                            : generateRandomAsciiString24()
                        }
                      />
                      <button
                        className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        type="button"
                        onClick={handleGenerateRandomKey}
                      >
                        Generate Random Key
                      </button>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="oneTimeSalt"
                        className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                      >
                        One Time Salt:
                      </label>
                      <textarea
                        id="oneTimeSalt"
                        name="oneTimeSalt"
                        className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                        rows={1}
                        spellCheck="false"
                        defaultValue={
                          document.getElementById('oneTimeSalt') &&
                          document.getElementById('oneTimeSalt').value != ''
                            ? document.getElementById('oneTimeSalt').value
                            : generateRandomAsciiString24()
                        }
                      />
                      <button
                        type="button"
                        className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        onClick={handleGenerateRandomSalt}
                      >
                        Generate Random Salt
                      </button>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="timeLimit"
                        className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                      >
                        Time Limit of Request (in seconds, default is 600):
                      </label>
                      <textarea
                        id="timeLimit"
                        name="timeLimit"
                        className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                        rows={1}
                        spellCheck="false"
                        defaultValue={timeLimit}
                      />
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="require2FA"
                        className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                      >
                        Require 2FA:
                      </label>
                      <input
                        type="checkbox"
                        id="require2FA"
                        name="require2FA"
                        className="ml-1 mt-2 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-700"
                        checked={isTwoFAEnabled}
                        onChange={(e) => {
                          console.log(e)
                          setIsTwoFAEnabled(!isTwoFAEnabled) // Update the state variable
                        }}
                      />
                    </div>

                    {twoFAForm}

                    <div className="mt-4">
                    <Notification
                      open={showErrorNotif}
                      error={true}
                      showTopText={errorTopText}
                      showBottomText={errorBottomText}
                      onClose={() => setShowErrorNotif(false)}
                    />
                      <label
                        htmlFor="responseFee"
                        className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                      >
                        Set Response Fee (in ZKP, default is 10):
                      </label>
                      <textarea
                        id="responseFee"
                        name="responseFee"
                        className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                        rows={1}
                        defaultValue={responseFee}
                        spellCheck="false"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="ml-3 mt-3 inline-flex w-full justify-center rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:ring-gray-600 dark:hover:bg-slate-900 sm:mt-0 sm:w-auto"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="submitButton"
                      className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      // onClick={onClose}
                    >
                      Call Smart Contract
                    </button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </form>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

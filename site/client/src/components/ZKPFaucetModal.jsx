import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useGlobal } from '@/components/GlobalStorage'
import { Notification } from './Notification'

export function ZKPFaucetModal({ open, showNotif, onClose }) {
  let {
    userAddress,
    fujiCoreContract,
    mumbaiCoreContract,
    rippleCoreContract,
    web3,
    chainId,
  } = useGlobal()
  const [balance, setBalance] = useState(null)

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
      document.getElementById('submitButton').textContent = 'Onboard'
      document.getElementById('submitButton').className =
        'ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
      document.getElementById('submitButton').disabled = false
    }
  }

  useEffect(() => {
    const contract =
      chainId == 43113
        ? fujiCoreContract
        : chainId == 80001
          ? mumbaiCoreContract
          : chainId == 1440002
            ? rippleCoreContract
            : null

    if (contract && balance === null) {
      async function fetchInitialBalance() {
        const initialBalance = await contract.methods
          .balanceOf(userAddress)
          .call()
        setBalance(Number(initialBalance) / 10 ** 18)
      }
      fetchInitialBalance()
      console.log(userAddress)
    }
  }, [
    userAddress,
    fujiCoreContract,
    mumbaiCoreContract,
    rippleCoreContract,
    balance,
    chainId,
  ])

  async function handleRequestTokens() {
    if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent = 'Running...'
      document.getElementById('submitButton').className =
        'ml-3 inline-flex justify-center rounded-md border border-transparent bg-gray-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
      document.getElementById('submitButton').disabled = true
    }
    try {
      const contract =
        chainId == 43113
          ? fujiCoreContract
          : chainId == 80001
            ? mumbaiCoreContract
            : chainId == 1440002
              ? rippleCoreContract
              : null
      if (document.getElementById('submitButton')) {
        document.getElementById('submitButton').textContent = 'Getting current balance...'
      }
      if (contract) {
        const currentBalance = await contract.methods
          .balanceOf(userAddress)
          .call()
        const data = contract.methods.requestVaultTokens().encodeABI()

        const txObject = {
          from: userAddress,
          to: contract.options.address,
          data: data,
          gas: 1000000,
        }
        if (document.getElementById('submitButton')) {
          document.getElementById('submitButton').textContent = 'Awaiting transaction acceptance...'
        }
        const receipt = await web3.eth.sendTransaction(txObject)
        console.log('Transaction Receipt:', receipt)

        const waitForConfirmation = async (txHash) => {
          while (true) {
            const transactionReceipt =
              await web3.eth.getTransactionReceipt(txHash)
            if (transactionReceipt && transactionReceipt.status) {
              const newBalance = Number(currentBalance) / 10 ** 18 + 200
              setBalance(newBalance)
              break
            } else if (transactionReceipt && !transactionReceipt.status) {
              console.error('Transaction failed')
              break
            }
            await new Promise((resolve) => setTimeout(resolve, 2000))
          }
        }

        waitForConfirmation(receipt.transactionHash)
        showNotif(false, "Tokens received", "200 ZKP tokens added to balance.")
        onClose()
      }
    } catch (error) {
      console.error('Error requesting Vault Tokens:', error)
      resetSubmitButton()
      makeErrorNotif("Error requesting Vault Tokens:", error.toString())
      return
    }
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto dark:bg-opacity-75"
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

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="mx-1 xl:max-w-screen-lg">
              <div className="relative mx-auto mt-6 max-w-screen-md rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl dark:bg-gray-800 sm:my-20 sm:w-full sm:max-w-3xl sm:p-6">
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
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="mb-4 min-w-[16rem] text-base font-semibold leading-6 text-gray-900 dark:text-white md:min-w-[20rem] lg:min-w-[20rem]"
                    >
                      ZKP Token Faucet
                    </Dialog.Title>
                    <label
                      htmlFor="comment"
                      className="mt-2 text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Your ZKP Balance:
                    </label>
                    <div className="mt-2">
                    <Notification
                        open={showErrorNotif}
                        error={true}
                        showTopText={errorTopText}
                        showBottomText={errorBottomText}
                        onClose={() => setShowErrorNotif(false)}
                      />
                      <textarea
                        rows={1}
                        name="comment"
                        id="comment"
                        className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                        value={
                          balance !== null ? balance.toFixed(3) : 'Loading...'
                        }
                        readOnly
                        spellCheck="false"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    id="submitButton"
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    onClick={handleRequestTokens}
                  >
                    Get 200 ZKP tokens
                  </button>
                  <button
                    type="button"
                    className="ml-3 mt-3 inline-flex w-full justify-center rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:ring-gray-600 dark:hover:bg-slate-900 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline' // Import the XMarkIcon
import { truncateAddress } from './APICalls'
import { removeMetadata } from './HelperCalls'

export function CrossChainSyncStatusModal({
  open,
  onClose,
  sourceChain = '',
  destinationChain = '',
  parameterSynced = '',
  parameterKey = '',
  parameterValue,
  ccipRequestID = '',
}) {
  const [isOpen, setIsOpen] = useState(open)
  const [status, setStatus] = useState('Incomplete')
  const modifiedFieldData = isOpen ? removeMetadata(parameterValue[parameterKey]) : {}

  useEffect(() => {
    setIsOpen(open)
  }, [open])

  return (
    <Transition.Root show={isOpen} as={Fragment}>
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
                  Cross-Chain Sync Status
                </Dialog.Title>
                <div className="mt-2 max-h-[40vh] min-w-[16rem] overflow-y-auto px-1 pb-1 md:min-w-[40rem] lg:max-h-[65vh] lg:min-w-[40rem]">
                  <div className="mt-4">
                    <label
                      htmlFor="sourceChain"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Source Chain:
                    </label>
                    <textarea
                      id="sourceChain"
                      className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={sourceChain}
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="destinationChain"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Destination Chain:
                    </label>
                    <textarea
                      id="destinationChain"
                      className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={destinationChain}
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="parameterSynced"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Parameter Synced:
                    </label>
                    <textarea
                      id="parameterSynced"
                      className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={parameterSynced}
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="parameterKey"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Parameter Key (Address/Request ID/Response ID/Data
                      Location, etc.):
                    </label>
                    <textarea
                      id="parameterKey"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={parameterKey}
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="parameterValue"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Parameter Value:
                    </label>
                    <textarea
                      id="parameterValue"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={8}
                      readOnly
                      spellCheck="false"
                      value={JSON.stringify(modifiedFieldData, null, 2)}
                    />
                  </div>

                  <hr className="my-4 border-gray-300 dark:border-gray-700" />

                  <div className="mt-4">
                    <label
                      htmlFor="ccipFee"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      CCIP Fee:
                    </label>
                    <textarea
                      id="ccipFee"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      defaultValue="10 ZKP"
                      readOnly
                      spellCheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="ccipRequestID"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      CCIP Message ID (Request ID):
                    </label>
                    <textarea
                      id="ccipRequestID"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={ccipRequestID}
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="ccipExplorerURL"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      CCIP Explorer URL:
                    </label>
                    <div className="mr-4 mt-1 font-mono">
                      <a
                        href={`https://ccip.chain.link/msg/${ccipRequestID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 underline"
                      >
                        {`https://ccip.chain.link/msg/${truncateAddress(ccipRequestID)}`}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="disclaimer"
                    className="block text-sm font-bold leading-5 text-gray-900 dark:text-white"
                  >
                    Disclaimer:
                  </label>
                  <p className="mt-2 whitespace-normal text-gray-500 dark:text-gray-300">
                    Data is synced across data sources when the CCIP transaction
                    succeeds on the source chain immediately. To monitor if the
                    sync has been fully completed on the destination chain,
                    please check the status of the CCIP tx on the CCIP explorer
                    link above.
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:ring-gray-600 dark:hover:bg-slate-900 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Close
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

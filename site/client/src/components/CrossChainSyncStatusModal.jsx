import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Import the XMarkIcon

export function CrossChainSyncStatusModal() {
  const [open, setOpen] = useState(true);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-y-auto z-10 dark:bg-opacity-75" onClose={() => setOpen(false)}>
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
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    onClick={() => setOpen(false)}
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
                  Cross-Chain Sync Status
                </Dialog.Title>
                <div className="mt-2 px-1 lg:max-h-[65vh] max-h-[40vh] overflow-y-auto min-w-[16rem] md:min-w-[40rem] lg:min-w-[40rem]">

                  <div className="mt-4">
                    <label htmlFor="sourceChain" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Source Chain:
                    </label>
                    <textarea
                      id="sourceChain"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="destinationChain" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Destination Chain:
                    </label>
                    <textarea
                      id="destinationChain"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="parameterSynced" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Parameter Synced:
                    </label>
                    <textarea
                      id="parameterSynced"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="parameterKey" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Parameter Key (Address/Request ID/Response ID/Data Location, etc.):
                    </label>
                    <textarea
                      id="parameterKey"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="parameterValue" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Parameter Value:
                    </label>
                    <textarea
                      id="parameterValue"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={8}
                      readOnly
                      spellCheck="false"
                    />
                  </div>

                  <hr className="my-4 border-gray-300 dark:border-gray-700" />

                  <div className="mt-4">
                    <label htmlFor="ccipFee" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      CCIP Fee:
                    </label>
                    <textarea
                      id="ccipFee"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      defaultValue="10 ZKP"
                      readOnly
                      spellCheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="ccipRequestID" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      CCIP Request ID:
                    </label>
                    <textarea
                      id="ccipRequestID"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="ccipExplorerURL" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      CCIP Explorer URL:
                    </label>
                    <a
                      href="https://ccip.chain.link/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 underline mt-2"
                    >
                      https://ccip.chain.link/
                    </a>
                  </div>

                </div>

                <div className="mt-6 flex justify-end">
                  <button
                      type="button"
                      className="mt-3 ml-3 inline-flex w-full justify-center rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-slate-200 dark:hover:bg-slate-900 sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      onClick={() => setOpen(false)}
                    >
                      Refresh Status
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

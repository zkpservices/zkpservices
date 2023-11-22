import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function NewCrossChainSyncModal() {
  const [open, setOpen] = useState(true);
  const destinationChainOptions = ["Polygon Testnet", "Avalanche Testnet", "Fantom Testnet"];

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
                      className="h-6 w-6 text-emerald-500 dark:text-emerald-300 hover-text-emerald-600 dark:hover-text-emerald-400"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  New Cross Chain-Sync
                </Dialog.Title>
                <div className="mt-2 px-1 lg:max-h-[65vh] max-h-[40vh] overflow-y-auto min-w-[16rem] md:min-w-[40rem] lg:min-w-[40rem]">

                  <div className="mt-4">
                    <label htmlFor="destinationChain" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Destination Chain:
                    </label>
                    <select
                      id="destinationChain"
                      name="destinationChain"
                      className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-emerald-400 focus:ring-2 focus:ring-emerald-500 sm:text-sm sm:leading-6"
                    >
                      {destinationChainOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="parameterToSync" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Parameter to Sync:
                    </label>
                    <select
                      id="location"
                      name="location"
                      className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-emerald-400 focus:ring-2 focus:ring-emerald-500 sm:text-sm sm:leading-6"
                      defaultValue="Medical Records"
                    >
                      <option>Medical Records</option>
                      <option>Passport</option>
                      <option>Driving License</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="parameterKey" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Parameter Key (Address/Request ID/Response ID/Data Location, etc.):
                    </label>
                    <textarea
                      id="parameterKey"
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                      rows={1}
                      spellCheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="parameterValue" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Parameter Value:
                    </label>
                    <textarea
                      id="parameterValue"
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                      rows={8}
                      readOnly
                    />
                  </div>

                  <hr className="my-4 border-gray-300 dark:border-gray-700" />

                  <div className="mt-4">
                    <label htmlFor="ccipFee" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      CCIP Fee:
                    </label>
                    <textarea
                      id="ccipFee"
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                      rows={1}
                      readOnly
                    >
                      10 ZKP
                    </textarea>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="disclaimer" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Disclaimer:
                    </label>
                    <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-normal">
                      Data requests and update requests are only partially supported due to the fact that the (optional) selected 2FA providers would need to be able to support equivalent logic and have the same addresses on the destination chain (this is available with the default 2FA provider of zkp.services, ZKPServicesVRF2FA, but may not be for other 2FA providers).
                    </p>
                  </div>

                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    className="mr-3 bg-gray-200 dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-emerald-400 dark:ring-emerald-400 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-emerald-600 dark:bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 dark:hover:bg-emerald-400 rounded-md"
                    onClick={() => {
                      // Call Smart Contract logic here
                      setOpen(false);
                    }}
                  >
                    Call Smart Contract
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

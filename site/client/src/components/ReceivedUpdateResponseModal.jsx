import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function ReceivedUpdateResponseModal() {
  const [is2FARequired, setIs2FARequired] = useState(false);
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
                  Received Update Response
                </Dialog.Title>
                <div className="mt-2 lg:max-h-[65vh] max-h-[40vh] overflow-y-auto min-w-[16rem] md:min-w-[40rem] lg:min-w-[40rem]">

                  <div className="mt-4">
                    <label htmlFor="addressOfSendingParty" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Address of Sending Party:
                    </label>
                    <textarea
                      id="addressOfSendingParty"
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                      rows={1}
                      readOnly
                      spellcheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="fieldUpdate" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Field Update:
                    </label>
                    <textarea
                      id="fieldUpdate"
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                      rows={1}
                      readOnly
                      spellcheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="newDataSnapshot" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      New Data Snapshot After Update:
                    </label>
                    <textarea
                      id="newDataSnapshot"
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                      rows={8}
                      readOnly
                      spellcheck="false"
                    />
                  </div>

                  <hr className="my-4 border-gray-300 dark:border-gray-700" />

                  <div className="mt-4">
                    <label htmlFor="oneTimeKey" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      One Time Key:
                    </label>
                    <textarea
                      id="oneTimeKey"
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                      rows={1}
                      readOnly
                      spellcheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="oneTimeSalt" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      One Time Salt:
                    </label>
                    <textarea
                      id="oneTimeSalt"
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                      rows={1}
                      readOnly
                      spellcheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="timeLimit" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Time Limit of Request (in seconds):
                    </label>
                    <textarea
                      id="timeLimit"
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                      rows={1}
                      readOnly
                      spellcheck="false"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="require2FA" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Require 2FA:
                    </label>
                    <input
                      type="checkbox"
                      id="require2FA"
                      className="mt-2 ml-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500"
                      onChange={(e) => setIs2FARequired(e.target.checked)}
                    />
                  </div>

                  {is2FARequired && (
                    <>
                      <div className="mt-4">
                        <label htmlFor="twoFAProvider" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                          2FA Provider (address/name):
                        </label>
                        <textarea
                          id="twoFAProvider"
                          className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                          rows={1}
                          readOnly
                          spellcheck="false"
                        />
                      </div>

                      <div className="mt-4">
                        <label htmlFor="twoFARequestID" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                          2FA Request ID:
                        </label>
                        <textarea
                          id="twoFARequestID"
                          className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                          rows={1}
                          readOnly
                          spellcheck="false"
                        />
                      </div>

                      <div className="mt-4">
                        <label htmlFor="twoFAOneTimeToken" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                          2FA One Time Token:
                        </label>
                        <textarea
                          id="twoFAOneTimeToken"
                          className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                          rows={1}
                          readOnly
                          spellcheck="false"
                        />
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
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-3 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 mt-1"
                      rows={1}
                      readOnly
                      spellcheck="false"
                    />
                  </div>

                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    className="bg-emerald-600 dark:bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 dark:hover:bg-emerald-400 rounded-md"
                    onClick={() => setOpen(false)}
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
  );
}

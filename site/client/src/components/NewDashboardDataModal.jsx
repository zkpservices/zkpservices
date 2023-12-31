import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { formToJSON } from 'axios'

export function NewDashboardDataModal({
  open,
  onClose,
  onSubmit,
  options = ['Medical Records', 'Public Transport Card', 'Insurance Card'],
}) {
  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const formDataJSON = formToJSON(formData)
    const result = await onSubmit(formDataJSON['field'])
  }
  const [optionsList, setOptionsList] = useState([
    'Medical Records',
    'Public Transport Card',
    'Insurance Card',
  ])
  const optionsMapConditional = (options) => {
    if (options) {
      return options.map((option) => <option key={option}>{option}</option>)
    } else {
      return <></>
    }
  }

  useEffect(() => {
    setOptionsList(optionsMapConditional(options))
  }, [options])

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="flex min-h-screen items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 backdrop-filter backdrop-blur-sm" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-500"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="mx-1 xl:max-w-screen-lg">
              <form onSubmit={handleSubmit}>
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
                        className="min-w-[16rem] text-base font-semibold leading-6 text-gray-900 dark:text-white md:min-w-[20rem] lg:min-w-[20rem]"
                      >
                        Add Field to Dashboard
                      </Dialog.Title>
                      <div className="mt-2 max-h-[40vh] overflow-y-auto lg:max-h-[65vh]">
                        <div className="m-2">
                          <label
                            htmlFor="field"
                            className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                          >
                            Field Name
                          </label>
                          <select
                            id="field"
                            name="field"
                            className="focus-border-emerald-500 focus:box-shadow-none relative mt-2 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-transparent focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 sm:text-sm sm:leading-6"
                            defaultValue="Medical Records"
                          >
                            {optionsList}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      Add Field to Dashboard
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
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

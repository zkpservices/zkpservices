import { Fragment, useState, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { CheckCircleIcon, NoSymbolIcon } from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/20/solid'

export function Notification({
  open = false,
  showTopText,
  showBottomText,
  error = false,
  onClose,
}) {
  const [show, setShow] = useState(open)
  const [errorIcon, setErrorIcon] = useState(<></>)

  const errorIconConditional = () => {
    if (error) {
      return (
        <NoSymbolIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
      )
    } else {
      return (
        <CheckCircleIcon
          className="h-6 w-6 text-green-400"
          aria-hidden="true"
        />
      )
    }
  }
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     onClose()
  //   }, 5000)
  //   return () => {
  //     clearTimeout(timer)
  //   }
  // }, [])

  useEffect(() => {
    setErrorIcon(errorIconConditional())
  }, [error])

  useEffect(() => {
    console.log(`open change detected, setting show to: ${open}`)
    setShow(open)
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => {
      clearTimeout(timer)
    }
  }, [open])

  return (
    <>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 mt-12 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-0 dark:bg-gray-800">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">{errorIcon}</div>
                  <div className="ml-3 mt-4 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-200">
                      {showTopText}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {showBottomText}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700"
                      onClick={() => {
                        setShow(false)
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  )
}

import Guide from './quickstart_guide.mdx';

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
export default function Example() {
  return (

    <>
    <Guide />

    <form className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div className="space-y-6 sm:space-y-5">
          <div>
            <h2 className="text-2xl font-bold leading-6 ">Sign Up</h2>
            <p className="mt-4 max-w-2xl text-sm ">
              Please enter the following information to get started.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium leading-6 ">Passwords</h3>
            <p className="mt-1 max-w-2xl text-sm ">Use a permanent address where you can receive mail.</p>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="email" className="block text-sm font-medium sm:mt-px sm:pt-2">
              Database Password: 
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <input
                id="email"
                name="email"
                type="password"
                autoComplete=""
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none dark:bg-gray-900 focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="email" className="block text-sm font-medium sm:mt-px sm:pt-2">
              2FA Password: 
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <input
                id="email"
                name="email"
                type="password"
                autoComplete=""
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none dark:bg-gray-900 focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="email" className="block text-sm font-medium sm:mt-px sm:pt-2">
              Smart Contract Password: 
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <input
                id="email"
                name="email"
                type="password"
                autoComplete=""
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none dark:bg-gray-900 focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>

        </div>

        <div className="space-y-6 pt-3 sm:space-y-5 sm:pt-5">
          <div>
            <h3 className="text-lg font-medium leading-6 ">RSA Encryption Keys</h3>
            <p className="mt-1 max-w-2xl text-sm ">Use a permanent address where you can receive mail.</p>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="about" className="block text-sm font-medium sm:mt-px sm:pt-2">
              RSA Encryption Key - Public Key 
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <textarea
                id="about"
                name="about"
                rows={3}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none dark:bg-gray-900 focus:ring-emerald-500 sm:text-sm"
                defaultValue={''}
              />
              <p className="mt-2 text-sm ">Write a few sentences about yourself.</p>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="about" className="block text-sm font-medium sm:mt-px sm:pt-2">
              RSA Encryption Key - Private Key
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <textarea
                id="about"
                name="about"
                rows={3}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none dark:bg-gray-900 focus:ring-emerald-500 sm:text-sm"
                defaultValue={''}
              />
              <p className="mt-2 text-sm ">Write a few sentences about yourself.</p>
            </div>
          </div>


          <div className="pt-1">
            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                Generate Random Keys
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                Validate Keys
              </button>
            </div>
          </div>
        

        </div>
         
        <div className="space-y-6 pt-3 sm:space-y-5 sm:pt-5">
          <div>
            <h3 className="text-lg font-medium leading-6 ">RSA Signing Keys</h3>
            <p className="mt-1 max-w-2xl text-sm ">Use a permanent address where you can receive mail.</p>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="about" className="block text-sm font-medium sm:mt-px sm:pt-2">
              RSA Signing Key - Public Key 
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <textarea
                id="about"
                name="about"
                rows={3}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none dark:bg-gray-900 focus:ring-emerald-500 sm:text-sm"
                defaultValue={''}
              />
              <p className="mt-2 text-sm ">Write a few sentences about yourself.</p>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="about" className="block text-sm font-medium sm:mt-px sm:pt-2">
              RSA Signing Key - Private Key
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <textarea
                id="about"
                name="about"
                rows={3}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none dark:bg-gray-900 focus:ring-emerald-500 sm:text-sm"
                defaultValue={''}
              />
              <p className="mt-2 text-sm ">Write a few sentences about yourself.</p>
            </div>
          </div>

          <div className="pt-1">
            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                Generate Random Keys
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                Validate Keys
              </button>
            </div>
          </div>
        
        </div>

        <div className="space-y-6 pt-3 sm:space-y-5 sm:pt-5">
          <div>
            <h3 className="text-lg font-medium leading-6 ">(Optional) Public Information</h3>
            <p className="mt-1 max-w-2xl text-sm ">Use a permanent address where you can receive mail.</p>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="about" className="block text-sm font-medium sm:mt-px sm:pt-2">
              Public Information
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <textarea
                id="about"
                name="about"
                rows={3}
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none dark:bg-gray-900 focus:ring-emerald-500 sm:text-sm"
                defaultValue={''}
              />
              <p className="mt-2 text-sm ">Write a few sentences about yourself.</p>
            </div>
          </div>

        </div>


        <div className="space-y-6 divide-y divide-gray-200 pt-8 sm:space-y-5 sm:pt-10">
          <div>
            <h3 className="text-lg font-medium leading-6 ">Onboard to Smart Contract</h3>
            <p className="mt-1 max-w-2xl text-sm ">
              Please select which of the parameters you would like to onboard to the smart contract.
            </p>
          </div>
          <div className="space-y-6 divide-y divide-gray-200 sm:space-y-5">
            <div className="pt-6 sm:pt-5">
              <div role="group" aria-labelledby="label-email">
                <div className="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4">
                  <div>
                    <div className="text-base font-medium sm:text-sm" id="label-email">
                      Parameter: 
                    </div>
                  </div>
                  <div className="mt-4 sm:col-span-2 sm:mt-0">
                    <div className="max-w-lg space-y-4">
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="comments"
                            name="comments"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="comments" className="font-medium ">
                            RSA Encryption Key - Public 
                          </label>
                          <p>Allows others to look up your public key through the smart contract.</p>
                        </div>
                      </div>
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="candidates"
                            name="candidates"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="candidates" className="font-medium ">
                            RSA Signing Key - Public 
                          </label>
                          <p className="">Allows others to verify your signatures.</p>
                        </div>
                      </div>
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="offers"
                            name="offers"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="offers" className="font-medium ">
                            Public Information 
                          </label>
                          <p className="">Allows others to look up public information associated with your account.</p>
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
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Submit Form
          </button>
        </div>
      </div>
    </form>
    </>
  )
}

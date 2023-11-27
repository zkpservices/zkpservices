import { Fragment, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useGlobal } from '@/components/GlobalStorage';

export function NewCrossChainSyncModal({open, onClose}) {
  let {
    userAddress,
    fujiCoreContract,
    mumbaiCoreContract,
    rippleCoreContract,
    web3,
    chainId
  } = useGlobal();

  const destinationChainOptions = ["Avalanche Testnet", "Polygon Testnet", "Ripple EVM Sidechain"];
  const [parameterValue, setParameterValue] = useState('');
  let paramKey = useRef('');
  let paramToSync = useRef('');
  
  async function handleFetchValue() {
    try {

      let fetchedValue;
      console.log("chainID");
      console.log(chainId);

      const contract = chainId == 43113 ? fujiCoreContract :
                      chainId == 80001 ? mumbaiCoreContract :
                      chainId == 1440002 ? rippleCoreContract : null;

      if (!contract) {
        console.error('No contract instance available for the current chain');
        return;
      }

      paramToSync = document.getElementById('parameterToSync').value;
      paramKey = document.getElementById('parameterKey').value;

      switch (paramToSync) {
        case 'Data':
          fetchedValue = await contract.methods.obfuscatedData(paramKey).call();
          break;
        case 'Data Request':
          fetchedValue = await contract.methods.dataRequests(paramKey).call();
          break;
        case 'Update Request':
          fetchedValue = await contract.methods.updateRequests(paramKey).call();
          break;
        case 'Response':
          fetchedValue = await contract.methods.responses(paramKey).call();
          break;
        case 'Public User Information':
          fetchedValue = await contract.methods.publicUserInformation(paramKey).call();
          break;
        case 'RSA Encryption Keys':
          fetchedValue = await contract.methods.rsaEncryptionKeys(paramKey).call();
          break;
        case 'RSA Signing Keys':
          fetchedValue = await contract.methods.rsaSigningKeys(paramKey).call();
          break;
        default:
          console.error('Invalid parameter selected');
          return;
      }

      setParameterValue(fetchedValue);
      console.log('Fetched Value:', fetchedValue);
    } catch (error) {
      console.error('Error in fetching value:', error);
    }
  }

  async function handleSubmit() {
    await handleFetchValue();
    console.log(parameterValue, "submitted");
    console.log(paramKey, paramToSync);

    try {
      let encodedData;
      let dataTypeByte;
      const contract = chainId == 43113 ? fujiCoreContract :
                      chainId == 80001 ? mumbaiCoreContract :
                      chainId == 1440002 ? rippleCoreContract : null;

      if (!contract) {
        console.error('No contract instance available for the current chain');
        return;
      }

      // Encoding the data
      switch (paramToSync) {
        case 'Data':
          encodedData = await contract.methods.encodeData(paramKey).call();
          dataTypeByte = "0x03";
          break;
        case 'Data Request':
          encodedData = await contract.methods.encodeDataRequest(paramKey).call();
          dataTypeByte = "0x04";
          break;
        case 'Update Request':
          encodedData = await contract.methods.encodeUpdateRequest(paramKey).call();
          dataTypeByte = "0x05";
          break;
        case 'Response':
          encodedData = await contract.methods.encodeResponse(paramKey).call();
          dataTypeByte = "0x06";
          break;
        case 'Public User Information':
          encodedData = await contract.methods.encodePublicUserInformation(paramKey).call();
          dataTypeByte = "0x07";
          break;
        case 'RSA Encryption Keys':
          encodedData = await contract.methods.encodeRSAEncryptionKey(paramKey).call();
          dataTypeByte = "0x01";
          break;
        case 'RSA Signing Keys':
          encodedData = await contract.methods.encodeRSASigningKey(paramKey).call();
          dataTypeByte = "0x02";
          break;
        default:
          console.error('Invalid parameter selected');
          return;
      }

      let dataBytes = dataTypeByte + encodedData.slice(2); // Removing '0x' from encodedData
      let data = contract.methods.sendMessage("mumbai", dataBytes).encodeABI();

      // 3000000 = gas limit for CCIP
      let txObject = {
        from: userAddress,
        to: contract.options.address,
        data: data,
        gas: 3000000
      };

      let receipt = await web3.eth.sendTransaction(txObject);
      console.log('Transaction Receipt:', receipt);

      let messageId;
      if (receipt.events && receipt.events.CCIPMessageID) {
        messageId = receipt.events.CCIPMessageID.returnValues.messageId;
      }
  
      console.log('Message ID:', messageId);

      onClose();
    } catch (error) {
      console.error('Error in transaction:', error);
    }

  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-y-auto z-10 dark:bg-opacity-75" onClose={onClose}>
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
                      className="mt-2 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus-border-emerald-500 dark:focus-border-emerald-500 focus:outline-none focus:border-transparent focus:ring-emerald-500 focus:box-shadow-none bg-slate-100 dark:bg-slate-700 sm:text-sm sm:leading-6"
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
                      id="parameterToSync"
                      name="parameterToSync"
                      className="mt-2 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus-border-emerald-500 dark:focus-border-emerald-500 focus:outline-none focus:border-transparent focus:ring-emerald-500 focus:box-shadow-none bg-slate-100 dark:bg-slate-700 sm:text-sm sm:leading-6"
                    >
                      <option>Data</option>
                      <option>Data Request</option>
                      <option>Update Request</option>
                      <option>Response</option>
                      <option>Public User Information</option>
                      <option>RSA Encryption Keys</option>
                      <option>RSA Signing Keys</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="parameterKey" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      Parameter Key (Address/Request ID/Response ID/Data Location, etc.):
                    </label>
                    <textarea
                      id="parameterKey"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
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
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={8}
                      readOnly
                      value={parameterValue}
                    />
                  </div>

                  <button
                      className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      onClick={handleFetchValue}
                    >
                      Fetch Parameter Value
                  </button>

                  <hr className="my-4 border-gray-300 dark:border-gray-700" />

                  <div className="mt-4">
                    <label htmlFor="ccipFee" className="block text-sm font-medium leading-5 text-gray-900 dark:text-white">
                      CCIP Fee:
                    </label>
                    <textarea
                      id="ccipFee"
                      className="relative block w-full mt-1 appearance-none rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:z-10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none bg-slate-100 dark:bg-slate-700 focus:ring-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                    >
                      10 ZKP
                    </textarea>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="disclaimer" className="block text-sm font-bold leading-5 text-gray-900 dark:text-white">
                      Disclaimer:
                    </label>
                    <p className="text-gray-500 dark:text-gray-300 mt-2 whitespace-normal">
                      Data requests and update requests are only partially supported due to the fact that the (optional) selected 2FA providers would need to be able to support equivalent logic and have the same addresses on the destination chain (this is available with the default 2FA providers of zkp.services, ZKPServicesVRF2FA & ZKPServicesGeneric2FA, but may not be for other 2FA providers).
                    </p>
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

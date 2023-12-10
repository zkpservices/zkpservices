import { Fragment, useState, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useGlobal } from '@/components/GlobalStorage'
import { poseidon } from './PoseidonHash'
import { getFieldData, addCCTX } from './APICalls'
import { stringToBigInt } from './HelperCalls'
import { Notification } from './Notification'

export function NewCrossChainSyncModal({
  open,
  onClose,
  showNotif,
  destinationChainOptions,
}) {
  let {
    userAddress,
    fujiCoreContract,
    mumbaiCoreContract,
    rippleCoreContract,
    web3,
    chainId,
    contractPassword,
    userPassword
  } = useGlobal()

  const [parameterValue, setParameterValue] = useState('')
  let paramKey = useRef('')
  let paramToSync = useRef('')

  const paramToSyncDict = {
    'Data': 'data',
    'Data Request': 'data_request',
    'Update Request': 'update_request',
    'Response': 'response',
    'Public User Information': 'public_info',
    'RSA Encryption Keys': 'rsa_enc_keys',
    'RSA Signing Keys': 'rsa_sign_keys',
  }

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

async function handleFetchValue() {
  try {
    // Variable to store the fetched value
    let fetchedValue;

    // Determine the contract based on the current chain ID
    const contract =
      chainId == 43113
        ? fujiCoreContract
        : chainId == 80001
        ? mumbaiCoreContract
        : chainId == 1440002
        ? rippleCoreContract
        : null;

    // Check if a valid contract instance is available
    if (!contract) {
      console.error('No contract instance available for the current chain');
      return;
    }

    // Get the selected parameter type and parameter key from the form
    paramToSync = document.getElementById('parameterToSync').value;
    paramKey = document.getElementById('parameterKey').value;

    // Handle specific operations based on the selected parameter type
    switch (paramToSync) {
      case 'Data':
        try {
          // Fetch field data for the specified parameter key
          const fieldDataRequest = await getFieldData(
            userAddress,
            userPassword,
            paramKey,
            chainId,
          );

          // Extract field data and perform additional processing
          const fieldData = fieldDataRequest['data'];
          const paramKeyRawEnd = stringToBigInt(paramKey.substring(24, 48))
            ? stringToBigInt(paramKey.substring(24, 48))
            : stringToBigInt('');
          const contractPasswordEnd = stringToBigInt(
            contractPassword.substring(24, 48),
          )
            ? stringToBigInt(contractPassword.substring(24, 48))
            : stringToBigInt('');

          // Hash the parameter key using Poseidon hash function
          paramKey = await poseidon([
            stringToBigInt(paramKey),
            paramKeyRawEnd,
            stringToBigInt(fieldData[paramKey]['_metadata']['salt']),
            stringToBigInt(contractPassword),
            contractPasswordEnd,
          ]);

          // Retrieve obfuscated data from the contract using the hashed parameter key
          const encryptedData = await contract.methods
            .obfuscatedData(paramKey)
            .call();

          // Convert the fetched data to a formatted JSON string
          fetchedValue = JSON.stringify(
            encryptedData,
            (key, value) =>
              typeof value === 'bigint' ? value.toString() : value, // Return everything else unchanged
            2,
          );
        } catch (error) {
          // Handle errors during data fetching
          console.error(error);
          setShowErrorNotif(true);
          setErrorTopText('Error fetching field data');
          setErrorBottomText(error.toString());
        }
        break;
      // Handle other parameter types similarly
      case 'Data Request':
        const encryptedDataRequest = await contract.methods
          .dataRequests(paramKey)
          .call();
        fetchedValue = JSON.stringify(
          encryptedDataRequest,
          (key, value) =>
            typeof value === 'bigint' ? value.toString() : value, // Return everything else unchanged
          2,
        );
        break;
      case 'Update Request':
        const encryptedUpdateRequest = await contract.methods
          .updateRequests(paramKey)
          .call();
        fetchedValue = JSON.stringify(
          encryptedUpdateRequest,
          (key, value) => {
            if (typeof value === 'bigint') {
              return value.toString();
            }
            return value;
          },
          2,
        );
        break;
      case 'Response':
        fetchedValue = await contract.methods.responses(paramKey).call();
        break;
      case 'Public User Information':
        fetchedValue = await contract.methods
          .publicUserInformation(paramKey)
          .call();
        break;
      case 'RSA Encryption Keys':
        fetchedValue = await contract.methods
          .rsaEncryptionKeys(paramKey)
          .call();
        break;
      case 'RSA Signing Keys':
        fetchedValue = await contract.methods.rsaSigningKeys(paramKey).call();
        break;
      default:
        console.error('Invalid parameter selected');
        return;
    }

    // Set the fetched value to the state variable for rendering in the UI
    setParameterValue(fetchedValue);
  } catch (error) {
    // Handle errors during the overall process
    console.error('Error in fetching value:', error);
    makeErrorNotif('Error in fetching value:', error.toString());
    return;
  }
}


async function handleSubmit() {
  // Update UI elements to indicate the submission process
  if (document.getElementById('submitButton')) {
    document.getElementById('submitButton').textContent = 'Running...';
    document.getElementById('submitButton').className =
      'ml-3 inline-flex justify-center rounded-md border border-transparent bg-gray-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2';
    document.getElementById('submitButton').disabled = true;
  }

  // Fetch and handle the value of the selected parameter
  await handleFetchValue();

  try {
    let encodedData;
    let dataTypeByte;

    // Determine the contract and receiver based on the current chain ID
    const contract =
      chainId == 43113
        ? fujiCoreContract
        : chainId == 80001
        ? mumbaiCoreContract
        : null;
    const receiver = chainId == 43113 ? 'mumbai' : 'fuji';

    // Check if a valid contract instance is available
    if (!contract) {
      console.error('No contract instance available for the current chain');
      return;
    }

    // Encoding the data based on the selected parameter type
    switch (paramToSync) {
      case 'Data':
        encodedData = await contract.methods.encodeData(paramKey).call();
        dataTypeByte = '0x03';
        break;
      case 'Data Request':
        encodedData = await contract.methods
          .encodeDataRequest(paramKey)
          .call();
        dataTypeByte = '0x04';
        break;
      // Handle other parameter types similarly
      case 'Update Request':
        encodedData = await contract.methods
          .encodeUpdateRequest(paramKey)
          .call();
        dataTypeByte = '0x05';
        break;
      case 'Response':
        encodedData = await contract.methods.encodeResponse(paramKey).call();
        dataTypeByte = '0x06';
        break;
      case 'Public User Information':
        encodedData = await contract.methods
          .encodePublicUserInformation(paramKey)
          .call();
        dataTypeByte = '0x07';
        break;
      case 'RSA Encryption Keys':
        encodedData = await contract.methods
          .encodeRSAEncryptionKey(paramKey)
          .call();
        dataTypeByte = '0x01';
        break;
      case 'RSA Signing Keys':
        encodedData = await contract.methods
          .encodeRSASigningKey(paramKey)
          .call();
        dataTypeByte = '0x02';
        break;
      default:
        console.error('Invalid parameter selected');
        return;
    }

    // Prepare the data for the transaction
    let dataBytes = dataTypeByte + encodedData.slice(2); // Removing '0x' from encodedData
    let data = contract.methods.sendMessage(receiver, dataBytes).encodeABI();

    // Prepare the transaction object
    let txObject = {
      from: userAddress,
      to: contract.options.address,
      data: data,
      gas: 3000000, // 3000000 = gas limit for CCIP
    };

    // Update UI to indicate awaiting transaction acceptance
    if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent =
        'Awaiting transaction acceptance...';
    }

    // Send the transaction and get the receipt
    let receipt = await web3.eth.sendTransaction(txObject);

    // Extract CCIP message ID from the transaction logs
    let messageId;
    for (let log of receipt.logs) {
      if (
        log.address.toLowerCase() == contract._address.toLowerCase()
      ) {
        messageId = log.data;
        break;
      }
    }

    // Extract transaction ID and other details from the receipt
    const transactionId = receipt.logs[receipt.logs.length - 1].data;
    const type = paramToSyncDict[`${paramToSync}`];
    const targetChain = chainId == 43113 ? 80001 : 43113;

    // Update UI to indicate submitting the cross-chain sync transaction
    paramKey = document.getElementById('parameterKey').value;
    if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent =
        'Submitting transaction...';
    }

    // Add the cross-chain transaction and display success notification
    const result = await addCCTX(
      userAddress,
      userPassword,
      type,
      paramKey,
      chainId,
      `0x${targetChain.toString(16)}`,
      transactionId,
    );
    showNotif(
      false,
      'Cross-Chain Sync Submitted',
      'Transaction submitted successfully, awaiting Chainlink to complete sync.',
    );
    onClose();
  } catch (error) {
    // Handle errors during the transaction submission process
    console.error('Error in transaction:', error);
    resetSubmitButton();
    makeErrorNotif('Error in transaction:', error.toString());
    return;
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
                  New Cross Chain-Sync
                </Dialog.Title>
                <div className="mt-2 max-h-[40vh] min-w-[16rem] overflow-y-auto px-1 md:min-w-[40rem] lg:max-h-[65vh] lg:min-w-[40rem]">
                  <div className="mt-4">
                    <label
                      htmlFor="destinationChain"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Destination Chain:
                    </label>
                    <select
                      id="destinationChain"
                      name="destinationChain"
                      className="focus-border-emerald-500 dark:focus-border-emerald-500 focus:box-shadow-none mt-2 block w-full rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-transparent focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 sm:text-sm sm:leading-6"
                    >
                      {destinationChainOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="parameterToSync"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Parameter to Sync:
                    </label>
                    <select
                      id="parameterToSync"
                      name="parameterToSync"
                      className="focus-border-emerald-500 dark:focus-border-emerald-500 focus:box-shadow-none mt-2 block w-full rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-transparent focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 sm:text-sm sm:leading-6"
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
                      spellCheck="false"
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
                      value={parameterValue}
                    />
                  </div>

                  <button
                    className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    onClick={handleFetchValue}
                  >
                    Fetch Parameter Value
                  </button>

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
                      readOnly
                      defaultValue="10 ZKP"
                    />
                  </div>

                  <div className="mt-6">
                    <Notification
                        open={showErrorNotif}
                        error={true}
                        showTopText={errorTopText}
                        showBottomText={errorBottomText}
                        onClose={() => setShowErrorNotif(false)}
                    />
                    <label
                      htmlFor="disclaimer"
                      className="block text-sm font-bold leading-5 text-gray-900 dark:text-white"
                    >
                      Disclaimer:
                    </label>
                    <p className="mt-2 whitespace-normal text-gray-500 dark:text-gray-300">
                      Data requests and update requests that have a 2FA requirement
                      are only partially for syncing due to the fact that the (optional) 
                      selected 2FA providers would need equivalent logic and have the same 
                      addresses on the destination chain. This is available with the default 
                      2FA providers of zkp.services, ZKPServicesVRF2FA & ZKPServicesGeneric2FA,
                      but may not be for other 2FA providers.
                    </p>
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
                    type="button"
                    id="submitButton"
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
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
  )
}

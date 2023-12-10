import { Fragment, useRef, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useGlobal } from '@/components/GlobalStorage'
import {
  stringToBigInt,
  bigIntToString,
  generateCoreProof,
  generate2FAProof,
  splitTo24,
} from '@/components/HelperCalls'
import { poseidon } from '@/components/PoseidonHash'
import { removeMetadata } from '@/components/HelperCalls'
import { Notification } from './Notification'
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language'
import { lintKeymap } from '@codemirror/lint'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { EditorState } from '@codemirror/state'
import {
  EditorView,
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view'
import { json } from '@codemirror/lang-json'
import { abcdef } from '@uiw/codemirror-theme-abcdef'
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night'
import { tokyoNightDay } from '@uiw/codemirror-theme-tokyo-night-day'

export function SendDataModal({
  open,
  onClose,
  requestID,
  onSubmit,
  showNotif,
  addressOfRequestingParty = '',
  fieldRequested = '',
  data = '{}',
  oneTimeKey = '',
  oneTimeSalt = '',
  timeLimit = '',
  twoFAProvider = '',
  twoFARequestID = '',
  twoFAOneTimeToken = '',
  responseFee = '',
  require2FA = false,
}) {

  const editorContainerRef = useRef(null);
  const [editorView, setEditorView] = useState(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const modifiedFieldData = open ? removeMetadata(JSON.parse(data)[fieldRequested]) : {}

  const borderTheme = EditorView.theme({
    '.cm-editor': { 'border-radius': '0.375rem' },
    '&': { 'border-radius': '0.375rem' },
    '.cm-scroller': { 'border-radius': '0.375rem' },
    '.cm-content': { 'border-radius': '0.375rem' },
    '.cm-focused': { 'border-radius': '0.375rem' },
  });

  const currentTheme = document.documentElement.classList.contains('dark') ? tokyoNight : tokyoNightDay;

  useEffect(() => {
    if (open && !editorView && isEditorReady) {
      const newState = EditorState.create({
        doc: JSON.stringify(
                          modifiedFieldData,
                          null,
                          2,
                        ),
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          foldGutter(),
          drawSelection(),
          dropCursor(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          bracketMatching(),
          closeBrackets(),
          rectangularSelection(),
          crosshairCursor(),
          highlightActiveLine(),
          highlightSelectionMatches(),
          keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...completionKeymap,
            ...lintKeymap,
          ]),
          json(),
          currentTheme,
          borderTheme,
          EditorState.readOnly.of(true)
        ],
      });

      const view = new EditorView({
        state: newState,
        parent: editorContainerRef.current,
      });

      setEditorView(view);
    }

    return () => {
      if (editorView) {
        editorView.destroy();
      }
    };
  }, [open, isEditorReady]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setIsEditorReady(true), 50);
      return () => clearTimeout(timer);
    } else {
      if(editorView){
        editorView.destroy();
      }
      setIsEditorReady(false);
      setEditorView(null);
    }
  }, [open]);  

  let {
    userAddress,
    fujiCoreContract,
    mumbaiCoreContract,
    rippleCoreContract,
    fujiTwoFAContract,
    mumbaiTwoFAContract,
    rippleTwoFAContract,
    twoFactorAuthPassword,
    contractPassword,
    web3,
    chainId,
  } = useGlobal()

  const _2FAContract =
    chainId == 43113
      ? fujiTwoFAContract
      : chainId == 80001
        ? mumbaiTwoFAContract
        : chainId == 1440002
          ? rippleTwoFAContract
          : null

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
      document.getElementById('submitButton').textContent = 'Send Data'
      document.getElementById('submitButton').className =
        'ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
      document.getElementById('submitButton').disabled = false
    }
  }

  const handleSubmit = async () => {
    // Update UI to indicate that the submission is in progress
    if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent = 'Running...';
      document.getElementById('submitButton').className =
        'ml-3 inline-flex justify-center rounded-md border border-transparent bg-gray-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2';
      document.getElementById('submitButton').disabled = true;
    }
  
    // Handle two-factor authentication if required
    if (require2FA) {
      if (chainId != 1440002) {
        // Chainlink 2FA variants
  
        // Prepare data for requesting a random number from the 2FA smart contract
        const _2FASmartContractRequestRandomNumberCallData = {
          _id: twoFARequestID, // cast to big int once it's a string
          _oneTimeKey: twoFAOneTimeToken,
        };
  
        // Encode the ABI for the requestRandomNumber method
        let data = _2FAContract.methods
          .requestRandomNumber(
            _2FASmartContractRequestRandomNumberCallData._id,
            _2FASmartContractRequestRandomNumberCallData._oneTimeKey,
          )
          .encodeABI();
  
        // Prepare the transaction object
        let txObject = {
          from: userAddress,
          to: _2FAContract.options.address,
          data: data,
          gas: 500000,
        };
  
        // Update UI to indicate waiting for a random number
        if (document.getElementById('submitButton')) {
          document.getElementById('submitButton').textContent =
            'Awaiting random number request...';
        }
  
        // Send the transaction to request a random number
        try {
          let receipt = await web3.eth.sendTransaction(txObject);
        } catch (error) {
          // Handle errors and reset UI
          resetSubmitButton();
          makeErrorNotif("Error requesting random number", error.toString());
          return;
        }
  
        // Update UI to indicate getting the random number
        if (document.getElementById('submitButton')) {
          document.getElementById('submitButton').textContent =
            'Getting random number...';
        }
  
        // Get the random number from the 2FA smart contract
        let randomNumber;
        for (let attempt = 0; attempt < 30; attempt++) {
          try {
            randomNumber = await _2FAContract.methods
              .getRandomNumber(twoFARequestID)
              .call();
            break;
          } catch (error) {
            // Handle errors and retry
            if (attempt === 3) {
              if (document.getElementById('submitButton')) {
                document.getElementById('submitButton').textContent =
                  'Still getting random number...';
              }
            }
            if (attempt < 30) {
              await new Promise((resolve) => setTimeout(resolve, 2000));
            } else {
              // Handle failure to retrieve the random number after 1 minute
              console.error("Failed to retrieve random number after 1 minute.");
              resetSubmitButton();
              makeErrorNotif(
                "Error requesting random number",
                "Failed to retrieve random number after 1 minute."
              );
              return;
            }
          }
        }
  
        // Calculate the hash of the 2FA secret
        let _2FA_secret_hash = String(
          await poseidon([stringToBigInt(twoFactorAuthPassword)]),
        );
  
        // Generate 2FA proof
        const _2FAProof = await generate2FAProof({
          random_number: String(randomNumber),
          two_factor_secret: String(stringToBigInt(twoFactorAuthPassword)),
          secret_hash: _2FA_secret_hash,
        });
  
        // Prepare data for verifying the 2FA proof
        const _2FASmartContractVerifyProofCallData = {
          _id: twoFARequestID,
          _randomNumber: randomNumber,
          _userSecretHash: _2FA_secret_hash,
          params: {
            pA0: _2FAProof.proof.pi_a[0],
            pA1: _2FAProof.proof.pi_a[1],
            pB00: _2FAProof.proof.pi_b[0][0],
            pB01: _2FAProof.proof.pi_b[0][1],
            pB10: _2FAProof.proof.pi_b[1][0],
            pB11: _2FAProof.proof.pi_b[1][1],
            pC0: _2FAProof.proof.pi_c[0],
            pC1: _2FAProof.proof.pi_c[1],
            pubSignals0: _2FAProof.proof.pubSignals[0],
            pubSignals1: _2FAProof.proof.pubSignals[1],
          },
        };
  
        // Encode the ABI for the verifyProof method
        data = _2FAContract.methods
          .verifyProof(
            _2FASmartContractVerifyProofCallData._id,
            _2FASmartContractVerifyProofCallData._randomNumber,
            _2FASmartContractVerifyProofCallData._userSecretHash,
            _2FASmartContractVerifyProofCallData.params,
          )
          .encodeABI();
  
        // Update UI to indicate awaiting 2FA acceptance
        if (document.getElementById('submitButton')) {
          document.getElementById('submitButton').textContent =
            'Awaiting 2FA acceptance...';
        }
  
        // Send the transaction to verify the 2FA proof
        try {
          let receipt = await web3.eth.sendTransaction({
            from: userAddress,
            to: _2FAContract.options.address,
            data: data,
            gas: 5000000,
          });
        } catch (error) {
          // Handle errors and reset UI
          console.error(error);
          resetSubmitButton();
          makeErrorNotif("Error verifying 2FA proof", error.toString());
          return;
        }
      } else {
        // Non-chainlink 2FA variants
  
        // Prepare data for requesting a proof from the 2FA smart contract
        const _2FASmartContractRequestProofCallData = {
          _id: twoFARequestID,
          _oneTimeKey: twoFAOneTimeToken,
        };
  
        // Encode the ABI for the requestProof method
        let data = _2FAContract.methods
          .requestProof(
            _2FASmartContractRequestProofCallData._id,
            _2FASmartContractRequestProofCallData._oneTimeKey,
          )
          .encodeABI();
  
        // Prepare the transaction object
        let txObject = {
          from: userAddress,
          to: _2FAContract.options.address,
          data: data,
          gas: 500000,
        };
  
        // Update UI to indicate awaiting response acceptance
        if (document.getElementById('submitButton')) {
          document.getElementById('submitButton').textContent =
            'Awaiting response acceptance...';
        }
  
        // Send the transaction to request a proof
        try {
          let receipt = await web3.eth.sendTransaction(txObject);
        } catch (error) {
          // Handle errors and reset UI
          console.error(error);
          resetSubmitButton();
          makeErrorNotif("Error verifying request proof", error.toString());
          return;
        }
  
        // Calculate the hash of the 2FA secret
        let _2FA_secret_hash = String(
          await poseidon([stringToBigInt(twoFactorAuthPassword)]),
        );
  
        // Generate 2FA proof with a random number of 0 (specific to non-Chainlink variants)
        const _2FAProof = await generate2FAProof({
          random_number: String(0),
          two_factor_secret: String(stringToBigInt(twoFactorAuthPassword)),
          secret_hash: _2FA_secret_hash,
        });
  
        // Prepare data for verifying the 2FA proof
        const _2FASmartContractVerifyProofCallData = {
          _id: twoFARequestID,
          _userSecretHash: _2FA_secret_hash,
          params: {
            pA0: _2FAProof.proof.pi_a[0],
            pA1: _2FAProof.proof.pi_a[1],
            pB00: _2FAProof.proof.pi_b[0][0],
            pB01: _2FAProof.proof.pi_b[0][1],
            pB10: _2FAProof.proof.pi_b[1][0],
            pB11: _2FAProof.proof.pi_b[1][1],
            pC0: _2FAProof.proof.pi_c[0],
            pC1: _2FAProof.proof.pi_c[1],
            pubSignals0: _2FAProof.proof.pubSignals[0],
            pubSignals1: _2FAProof.proof.pubSignals[1],
          },
        };
  
        // Encode the ABI for the verifyProof method
        data = _2FAContract.methods
          .verifyProof(
            _2FASmartContractVerifyProofCallData._id,
            _2FASmartContractVerifyProofCallData._userSecretHash,
            _2FASmartContractVerifyProofCallData.params,
          )
          .encodeABI();
  
        // Update UI to indicate awaiting response acceptance
        if (document.getElementById('submitButton')) {
          document.getElementById('submitButton').textContent =
            'Awaiting response acceptance...';
        }
  
        // Send the transaction to verify the 2FA proof
        try {
          let receipt = await web3.eth.sendTransaction({
            from: userAddress,
            to: _2FAContract.options.address,
            data: data,
            gas: 5000000,
          });
        } catch (error) {
          // Handle errors and reset UI
          console.error(error);
          resetSubmitButton();
          makeErrorNotif("Error verifying 2FA proof", error.toString());
          return;
        }
      }
    }
  
    // Determine the core contract based on the chainId
    const coreContract =
      chainId == 43113
        ? fujiCoreContract
        : chainId == 80001
        ? mumbaiCoreContract
        : chainId == 1440002
        ? rippleCoreContract
        : null;
  
    // Split the fieldRequested, oneTimeSalt, oneTimeKey, and contractPassword into 24-character chunks
    const field = splitTo24(fieldRequested);
    const salt = oneTimeSalt;
    const one_time_key = splitTo24(oneTimeKey);
    const user_secret = splitTo24(contractPassword);
  
    // Calculate various hashes using Poseidon hash function
    const provided_field_and_key_hash = await poseidon(
      [field[0], field[1], one_time_key[0], one_time_key[1]].map((x) =>
        stringToBigInt(x),
      ),
    );
    const provided_field_and_salt_and_user_secret_hash = await poseidon(
      [field[0], field[1], salt, user_secret[0], user_secret[1]].map((x) =>
        stringToBigInt(x),
      ),
    );
    const provided_salt_hash = await poseidon([stringToBigInt(oneTimeSalt)]);
    const dataLocation = await poseidon(
      [field[0], field[1], salt, user_secret[0], user_secret[1]].map((x) =>
        stringToBigInt(x),
      ),
    );
  
    // Generate proof for the core contract
    const coreProof = await generateCoreProof({
      field_0: stringToBigInt(field[0]),
      field_1: stringToBigInt(field[1]),
      field_salt: stringToBigInt(salt),
      one_time_key_0: stringToBigInt(one_time_key[0]),
      one_time_key_1: stringToBigInt(one_time_key[1]),
      user_secret_0: stringToBigInt(user_secret[0]),
      user_secret_1: stringToBigInt(user_secret[1]),
      provided_field_and_key_hash: provided_field_and_key_hash,
      provided_field_and_salt_and_user_secret_hash:
        provided_field_and_salt_and_user_secret_hash,
      provided_salt_hash: provided_salt_hash,
    });
  
    // Prepare data for the respond method of the core contract
    const respondCallData = {
      requestId: requestID,
      dataLocation: dataLocation,
      saltHash: provided_salt_hash,
      params: {
        pA0: coreProof.proof.pi_a[0],
        pA1: coreProof.proof.pi_a[1],
        pB00: coreProof.proof.pi_b[0][0],
        pB01: coreProof.proof.pi_b[0][1],
        pB10: coreProof.proof.pi_b[1][0],
        pB11: coreProof.proof.pi_b[1][1],
        pC0: coreProof.proof.pi_c[0],
        pC1: coreProof.proof.pi_c[1],
        pubSignals0: coreProof.proof.pubSignals[0],
        pubSignals1: coreProof.proof.pubSignals[1],
        pubSignals2: coreProof.proof.pubSignals[2],
      },
      isUpdate: false,
    };
  
    // Encode the ABI for the respond method
    let data = coreContract.methods
      .respond(
        respondCallData.requestId,
        respondCallData.dataLocation,
        respondCallData.saltHash,
        respondCallData.params,
        respondCallData.isUpdate,
      )
      .encodeABI();
  
    // Prepare the transaction object for the core contract
    let txObject = {
      from: userAddress,
      to: coreContract.options.address,
      data: data,
      gas: 5000000,
    };
  
    // Handle additional steps if two-factor authentication is required  

    if (require2FA) {
      if (chainId != 1440002) {
        let twoFASuccess
        for (let attempt = 0; attempt < 30; attempt++) {
          twoFASuccess = await _2FAContract.methods
            .twoFactorData(twoFARequestID)
            .call()
          if (twoFASuccess.success) break
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }
    }
    if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent =
        'Awaiting final response acceptance...'
    }
    try {
      let receipt = await web3.eth.sendTransaction(txObject)
    } catch (error) {
      console.error(error)
      resetSubmitButton()
      makeErrorNotif("Error submitting response transaction", error.toString())
      return
    }
    if (document.getElementById('submitButton')) {
      document.getElementById('submitButton').textContent =
        'Submitting response...'
    }
    try {
      onSubmit()
    } catch (error) {
      console.error(error)
      resetSubmitButton()
      makeErrorNotif("Error submitting response to API", error)
      return
    }
    showNotif(false, "Data Response Sent", "Response sent successfully.") 
    onClose()
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto shadow-emerald-600 dark:bg-opacity-75"
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
                    className="dark:hover-text-gray-400 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-600"
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
                  Send Requested Data
                </Dialog.Title>
                <div className="mt-2 max-h-[40vh] min-w-[16rem] overflow-y-auto px-1 pb-1 md:min-w-[40rem] lg:max-h-[65vh] lg:min-w-[40rem]">
                  <div className="mt-4">
                    <label
                      htmlFor="requestID"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Request ID:
                    </label>
                    <textarea
                      id="requestID"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={requestID}
                    />
                  </div>
                  <div className="mt-4">
                    <label
                      htmlFor="addressOfRequestingParty"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Address of Requesting Party:
                    </label>
                    <textarea
                      id="addressOfRequestingParty"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={addressOfRequestingParty}
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="fieldRequested"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Field Requested:
                    </label>
                    <textarea
                      id="fieldRequested"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={fieldRequested}
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="data"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Data:
                    </label>
                    <div className="mt-1 rounded-md border border-gray-300 focus-within:z-10 focus-within:border-emerald-500 focus-within:outline-none focus-within:ring focus-within:ring-[1.25px] focus-within:ring-emerald-500 dark:border-gray-600 dark:focus-within:ring-[1.75px]">
                      <div
                        ref={editorContainerRef}
                        className="block w-full font-mono"
                      ></div>
                    </div>
                    {/* <textarea
                      id="data"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={8}
                      readOnly
                      spellCheck="false"
                      value={JSON.stringify(modifiedFieldData, null, 2)}
                    /> */}
                  </div>

                  <hr className="my-4 border-gray-300 dark:border-gray-700" />

                  <div className="mt-4">
                    <label
                      htmlFor="oneTimeKey"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      One Time Key:
                    </label>
                    <textarea
                      id="oneTimeKey"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={oneTimeKey}
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="oneTimeSalt"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      One Time Salt:
                    </label>
                    <textarea
                      id="oneTimeSalt"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={oneTimeSalt}
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="timeLimit"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Time Limit of Request (in seconds):
                    </label>
                    <textarea
                      id="timeLimit"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={timeLimit}
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="require2FA"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      2FA Required?
                    </label>
                    <input
                      type="checkbox"
                      id="require2FA"
                      className="ml-1 mt-2 h-4 w-4 rounded border border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-700"
                      disabled
                      checked={require2FA}
                    />
                  </div>

                  {require2FA && (
                    <>
                      <div className="mt-4">
                        <label
                          htmlFor="twoFAProvider"
                          className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                        >
                          2FA Provider (address/name):
                        </label>
                        <textarea
                          id="twoFAProvider"
                          className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                          rows={1}
                          readOnly
                          spellCheck="false"
                          value={twoFAProvider}
                        />
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor="twoFARequestID"
                          className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                        >
                          2FA Request ID:
                        </label>
                        <textarea
                          id="twoFARequestID"
                          className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                          rows={1}
                          readOnly
                          spellCheck="false"
                          value={twoFARequestID}
                        />
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor="twoFAOneTimeToken"
                          className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                        >
                          2FA One Time Token:
                        </label>
                        <textarea
                          id="twoFAOneTimeToken"
                          className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                          rows={1}
                          readOnly
                          spellCheck="false"
                          value={twoFAOneTimeToken}
                        />
                      </div>

                      {(twoFAProvider.includes('zkp.services') ||
                        twoFAProvider.includes(_2FAContract?._address)) && (
                        <>
                          <div className="mt-6">
                            <label
                              htmlFor="disclaimer"
                              className="block text-sm font-bold leading-5 text-gray-900 dark:text-white"
                            >
                              Additional Contract Calls:
                            </label>
                            <p className="mt-2 whitespace-normal text-gray-500 dark:text-gray-300">
                              Since the 2FA provider is zkp.services, a few
                              smart contract calls may precede the core update
                              smart contract call if 2FA has not already been
                              completed.
                            </p>
                          </div>
                        </>
                      )}

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
                          2FA can only be completed via this dApp if a
                          zkp.services 2FA provider has been chosen and the one
                          time token was attached. For other providers, please
                          use the corresponding dApp/frontend/etc. to complete 2FA.
                        </p>
                      </div>
                    </>
                  )}

                  <hr className="my-4 border-gray-300 dark:border-gray-700" />

                  <div className="mt-4">
                    <label
                      htmlFor="responseFee"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Response Fee:
                    </label>
                    <textarea
                      id="responseFee"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={responseFee}
                    />
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
                    Send Data
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

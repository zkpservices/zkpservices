import { Fragment, useRef, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { removeMetadata } from './HelperCalls'
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

export function ReceivedDataResponseModal({
  open,
  onClose,
  requestID='',
  addressOfSendingParty = '',
  fieldRequested = '',
  dataSnapshot = '',
  oneTimeKey = '',
  oneTimeSalt = '',
  timeLimit = '',
  require2FA = false,
  twoFAProvider = '',
  twoFARequestID = '',
  twoFAOneTimeToken = '',
  responseFee = '',
}) {

  const modifiedFieldData = open ? removeMetadata(JSON.parse(dataSnapshot)[fieldRequested]) : {}

  const editorContainerRef = useRef(null);
  const [editorView, setEditorView] = useState(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

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

      console.log(view.state.doc.toString());
      console.log(JSON.parse(view.state.doc.toString()));

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
                  Received Data
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
                      htmlFor="addressOfSendingParty"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Address of Sending Party:
                    </label>
                    <textarea
                      id="addressOfSendingParty"
                      className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                      rows={1}
                      readOnly
                      spellCheck="false"
                      value={addressOfSendingParty}
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
                      htmlFor="dataSnapshot"
                      className="block text-sm font-medium leading-5 text-gray-900 dark:text-white"
                    >
                      Data Snapshot:
                    </label>
                    <div className="mt-1 rounded-md border border-gray-300 focus-within:z-10 focus-within:border-emerald-500 focus-within:outline-none focus-within:ring focus-within:ring-[1.25px] focus-within:ring-emerald-500 dark:border-gray-600 dark:focus-within:ring-[1.75px]">
                      <div
                        ref={editorContainerRef}
                        className="block w-full font-mono"
                      ></div>
                    </div>
                    {/* <textarea
                      id="dataSnapshot"
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

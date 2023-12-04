import { Fragment, useRef, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
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
import { removeMetadata, flattenJsonAndComputeHash } from './HelperCalls'

export function ViewFieldModal({
  title,
  open,
  onClose,
  onDelete,
  fieldName = '',
  fieldData = '',
  dataLocation = 'Default data location',
  dataHash = 'Default data hash',
  obfuscationSalt = 'Default obfuscation salt',
  saltHash = 'Salt hash',
}) {
  const editorContainerRef = useRef(null);
  const [editorView, setEditorView] = useState(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [modifiedFieldData, setModifiedFieldData] = useState({});
  let [modifiedDataHash, setDataHash] = useState("");

  const borderTheme = EditorView.theme({
    '.cm-editor': { 'border-radius': '0.375rem' },
    '&': { 'border-radius': '0.375rem' },
    '.cm-scroller': { 'border-radius': '0.375rem' },
    '.cm-content': { 'border-radius': '0.375rem' },
    '.cm-focused': { 'border-radius': '0.375rem' },
  });

  const currentTheme = document.documentElement.classList.contains('dark') ? tokyoNight : tokyoNightDay;

  useEffect(() => {
    if (open) {
      setModifiedFieldData(removeMetadata(fieldData[fieldName]));
      setDataHash(""); 

      const timer = setTimeout(() => setIsEditorReady(true), 50);
      return () => clearTimeout(timer);
    } else {
      if (editorView) {
        editorView.destroy();
        setEditorView(null);
      }
      setIsEditorReady(false);
      setModifiedFieldData({}); 
    }
  }, [open, fieldData, fieldName]);

  useEffect(() => {
    if (open && !editorView && isEditorReady) {
      const newState = EditorState.create({
        doc: JSON.stringify(modifiedFieldData, null, 2),
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
  }, [open, isEditorReady, modifiedFieldData]);

  useEffect(() => {
    const hashData = async () => {
      try {
        let dataWithFieldKey = {[fieldName]: modifiedFieldData};
        let res = await flattenJsonAndComputeHash(JSON.stringify(dataWithFieldKey));
        setDataHash(res.rootHash);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (open && modifiedFieldData && Object.keys(modifiedFieldData).length > 0) {
      hashData();
    }
  }, [open, modifiedFieldData, fieldName]);

  async function handleDelete() {
    onDelete(title.toLowerCase());
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
              <div className="relative mx-auto mt-6 max-w-screen-lg rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl dark:bg-gray-800 sm:my-20 sm:w-full sm:max-w-3xl sm:p-6">
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
                      className="mb-4 text-base font-semibold leading-6 text-gray-900 dark:text-white"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2 max-h-[40vh] min-w-[16rem] overflow-y-auto px-1 md:min-w-[40rem] lg:max-h-[65vh] lg:min-w-[40rem]">
                      <div className="mt-1 rounded-md border border-gray-300 focus-within:z-10 focus-within:border-emerald-500 focus-within:outline-none focus-within:ring focus-within:ring-[1.25px] focus-within:ring-emerald-500 dark:border-gray-600 dark:focus-within:ring-[1.75px]">
                        <div
                          ref={editorContainerRef}
                          className="block w-full font-mono"
                        ></div>
                      </div>
                      {/* <textarea
                        rows={8}
                        className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                        defaultValue={JSON.stringify(
                          modifiedFieldData,
                          null,
                          2,
                        )}
                        readOnly
                        spellCheck="false"
                      /> */}
                      <hr className="my-4 border-gray-300 dark:border-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Smart Contract Properties
                      </h3>
                      <div className="mt-2">
                        <div className="mb-2">
                          <label
                            htmlFor="dataLocation"
                            className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                          >
                            Data Location:
                          </label>
                          <textarea
                            rows={1}
                            id="dataLocation"
                            className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                            defaultValue={dataLocation}
                            readOnly
                          />
                        </div>
                        <div className="mb-2">
                          <label
                            htmlFor="modifiedDataHash"
                            className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                          >
                            Data Hash:
                          </label>
                          <textarea
                            rows={1}
                            id="dataHash"
                            className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                            defaultValue={modifiedDataHash}
                            readOnly
                          />
                        </div>
                        <div className="mb-2">
                          <label
                            htmlFor="obfuscationSalt"
                            className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                          >
                            Obfuscation Salt:
                          </label>
                          <textarea
                            rows={1}
                            id="obfuscationSalt"
                            className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                            defaultValue={obfuscationSalt}
                            readOnly
                          />
                        </div>
                        <div className="mb-2">
                          <label
                            htmlFor="saltHash"
                            className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                          >
                            Salt Hash:
                          </label>
                          <textarea
                            rows={1}
                            id="saltHash"
                            className="font-mono relative mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:placeholder-gray-300 dark:focus:border-emerald-500 sm:text-sm"
                            defaultValue={saltHash}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="ml-3 mt-3 inline-flex w-full justify-center rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:ring-gray-600 dark:hover:bg-slate-900 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    onClick={handleDelete}
                  >
                    Remove from Dashboard
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

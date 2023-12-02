import { useEffect } from 'react'

let hashFunction

const loadWasm = async () => {
  try {
    //Go runtime is loaded in _app.jsx along with snarkjs.min.js
    const go = new Go()
    const wasmModule = await WebAssembly.instantiate(
      await (await fetch('/poseidon/main.wasm')).arrayBuffer(),
      go.importObject,
    )
    go.run(wasmModule.instance)
    hashFunction = globalThis.hash
  } catch (error) {
    console.error('Error initializing WASM:', error)
  }
}

loadWasm()

export async function poseidon(inputs) {
  if (!hashFunction) {
    throw new Error('WASM is not initialized yet.')
  }

  const filteredInputs = inputs
    .map((input) => String(input).trim())
    .filter((input) => input !== '')
  if (filteredInputs.length === 0) {
    throw new Error('No valid inputs provided.')
  }

  return hashFunction.apply(null, filteredInputs)
}

export function usePoseidon() {
  useEffect(() => {
    if (!hashFunction) {
      loadWasm()
    }
  }, [])

  return poseidon
}

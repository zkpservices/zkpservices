package main

import (
	"math/big"
	"syscall/js"
	"github.com/iden3/go-iden3-crypto/poseidon"
)

func hash(this js.Value, inputs []js.Value) interface{} {
	nums := make([]*big.Int, len(inputs))
	for i, input := range inputs {
		nums[i] = new(big.Int)
		_, ok := nums[i].SetString(input.String(), 10)
		if !ok {
			return nil // or handle error
		}
	}

	// Call the poseidon.Hash function with the slice of *big.Int values
	result, err := poseidon.Hash(nums)
	if err != nil {
		return nil // or handle error
	}

	return result.String()
}

func registerCallbacks() {
	js.Global().Set("hash", js.FuncOf(hash))
}

func main() {
	c := make(chan struct{}, 0)
	registerCallbacks()
	<-c
}

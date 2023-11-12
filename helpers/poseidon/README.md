#### Instructions to create `main.wasm`:

- install Go - https://go.dev/doc/install
- run `go mod init main`
- run `go get github.com/iden3/go-iden3-crypto/poseidon`
- run `GOOS=js GOARCH=wasm go build -o main.wasm main.go`

An example on how to use `main.wasm` is available in `helpers/test_poseidon.html`

You also require `wasm_exec.js` to use `main.wasm` - instructions on where to obtain this file depend on which version of Go you installed and which architecture you installed it on.

On linux, you can check if this file is avaialble with `find /usr/local/go -name wasm_exec.js`
pragma solidity ^0.8.0;

contract Keccak {
    function hash(string memory _message) public pure returns (bytes32) {
        return keccak256(bytes(_message));
    }
}
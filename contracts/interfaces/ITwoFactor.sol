pragma solidity ^0.8.7;

interface ITwoFactorStatus {
    struct TwoFactorData {
        bool success;
        uint256 timestamp;
    }

    function twoFactorData(uint256 _id) external view returns (TwoFactorData memory);
}

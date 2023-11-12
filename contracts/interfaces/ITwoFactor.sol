pragma solidity ^0.8.7;

interface ITwoFactor{
    struct TwoFactorData {
        bool success;
        uint256 timestamp;
    }

    function twoFactorData(uint256 _id) external view returns (TwoFactorData memory);
    function generate2FA(uint256 _id, bytes32 _oneTimeKeyHash) external;
}
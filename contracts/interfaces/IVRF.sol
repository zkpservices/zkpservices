pragma solidity ^0.8.7;

interface IVRF {
    function requestRandomWords() external returns (uint256 requestId);

    function getRequestStatus(uint256 _requestId)
        external
        view
        returns (bool fulfilled, uint256[] memory randomWords);
}

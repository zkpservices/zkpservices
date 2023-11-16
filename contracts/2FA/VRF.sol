pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract VRF is VRFConsumerBaseV2, ConfirmedOwner {
    mapping(address => bool) public authorized;

    modifier onlyAuthorized() {
        require(authorized[msg.sender], "Caller is not authorized");
        _;
    }

    function setAuthorized(address _address, bool _status) public onlyOwner {
        authorized[_address] = _status;
    }

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }

    mapping(uint256 => RequestStatus) public s_requests; /* requestId --> requestStatus */
    VRFCoordinatorV2Interface public COORDINATOR;

    uint64 public s_subscriptionId;

    uint256[] public requestIds;
    uint256 public lastRequestId;
    bytes32 public keyHash;

    uint32 callbackGasLimit = 100000;
    uint16 public requestConfirmations;
    uint32 public numWords = 1;

    constructor(
        bytes32 _keyHash,
        uint64 subscriptionId,
        address vrfCoordinator,
        uint16 minimumConfirmations
    ) VRFConsumerBaseV2(vrfCoordinator) ConfirmedOwner(msg.sender) {
        keyHash = _keyHash;
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        requestConfirmations = minimumConfirmations;
        s_subscriptionId = subscriptionId;
        authorized[msg.sender] = true;
    }

    function requestRandomWords()
        external
        onlyAuthorized
        returns (uint256 requestId)
    {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRequestStatus(uint256 _requestId)
        external
        view
        returns (bool fulfilled, uint256[] memory randomWords)
    {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }
}

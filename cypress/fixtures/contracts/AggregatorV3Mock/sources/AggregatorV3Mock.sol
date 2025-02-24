// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);

    function getRoundData(
        uint80 _roundId
    )
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

contract AggregatorV3MockContract {
    struct RoundData {
        uint256 startedAt;
        int256 answer;
        uint256 updatedAt;
        uint80 answeredInRound;
    }
    uint8 public decimals;
    string public description = "ETH/USD";
    address owner;

    mapping(uint => RoundData) public rounds;
    uint80 latestRoundId = 1;

    constructor() {
        decimals = 18;
        owner = msg.sender;
    }

    function getRoundData(
        uint80 _roundId
    )
        public
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (
            _roundId,
            rounds[_roundId].answer,
            rounds[_roundId].startedAt,
            rounds[_roundId].updatedAt,
            rounds[_roundId].answeredInRound
        );
    }

    function latestRoundData()
        public
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return getRoundData(latestRoundId);
    }

    function setRoundData(int answer) public {
        require(msg.sender == owner, "Only the contract's owner may perform this action");

        RoundData storage newRound = rounds[++latestRoundId];

        uint timestamp = block.timestamp;
        newRound.startedAt = timestamp;
        newRound.updatedAt = timestamp;
        newRound.answer = answer;
        newRound.answeredInRound = latestRoundId;
    }
}

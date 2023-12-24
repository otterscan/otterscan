// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
* @title TinyTuple
* @dev A structure with fixed-length types
*/
struct TinyTuple {
    uint8 tinyUint8;
    bytes1 tinyBytes1;
    function(uint8) external tinyFunction;
}

/**
 * @title AllTypes
 * @dev A structure that has all types
 */
struct AllTypeVal {
    bool boolVal;
    uint8 uint8Val;
    uint256 uint256Val;
    int8 int8Val;
    int256 int256Val;
    address addressVal;
    bytes1 bytes1Val;
    bytes32 bytes32Val;
    function() external functionVal;
    bytes bytesVal;
    string stringVal;
    string[] varLenStringArray;
    string[2][2] fixedLenStringArray;
    TinyTuple tupleVal;
}

/**
 * @title AllTypes
 * @dev Store & retrieve all types
 */
contract AllTypes {

    /**
    * @dev Store & retrieve a bool
    * @param val Value to return
    */
    function getBool(bool val) public pure returns (bool) {
        return val;
    }

    /**
    * @dev Store & retrieve a uint8
    * @param val Value to return
    */
    function getUint8(uint8 val) public pure returns (uint8) {
        return val;
    }

    /**
    * @dev Store & retrieve a uint256
    * @param val Value to return
    */
    function getUint256(uint256 val) public pure returns (uint256) {
        return val;
    }

    /**
    * @dev Store & retrieve an int8
    * @param val Value to return
    */
    function getInt8(int8 val) public pure returns (int8) {
        return val;
    }

    /**
    * @dev Store & retrieve an int256
    * @param val Value to return
    */
    function getInt256(int256 val) public pure returns (int256) {
        return val;
    }

    /**
    * @dev Store & retrieve an address
    * @param val Value to return
    */
    function getAddress(address val) public pure returns (address) {
        return val;
    }

    /**
    * @dev Store & retrieve a bytes1
    * @param val Value to return
    */
    function getBytes1(bytes1 val) public pure returns (bytes1) {
        return val;
    }

    /**
    * @dev Store & retrieve a bytes32
    * @param val Value to return
    */
    function getBytes32(bytes32 val) public pure returns (bytes32) {
        return val;
    }

    /**
    * @dev Store & retrieve a function
    * @param val Value to return
    */
    function getFunction(function() external val) public pure returns (function() external) {
        return val;
    }

    /**
    * @dev Store & retrieve a byte array
    * @param val Value to return
    */
    function getBytes(bytes calldata val) public pure returns (bytes calldata) {
        return val;
    }

    /**
    * @dev Store & retrieve a string
    * @param val Value to return
    */
    function getString(string calldata val) public pure returns (string calldata) {
        return val;
    }

    /**
    * @dev Store & retrieve a variable-length string array
    * @param val Value to return
    */
    function getVariableLengthStringArray(string[] calldata val) public pure returns (string[] calldata) {
        return val;
    }

    /**
    * @dev Store & retrieve a fixed-length string array
    * @param val Value to return
    */
    function getFixedLengthStringArray(string[2][2] calldata val) public pure returns (string[2][2] calldata) {
        return val;
    }

    /**
    * @dev Store & retrieve a tuple with fixed-length types
    * @param val Value to return
    */
    function getTinyTuple(TinyTuple calldata val) public pure returns (TinyTuple calldata) {
        return val;
    }

    /**
    * @dev Store & retrieve a tuple with all types
    * @param val Value to return
    */
    function getAllTypeTuple(AllTypeVal calldata val) public pure returns (AllTypeVal calldata) {
        return val;
    }
}

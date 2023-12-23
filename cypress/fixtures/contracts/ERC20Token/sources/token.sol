// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title ERC20 Token
 * @dev Implements the ERC20 token standard
 */
contract ERC20 {
    // Token name
    string public name;

    // Token symbol
    string public symbol;

    // Total supply of tokens
    uint256 public totalSupply;

    // Mapping of account balances
    mapping(address => uint256) public balanceOf;

    // Mapping of allowances
    mapping(address => mapping(address => uint256)) public allowance;

    // Event triggered when tokens are transferred
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Event triggered when an allowance is approved
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Token decimals
    uint8 public decimals;

    /**
     * @dev Constructor function
     */
    constructor() {
        name = "MyToken";
        symbol = "MTK";
        totalSupply = 10000000 * 10**18;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
        decimals = 18;
    }

    /**
     * @dev Transfers tokens from the sender's account to the specified recipient
     * @param to The address to transfer tokens to
     * @param value The amount of tokens to transfer
     */
    function transfer(address to, uint256 value) public returns (bool success) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev Transfers tokens from a specified account to another account
     * @param from The address to transfer tokens from
     * @param to The address to transfer tokens to
     * @param value The amount of tokens to transfer
     */
    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Not enough allowance");

        allowance[from][msg.sender] -= value;
        balanceOf[from] -= value;
        balanceOf[to] += value;

        emit Transfer(from, to, value);
        return true;
    }

    /**
     * @dev Approves an allowance for another address
     * @param spender The address that is allowed to spend tokens on behalf of the owner
     * @param value The maximum amount of tokens that can be spent
     */
    function approve(address spender, uint256 value) public returns (bool success) {
        allowance[msg.sender][spender] = value;

        emit Approval(msg.sender, spender, value);
        return true;
    }
}

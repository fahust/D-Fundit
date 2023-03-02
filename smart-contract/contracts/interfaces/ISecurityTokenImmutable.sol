// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "../library/TokenLibrary.sol";

interface ISecurityTokenImmutable {

    /**
     * @notice Set address of proxy contract to accept only proxy requests
     * @param _addressProxy {address} address of contract proxy
     */
    function setAddressProxy(address _addressProxy) external;

    /**
     * @notice Get address of proxy contract
     * @return addressProxy {address} address of contract proxy
     */
    function getAddressProxy() external view returns(address);

    /**
     * @notice Set fundraising parameters to mint tokens in conditions
     * @param startFundraising {uint256} start timestamp of the fundraising
     * @param endFundraising {uint256} end timestamp of the fundraising
     * @param maxSupply {uint256} max supply tokens of contract
     */
    function setFundraising(
        uint256 startFundraising,
        uint256 endFundraising,
        uint256 maxSupply
    ) external;

    /**
     * @notice Set parameters rules of contract only if at start rules is setted modifiable
     * @param _rules {TokenLibrary.Rules} struct of rules
     */
    function setRules(TokenLibrary.Rules memory _rules) external;

    /**
     * @notice Get parameters rules of contract
     * @return rules {TokenLibrary.Rules} struct of rules setted on smart contract
     */
    function getRules() external view returns(TokenLibrary.Rules memory);

    /**
     * @notice Returns the version of the token contract
     * @return TOKEN_VERSION {string} version of the smart contract
     */
    function version() external pure returns (string memory);

    /**
     * @notice Returns the address wallet of the smart contract owner.
     * @return owner {address} wallet addres from owner
     */
    function owner() external view returns (address);

    /**
     * @notice Get movements of the assets
     * @return result {TokenLibrary.Transfer[]} array of register transfers movements
     */
    function transfers(uint32 skip, uint32 limit) external view returns (TokenLibrary.Transfer[] memory);

    /**
     * @notice Transfer ownership of the smart contract
     * @param account {address} address of the new owner
     */
    function transferOwnership(address account) external;

    /**
     * @notice Mint and send `amount` tokens to `to`
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     * @param to {address} wallet to send the token
     * @param amount {uint256} amount to mint
     * @return result {boolean} success or failure
     */
    function mint(address to, uint256 amount) external payable returns (bool);

    /**
     * @notice Remove `amount` tokens from `account`
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     * @param account {address} wallet to burn the token
     * @param amount {uint256} amount to burn
     */
    function burn(address account, uint256 amount, uint256 refoundable) external returns (bool);

    /**
     * @dev Transfer and send `amount` tokens from `_msgSender()` to `to`
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     * @param to {address} wallet to transfer the token
     * @param amount {uint256[]} amount to transfer
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Transfer and send `amount` tokens from `from` to `to`
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     * @param from {address} wallet from transfer the token
     * @param to {address} wallet to transfer the token
     * @param amount {uint256[]} amount to transfer
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);


    /**
     *  @notice Pause transfer tokens of smart contract
     *  @param _paused {uint256} represents date when transfer restart
     */
    function pause(uint256 _paused) external;

    /**
     *  @notice Unpause transfer tokens of smart contract
     */
    function unpause() external;

    /**
     *  @notice Check if contract is paused or not
     */
    function isPaused() external view returns(uint256);

    /**
     * @notice Withdraw tokens amount of contract balance
     * @param amount {uint256} the number of tokens transferred
     * @param receiver {address} the recipient of the token transfer
     */
    function withdraw(uint256 amount, address receiver) external returns(bool);

    /**
     * @notice handle payment receive by everyone, everywhere, all at once
     * @param senderAddress {address} address of sender
     */
    function handlePayment(address senderAddress)external payable returns(bool);

    /**
     * @notice Inject wei into smart contract
     */
    function injectCapital() external payable returns(bool);

    /**
     * @notice Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @notice Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

}

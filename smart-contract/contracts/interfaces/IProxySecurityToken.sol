// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "../immutable/StorageToken.sol";
import "../library/TokenLibrary.sol";
import "../interfaces/ISecurityTokenImmutable.sol";

interface IProxySecurityToken {

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
     * @notice Transfer ownership of the smart contract
     * @param account {address} address of the new owner
     */
    function transferOwnership(address account) external;

    /**
     * @notice Return not freezed tokens from an address wallet
     * @param account {address} wallet address of account you want to get not freezed balance
     * @return balance {uint256} balance of wallet address totaly open
     */
    function eligibleBalanceOf(address account) external view returns(uint256);

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
    function burn(address account, uint256 amount) external returns (bool);

    /**
     * @notice Return amount of refoundable for amount of tokens burned
     * @param amount {uint256} amout of tokens burn
     * @return wei {uint256} amount of wei refoundable
     */
    function refoundable(uint256 amount) external view returns(uint256);

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
     * @notice Interface of transfer method, return hex code error message
     * @param operator {address} operator of transaction (sender)
     * @param from {address} the origin of the token transfer
     * @param to {address} the recipient of the token transfer
     * @param value {uint256} the number of tokens transferred
     * @return hex {bytes1} code error message
     */
    function canTransfer(
        address operator,
        address from,
        address to,
        uint256 value
    ) external view returns (bytes1);

    /**
     *  @notice Force an address wallet to transfer by agent
     *  @param from {address} from wallet to transfer
     *  @param to {address} to wallet to transfer
     *  @param amount {uint256} amounts of tokens to be transfered
     */
    function forceTransfer(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    /**
     *  @notice Return freezed or not wallet address tokens
     *  @param userAddress {address} of the user
     *  @return frozen {bool} represents freezed wallet address
     */
    function isFrozen(address userAddress) external view returns (bool);

    /**
     *  @notice Return freezed tokens amount of wallet address
     *  @param userAddress {address} of the user
     *  @return frozenTokens {uint256} amount of freezed tokens
     */
    function getFrozenTokens(address userAddress) external view returns (uint256);

    /**
     *  @notice Freeze totality tokens of single wallet address
     *  @param userAddress {address} of the user
     *  @param freeze {boolean} representing freezing
     */
    function setAddressFrozen(address userAddress, bool freeze) external;

    /**
     *  @notice Freeze totality tokens of multiples wallet addresses
     *  @param userAddresses {address[]} of user addresses
     *  @param freeze {bool[]} representing freezing
     */
    function batchSetAddressFrozen(address[] calldata userAddresses, bool[] calldata freeze) external;


    /**
     *  @notice Freeze patial tokens of single wallet
     *  @param userAddress {address} of the user
     *  @param amount {uint256} of token to be unfreezed
     */
    function freezePartialTokens(address userAddress, uint256 amount) external;

    /**
     *  @notice Freeze patial tokens of multiples wallets
     *  @param userAddresses {address[]} of user addresses
     *  @param amounts {uint256[]} of amounts of token to be unfreezed
     */
    function batchFreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts) external;

    /**
     *  @notice Unfreeze patial tokens of single wallet
     *  @param userAddress {address} of the user
     *  @param amount {uint256} of token to be unfreezed
     */
    function unfreezePartialTokens(address userAddress, uint256 amount) external;

    /**
     *  @notice Unfreeze patial tokens of multiples wallets
     *  @param userAddresses {address[]} of user addresses
     *  @param amounts {uint256[]} of amounts of token to be unfreezed
     */
    function batchUnfreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts) external;

    /**
     * @notice Freeze token of one address wallet periodically
     * @param startTime {uint256} Start time of freezing partial token
     * @param endTime {uint256} End time of freezing partial token
     * @param amountFreezed {uint256} Amount of frozen token
     * @param userAddress {address} Address wallet of the user frozen token
     */
    function setFreezedTokensPeriod(
        uint256 startTime,
        uint256 endTime,
        uint256 amountFreezed,
        address userAddress
    ) external;

    /**
     * @notice Retrieve struct of freezed tokens in period of msg.sender
     * @return freezedPeriod {TokenLibrary.FreezePeriod} struct of freezed tokens in period
     */
    function myFreezedTokensPeriod() external view returns (TokenLibrary.FreezePeriod memory);

    /**
     * @notice Retrieve struct of freezed tokens in period of one wallet address by agent
     * @param userAddress {address} of the user freezed tokens
     * @return freezedPeriod {TokenLibrary.FreezePeriod} struct of freezed tokens in period
     */
    function getFreezedTokensPeriod(address userAddress) external view returns (TokenLibrary.FreezePeriod memory);

    /**
     * @notice Get unlockable tokens freezed in period for msg.sender
     * @return unlockable {uint256} of unlockable tokens freezed in period
     */
    function unlockableTokensPeriod() external view returns (uint256);

    /**
     * @notice Redeem unlockable freezed tokens periodically
     * @return success {bool} success of redeeming tokens
     */
    function redeemFreezedTokens() external returns (bool);

    /**
     * @notice Withdraw tokens amount of contract balance
     * @param amount {uint256} the number of tokens transferred
     * @param receiver {address} the recipient of the token transfer
     */
    function withdraw(uint256 amount, address receiver) external;

    /**
     * @notice Check amount of withdrawable
     * @param amount {uint256} the number of tokens withdraw
     * @return weiWithdrawable {uint256} the number of wei transferrable
     */
    function withdrawable(uint256 amount) external view returns(uint256 weiWithdrawable);
}

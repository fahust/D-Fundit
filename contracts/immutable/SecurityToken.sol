// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "./StorageToken.sol";
import "../library/TokenLibrary.sol";
import "../roles/AgentRole.sol";
import "../roles/ReaderRole.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SecurityToken is ERC20, AgentRole, ReaderRole, StorageToken {
    using SafeMath for uint;

    /**
     */
    constructor(
        string memory _name,
        string memory _code,
        uint256 _pricePerToken,
        TokenLibrary.Rules memory _rules
    ) ERC20(_name, _code) StorageToken(_pricePerToken) {
        OWNER = _msgSender();
        rules = _rules;
    }

    /// @dev Modifier to make a function callable only when the contract is not paused.
    modifier whenNotPaused() {
        require(_now() > paused, "Pausable: paused");
        _;
    }

    /// @dev Modifier to make a function callable only when the contract is paused.
    modifier whenPaused() {
        require(_now() <= paused, "Pausable: not paused");
        _;
    }

    /**
     * @notice Returns the version of the token contract
     * @return TOKEN_VERSION {string} version of the smart contract
     */
    function version() external pure returns (string memory) {
        return TOKEN_VERSION;
    }

    /**
     * @notice Returns the address wallet of the smart contract owner.
     * @return owner {address} wallet addres from owner
     */
    function owner() public view override(Ownable) returns (address) {
        return OWNER;
    }

    /**
     * @notice Get movements of the assets
     * @return result {TokenLibrary.Transfer[]} array of register transfers movements
     */
    function transfers() public view onlyReader() returns (TokenLibrary.Transfer[] memory) {
        TokenLibrary.Transfer[] memory result = new TokenLibrary.Transfer[](_transfersCount);
        for (uint32 i = 0; i < _transfersCount; i++) {
            result[i] = _transfers[i];
        }
        return result;
    }

    /**
     * @notice Transfer ownership of the smart contract
     * @param account {address} address of the new owner
     */
    function transferOwnership(address account) public virtual override(Ownable) onlyOwner {
        emit TransferOwnership(OWNER, account);
        OWNER = account;
    }

    /**
     * @notice return not freezed tokens from an address wallet
     * @param account {address} wallet address of account you want to get not freezed balance
     * @return balance {uint256} balance of wallet address totaly open
     */
    function eligibleBalanceOf(address account) public view returns(uint256) {
        return balanceOf(account) - frozenTokens[account] - (freezedPeriod[account].amountFreezed);
    }

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
    function mint(address to, uint256 amount) external payable returns (bool) {
        require(msg.value >= pricePerToken * amount, "Not enough eth");
        _mint(to, amount);
        return true;
    }

    /**
     * @notice Remove `amount` tokens from `account`
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     * @param account {address} wallet to burn the token
     * @param amount {uint256} amount to burn
     */
    function burn(address account, uint256 amount)
        public
        returns (bool)
    {
        uint256 freeBalance = eligibleBalanceOf(account);
        if (amount > freeBalance) {
            uint256 tokensToUnfreeze = amount - (balanceOf(account) - frozenTokens[account]);
            if (amount > balanceOf(account) - frozenTokens[account]) {
                frozenTokens[account] = frozenTokens[account] - (tokensToUnfreeze);
                emit TokensUnfrozen(account, tokensToUnfreeze);
            }
            if (amount - tokensToUnfreeze > balanceOf(account) - (freezedPeriod[account].amountFreezed)) {
                uint256 tokensToUnfreezePeriod =
                amount - tokensToUnfreeze - (balanceOf(account) - freezedPeriod[account].amountFreezed);
                freezedPeriod[account].amountFreezed = freezedPeriod[account].amountFreezed - (tokensToUnfreezePeriod);
                emit TokensUnfrozenPeriod(account, tokensToUnfreeze);
            }
        }

        //totalSupply();

        // (bool sent, ) = account.call{value: pricePerToken * amount}("");
        // require(sent, "Failed to send Ether");

        _burn(account, amount);
        return true;
    }

    /**
     * @dev Transfer and send `amount` tokens from `_msgSender()` to `to`
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     * @param to {address} wallet to transfer the token
     * @param amount {uint256[]} amount to transfer
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        _transfer(_msgSender(), to, amount);
        return true;
    }

    /**
     *  @dev Transfers and send `amount` tokens from `_msgSender()` to `toList`
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     * @param toList {address[]} wallets to transfer the tokens
     * @param amounts {uint256[]} amounts to transfer
     */
    function batchTransfer(address[] calldata toList, uint256[] calldata amounts) external {
        for (uint256 i = 0; i < toList.length; i++) {
            transfer(toList[i], amounts[i]);
        }
    }

    /**
     * @dev See {IERC20-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @notice Moves `amount` of tokens from `from` to `to`.
     * @param from {address} the origin of the token transfer
     * @param to {address} the recipient of the token transfer
     * @param amount {uint256} the number of tokens transferred
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override virtual {
        require(canTransfer(_msgSender(), from, to, amount) == (hex"51"));
        super._transfer(from, to, amount);
        _afterTokenTransfer("transfer", from, to, amount);
    }

    function canTransfer(address operator, address from, address to, uint256 value) public view returns (bytes1) {
        if (balanceOf(from) < value) return(hex"52"); // 0x52 insufficient balance
        // } else if(allowance(from, operator) <= value) {
        //     return(hex"53"); // 0x53 insufficient allowance
        if(_now() < paused) return(hex"54"); // 0x54 transfers halted (contract paused)
        if(balanceOf(from) - frozenTokens[from] - (freezedPeriod[from].amountFreezed) < value)
            return(hex"55"); // 0x55 funds locked (lockup period)
        if(from == address(0)) return(hex"56"); // 0x56 invalid sender
        if(to == address(0)) return(hex"57"); // 0x57 invalid receiver
        if(!isAgent(operator) && owner() != operator && from != operator )
            return(hex"58"); // 0x58 invalid operator
        if(frozen[from]) return(hex"5a"); // 0x5a frozen sender
        if(frozen[to]) return(hex"5b"); // 0x5b frozen receiver
        return (hex"51"); // 0x51 success
    }

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
    ) public onlyAgent returns (bool) {
        uint256 freeBalance = eligibleBalanceOf(from);
        require(rules.forcableTransfer == true, "forceTransfer is not authorized on this contract");

        if (amount > freeBalance) {
            uint256 tokensToUnfreeze = amount - (balanceOf(from) - frozenTokens[from]);
            if (amount > balanceOf(from) - frozenTokens[from]) {
                frozenTokens[from] = frozenTokens[from] - (tokensToUnfreeze);
                emit TokensUnfrozen(from, tokensToUnfreeze);
            }
            if (amount - tokensToUnfreeze > balanceOf(from) - (freezedPeriod[from].amountFreezed)) {
                uint256 tokensToUnfreezePeriod = 
                amount - tokensToUnfreeze - (balanceOf(from) - freezedPeriod[from].amountFreezed);
                freezedPeriod[from].amountFreezed = freezedPeriod[from].amountFreezed - (tokensToUnfreezePeriod);
                emit TokensUnfrozenPeriod(from, tokensToUnfreeze);
            }
        }

        _transfer(from, to, amount);
        return true;
    }

    /**
     *  @notice Force an array of transfer by agent
     *  @param fromList {address[]} from wallet to transfer
     *  @param toList {address[]} to wallet to transfer
     *  @param amounts {uint256[]} amounts of tokens to be transfered
     */
    function batchForceTransfer(
        address[] calldata fromList,
        address[] calldata toList,
        uint256[] calldata amounts
    ) external {
        for (uint256 i = 0; i < fromList.length; i++) {
            forceTransfer(fromList[i], toList[i], amounts[i]);
        }
    }

    /**
     * @notice Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     * @param account {address} the recipient of the token transfer
     * @param amount {uint256} the number of tokens destroyed
     */
    function _mint(address account, uint256 amount) internal virtual override {
        super._mint(account, amount);
        _afterTokenTransfer("mint", address(0), account, amount);
    }

    /**
     * @notice Destroys `amount` tokens from `account`, reducing the
     * total supply.
     * @param account {address} the origin of the token destroyed
     * @param amount {uint256} the number of tokens destroyed
     */
    function _burn(address account, uint256 amount) internal virtual override {
        super._burn(account, amount);
        _afterTokenTransfer("burn", account, address(0), amount);
    }

    /**
     *  @notice Pause transfer tokens of smart contract
     *  @param _paused {uint256} represents date when transfer restart
     */
    function pause(uint256 _paused) external onlyAgent whenNotPaused {
        require(rules.pausable == true, "Pause is not allowed");
        paused = _paused;
        emit Paused(_msgSender(), paused);
    }

    /**
     *  @notice Unpause transfer tokens of smart contract
     */
    function unpause() external onlyAgent whenPaused {
        require(rules.pausable == true, "Pause is not allowed");
        paused = 0;
        emit Paused(_msgSender(), paused);
    }

    /**
     *  @notice Return freezed or not wallet address tokens
     *  @param userAddress {address} of the user
     *  @return frozen {bool} represents freezed wallet address
     */
    function isFrozen(address userAddress) external view onlyReader returns (bool) {
        return frozen[userAddress];
    }

    /**
     *  @notice Return freezed tokens amount of wallet address
     *  @param userAddress {address} of the user
     *  @return frozenTokens {uint256} amount of freezed tokens
     */
    function getFrozenTokens(address userAddress) external view returns (uint256) {
        return frozenTokens[userAddress];
    }

    /**
     *  @notice Freeze totality tokens of single wallet address
     *  @param userAddress {address} of the user
     *  @param freeze {boolean} representing freezing
     */
    function setAddressFrozen(address userAddress, bool freeze) public onlyAgent {
        require(rules.freezableAddress == true, "Freeze address is not allowed");
        frozen[userAddress] = freeze;
        emit AddressFrozen(userAddress, freeze, _msgSender());
    }

    /**
     *  @notice Freeze totality tokens of multiples wallet addresses
     *  @param userAddresses {address[]} of user addresses
     *  @param freeze {bool[]} representing freezing
     */
    function batchSetAddressFrozen(address[] calldata userAddresses, bool[] calldata freeze) external {
        for (uint256 i = 0; i < userAddresses.length; i++) {
            setAddressFrozen(userAddresses[i], freeze[i]);
        }
    }


    /**
     *  @notice Freeze patial tokens of single wallet
     *  @param userAddress {address} of the user
     *  @param amount {uint256} of token to be unfreezed
     */
    function freezePartialTokens(address userAddress, uint256 amount) public onlyAgent {
        require(rules.freezablePartial == true, "Freeze partial address is not allowed");
        uint256 balance = balanceOf(userAddress);
        require(balance >= frozenTokens[userAddress] + amount, "Amount exceeds available balance");
        frozenTokens[userAddress] = frozenTokens[userAddress] + (amount);
        emit TokensFrozen(userAddress, amount);
    }

    /**
     *  @notice Freeze patial tokens of multiples wallets
     *  @param userAddresses {address[]} of user addresses
     *  @param amounts {uint256[]} of amounts of token to be unfreezed
     */
    function batchFreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts) external {
        for (uint256 i = 0; i < userAddresses.length; i++) {
            freezePartialTokens(userAddresses[i], amounts[i]);
        }
    }

    /**
     *  @notice Unfreeze patial tokens of single wallet
     *  @param userAddress {address} of the user
     *  @param amount {uint256} of token to be unfreezed
     */
    function unfreezePartialTokens(address userAddress, uint256 amount) public onlyAgent {
        require(rules.freezablePartial == true, "Freeze partial address is not allowed");
        require(frozenTokens[userAddress] >= amount, "Amount should be less than or equal to frozen tokens");
        frozenTokens[userAddress] = frozenTokens[userAddress] - (amount);
        emit TokensUnfrozen(userAddress, amount);
    }

    /**
     *  @notice Unfreeze patial tokens of multiples wallets
     *  @param userAddresses {address[]} of user addresses
     *  @param amounts {uint256[]} of amounts of token to be unfreezed
     */
    function batchUnfreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts) external {
        for (uint256 i = 0; i < userAddresses.length; i++) {
            unfreezePartialTokens(userAddresses[i], amounts[i]);
        }
    }

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
    ) external onlyAgent {
        require(rules.freezablePartialTime == true, "Freeze partial period address is not allowed");
        require(amountFreezed <= balanceOf(userAddress), "Amount is upper than balance of user");
        freezedPeriod[userAddress] = TokenLibrary.FreezePeriod(
            startTime,
            endTime,
            amountFreezed
        );
        emit TokensFrozenPeriod(userAddress, startTime, endTime, amountFreezed, _msgSender());
    }

    /**
     * @notice Retrieve struct of freezed tokens in period of msg.sender
     * @return freezedPeriod {TokenLibrary.FreezePeriod} struct of freezed tokens in period
     */
    function myFreezedTokensPeriod() external view returns (TokenLibrary.FreezePeriod memory) {
        return freezedPeriod[_msgSender()];
    }

    /**
     * @notice Retrieve struct of freezed tokens in period of one wallet address by agent
     * @param userAddress {address} of the user freezed tokens
     * @return freezedPeriod {TokenLibrary.FreezePeriod} struct of freezed tokens in period
     */
    function getFreezedTokensPeriod(address userAddress) external view onlyAgent returns (TokenLibrary.FreezePeriod memory) {
        return freezedPeriod[userAddress];
    }

    /**
     * @notice Get unlockable tokens freezed in period for msg.sender
     * @return unlockable {uint256} of unlockable tokens freezed in period
     */
    function unlockableTokensPeriod() public view returns (uint256) {
        TokenLibrary.FreezePeriod memory freezedPeriodTemp = freezedPeriod[_msgSender()];

        require(freezedPeriodTemp.amountFreezed > 0, "No token to unfreeze");
        require(_now() - freezedPeriodTemp.startTime > 30, "Time for redeem is too short");

        uint256 diff = freezedPeriodTemp.endTime - freezedPeriodTemp.startTime;
        uint256 timeBehind = _now() - freezedPeriodTemp.startTime;

        return timeBehind.mul(100).div(diff).mul(freezedPeriodTemp.amountFreezed).div(100);
    }

    /**
     * @notice Redeem unlockable freezed tokens periodically
     * @return success {bool} success of redeeming tokens
     */
    function redeemFreezedTokens() external returns (bool) {
        uint256 unlockable = unlockableTokensPeriod();
        if(unlockable <= 0) return false;

        freezedPeriod[_msgSender()].startTime = _now();
        freezedPeriod[_msgSender()].amountFreezed = freezedPeriod[_msgSender()].amountFreezed - unlockable;

        emit TokensUnfrozenPeriod(_msgSender(), unlockable);

        return true;
    }

    /**
     * @notice Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     * @param transferType {string} the type of transfer
     * @param from {address} the origin of the token transfer
     * @param to {address} the recipient of the token transfer
     * @param amount {uint256} the number of tokens transferred
     */
    function _afterTokenTransfer(
        string memory transferType,
        address from,
        address to,
        uint256 amount
    ) internal virtual whenNotPaused {
        emit Transfer(transferType, from, to, amount);
        _transfers[_transfersCount] = TokenLibrary.Transfer(
            transferType,
            from,
            to,
            amount,
            _now()
        );
        _transfersCount++;
    }
}

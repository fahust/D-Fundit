// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "../immutable/StorageToken.sol";
import "../library/TokenLibrary.sol";
import "../interfaces/ISecurityTokenImmutable.sol";
import "../interfaces/IProxySecurityToken.sol";
import "../roles/AgentRole.sol";
import "../roles/ReaderRole.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ProxySecurityToken is AgentRole, ReaderRole, StorageToken, IProxySecurityToken {
    using SafeMath for uint;

    ISecurityTokenImmutable public TokenContract;

    /**
     */
    constructor(uint256 _pricePerToken) StorageToken(_pricePerToken) {
        OWNER = _msgSender();
        lastWithdraw = _now();
    }

    /**
     * @notice set the contract address of security token immutable
     * @param _securityTokenImmutableAddress {address} address of security token immutable contract
     */
    function setSecurityTokenImmutable(address _securityTokenImmutableAddress) external onlyOwner {
        TokenContract = ISecurityTokenImmutable(_securityTokenImmutableAddress);
    }

    /// @dev Modifier to check if fundraising is open and max supply not reached.
    modifier fundraisable(uint256 amount) {
        TokenLibrary.Rules memory _rules = TokenContract.getRules();
        require(_now() >= _rules.startFundraising, "Fundraising not started");
        require(_now() <= _rules.endFundraising || _rules.endFundraising == 0, "Fundraising ended");
        require(TokenContract.totalSupply() + amount <= _rules.maxSupply || _rules.maxSupply == 0, "Max supply reached");
        _;
    }

    /// @dev Check if contract immutable is valid
    modifier contractValid() {
        require(address(TokenContract) != address(0), "Token contract is not valid");
        _;
    }

    modifier withdrawVotable() {
        TokenLibrary.Rules memory _rules = TokenContract.getRules();
        require(rules.voteToWithdraw == true, "No vote required to withdraw");
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
    function owner() public view override(Ownable, IProxySecurityToken) returns (address) {
        return OWNER;
    }

    /**
     * @notice Transfer ownership of the smart contract
     * @param account {address} address of the new owner
     */
    function transferOwnership(address account) public virtual override(Ownable, IProxySecurityToken) onlyOwner {
        emit TransferOwnership(OWNER, account);
        OWNER = account;
    }

    /**
     * @notice Return not freezed tokens from an address wallet
     * @param account {address} wallet address of account you want to get not freezed balance
     * @return balance {uint256} balance of wallet address totaly open
     */
    function eligibleBalanceOf(address account) public view contractValid returns(uint256) {
        return TokenContract.balanceOf(account) - frozenTokens[account] - (freezedPeriod[account].amountFreezed);
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
    function mint(address to, uint256 amount) external payable fundraisable(amount) contractValid returns (bool) {
        require(msg.value >= pricePerToken * amount, "Not enough eth");
        TokenContract.mint(to, amount);
        TokenContract.handlePayment{value: msg.value}(_msgSender());
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
        external
        contractValid
        returns (bool)
    {
        uint256 freeBalance = eligibleBalanceOf(account);
        if (amount > freeBalance) {
            uint256 tokensToUnfreeze = amount - (TokenContract.balanceOf(account) - frozenTokens[account]);
            if (amount > TokenContract.balanceOf(account) - frozenTokens[account]) {
                frozenTokens[account] = frozenTokens[account] - (tokensToUnfreeze);
                emit TokensUnfrozen(account, tokensToUnfreeze);
            }
            if (amount - tokensToUnfreeze > TokenContract.balanceOf(account) - (freezedPeriod[account].amountFreezed)) {
                uint256 tokensToUnfreezePeriod =
                amount - tokensToUnfreeze - (TokenContract.balanceOf(account) - freezedPeriod[account].amountFreezed);
                freezedPeriod[account].amountFreezed = freezedPeriod[account].amountFreezed - (tokensToUnfreezePeriod);
                emit TokensUnfrozenPeriod(account, tokensToUnfreeze);
            }
        }

        uint256 _refoundable = refoundable(amount);

        bool success = TokenContract.burn(account, amount, _refoundable);
        require(success, "Failed to send Ether");

        return true;
    }

    /**
     * @notice Return amount of refoundable for amount of tokens burned
     * @param amount {uint256} amout of tokens burn
     * @return wei {uint256} amount of wei refoundable
     */
    function refoundable(uint256 amount) public view contractValid returns(uint256){
        return (address(TokenContract).balance.mul(100).div(TokenContract.totalSupply().mul(100))).mul(amount);
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
    function transfer(address to, uint256 amount) external contractValid returns (bool) {
        require(canTransfer(_msgSender(), _msgSender(), to, amount) == (hex"51"));
        TokenContract.transferFrom(_msgSender(), to, amount);
        return true;
    }

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
    function transferFrom(address from, address to, uint256 amount) external contractValid returns (bool) {
        require(canTransfer(_msgSender(), from, to, amount) == (hex"51"));
        TokenContract.transferFrom(from, to, amount);
        return true;
    }

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
    ) public view contractValid returns (bytes1) {
        if (TokenContract.balanceOf(from) < value) return(hex"52");
        if(_now() < TokenContract.isPaused()) return(hex"54");
        if(TokenContract.balanceOf(from) - frozenTokens[from] - (freezedPeriod[from].amountFreezed) < value) return(hex"55");
        if(from == address(0)) return(hex"56");
        if(to == address(0)) return(hex"57");
        if(!isAgent(operator) && OWNER != operator && from != operator ) return(hex"58");
        if(frozen[from]) return(hex"5a");
        if(frozen[to]) return(hex"5b");
        if(TokenContract.getRules().soulBoundSecurityToken == true) return(hex"5c");
        return (hex"51");
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
    ) external onlyAgent contractValid returns (bool) {
        require(TokenContract.getRules().forcableTransfer == true, "forceTransfer is not authorized on this contract");
        uint256 freeBalance = eligibleBalanceOf(from);

        if (amount > freeBalance) {
            uint256 tokensToUnfreeze = amount - (TokenContract.balanceOf(from) - frozenTokens[from]);
            if (amount > TokenContract.balanceOf(from) - frozenTokens[from]) {
                frozenTokens[from] = frozenTokens[from] - (tokensToUnfreeze);
                emit TokensUnfrozen(from, tokensToUnfreeze);
            }
            if (amount - tokensToUnfreeze > TokenContract.balanceOf(from) - (freezedPeriod[from].amountFreezed)) {
                uint256 tokensToUnfreezePeriod = 
                amount - tokensToUnfreeze - (TokenContract.balanceOf(from) - freezedPeriod[from].amountFreezed);
                freezedPeriod[from].amountFreezed = freezedPeriod[from].amountFreezed - (tokensToUnfreezePeriod);
                emit TokensUnfrozenPeriod(from, tokensToUnfreeze);
            }
        }

        TokenContract.transferFrom(from, to, amount);
        return true;
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
    function setAddressFrozen(address userAddress, bool freeze) public onlyAgent contractValid {
        require(TokenContract.getRules().freezableAddress == true, "Freeze address is not allowed");
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
    function freezePartialTokens(address userAddress, uint256 amount) public onlyAgent contractValid {
        require(TokenContract.getRules().freezablePartial == true, "Freeze partial address is not allowed");
        uint256 balance = TokenContract.balanceOf(userAddress);
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
    function unfreezePartialTokens(address userAddress, uint256 amount) public onlyAgent contractValid {
        require(TokenContract.getRules().freezablePartial == true, "Freeze partial address is not allowed");
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
    ) external onlyAgent contractValid {
        require(TokenContract.getRules().freezablePartialTime == true, "Freeze partial period address is not allowed");
        require(amountFreezed <= TokenContract.balanceOf(userAddress), "Amount is upper than balance of user");
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
     * @notice Withdraw tokens amount of contract balance
     * @param amount {uint256} the number of tokens transferred
     * @param receiver {address} the recipient of the token transfer
     */
    function withdraw(uint256 amount, address receiver) external onlyOwner contractValid {
        withdrawable(amount);
        TokenLibrary.Rules memory _rules = TokenContract.getRules();
        if(_rules.dayToWithdraw != 0)
            lastWithdraw += oneDay.mul(_rules.dayToWithdraw).mul(amount);
        if(_rules.voteToWithdraw == true) amountRequestWithdraw = 0;
        bool success = TokenContract.withdraw(amount, receiver);
        require(success, "Withdraw failed");
    }

    /**
     * @notice Owner request a withdraw with a comment and amount (Request can't be equal to last request and set request restart all votes)
     * @param _messageRequestWithdraw {string} message comment of request to withdraw
     * @param _amountRequestWithdraw {uint256} amount of request to withdraw
     */
    function setRequestWithdraw(string memory _messageRequestWithdraw, uint256 _amountRequestWithdraw) external withdrawVotable onlyOwner {
        require(compare(messageRequestWithdraw, _messageRequestWithdraw) == false, "Request can't be equal to last request");
        messageRequestWithdraw = _messageRequestWithdraw;
        amountRequestWithdraw = _amountRequestWithdraw;
        acceptedRequestWithdraw = 0;
        refusedRequestWithdraw = 0;
    }

    /**
     * @notice Get request to withdraw by owner
     * @return request {string, uint256} (messageRequestWithdraw, amountRequestWithdraw)
     */
    function getRequestWithdraw() external withdrawVotable view returns(string memory , uint256) {
        return (messageRequestWithdraw, amountRequestWithdraw);
    }

    /**
     * @notice Shareholder vote to the request of owner to withdraw
     * @param vote {boolean} accept (true) or reject (false) request of withdraw
     * @param amount {uint256} amount of vote request, need to be lower than balance of shareholder
     */
    function voteToRequestWithdraw(bool vote, uint256 amount) external withdrawVotable contractValid {
        require(TokenContract.balanceOf(_msgSender()) >= amount, "Balance of sender is lower than the amount");
        require(compare(hasVoted[_msgSender()], messageRequestWithdraw) == false, "Sender has already voted to this request");
        hasVoted[_msgSender()] = messageRequestWithdraw;
        if(vote == true) acceptedRequestWithdraw += amount;
        if(vote == false) refusedRequestWithdraw += amount;
    }

    /**
     * @notice Check if amout is withdrawable
     * @param amount {uint256} the number of tokens withdraw
     * @return weiWithdrawable {uint256} the number of wei transferrable
     */
    function withdrawable(uint256 amount) public view contractValid returns(uint256 weiWithdrawable) {
        TokenLibrary.Rules memory _rules = TokenContract.getRules();
        if(_rules.dayToWithdraw != 0)
            weiWithdrawable = ((_now() - lastWithdraw).div(oneDay.mul(_rules.dayToWithdraw)));
        require(_rules.voteToWithdraw == false || (acceptedRequestWithdraw > refusedRequestWithdraw && amount <= amountRequestWithdraw), "No vote accepted");
        require(weiWithdrawable >= amount || _rules.dayToWithdraw == 0, "Not enough funds to withdraw");
        require(lastWithdraw + oneDay.mul(_rules.dayToWithdraw).mul(amount) <= _now() || _rules.dayToWithdraw == 0, "Time incorrect");
    }
}
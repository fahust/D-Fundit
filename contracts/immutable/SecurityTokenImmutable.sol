// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "../library/TokenLibrary.sol";
import "../proxy/ProxySecurityToken.sol";
import "../roles/AgentRole.sol";
import "../roles/ReaderRole.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SecurityTokenImmutable is ERC20, AgentRole, ReaderRole {
    using SafeMath for uint;

    address public addressProxy;
    address internal OWNER;
    uint32 internal _transfersCount;
    mapping(uint256 => TokenLibrary.Transfer) internal _transfers;
    uint256 internal paused;
    string internal constant TOKEN_VERSION = "0.0.1";
    TokenLibrary.Rules internal rules;

    event TransferOwnership(address indexed oldAccount, address indexed newAccount);
    event Paused(address indexed sender, uint256 indexed paused);
    event Transfer(string eventType, address indexed from, address indexed to, uint256 value);

    function _now() public view returns (uint256) {
        return block.timestamp;
    }

    /**
     */
    constructor(
        string memory _name,
        string memory _code,
        TokenLibrary.Rules memory _rules
    ) ERC20(_name, _code) {
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

    modifier onlyProxy() {
        require(_msgSender() == addressProxy, "Pausable: not paused");
        _;
    }

    function setAddressProxy(address _addressProxy) external {
        require(ProxySecurityToken(_addressProxy).owner() == owner(),"Invalid contract & Owner");
        addressProxy = _addressProxy;
    }

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
    ) external onlyOwner {
        rules.startFundraising = startFundraising;
        rules.endFundraising = endFundraising;
        rules.maxSupply = maxSupply;
    }

    function setRules(TokenLibrary.Rules memory _rules) external onlyOwner {
        require(rules.rulesModifiable == true, "Rules is not modifiable");
        rules = _rules;

    }

    function getRules() external view onlyProxy returns(TokenLibrary.Rules memory) {
        return rules;
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
     * @notice Mint and send `amount` tokens to `to`
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     * @param to {address} wallet to send the token
     * @param amount {uint256} amount to mint
     * @return result {boolean} success or failure
     */
    function mint(address to, uint256 amount) external payable onlyProxy returns (bool) {
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
    function burn(address account, uint256 amount, uint256 refoundable)
        external onlyProxy
        returns (bool)
    {
        _burn(account, amount);

        (bool sent, ) = account.call{value: refoundable}("");
        require(sent, "Failed to send Ether");
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

    function transferFrom(address from, address to, uint256 amount) public virtual override onlyProxy returns (bool) {
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
        super._transfer(from, to, amount);
        _afterTokenTransfer("transfer", from, to, amount);
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
     * @notice Withdraw tokens amount of contract balance
     * @param amount {uint256} the number of tokens transferred
     * @param receiver {address} the recipient of the token transfer
     */
    function withdraw(uint256 amount, address receiver) external onlyProxy {
        (bool success, ) = payable(receiver).call{ value: amount}("");
        require(success, "Withdraw not successful");
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

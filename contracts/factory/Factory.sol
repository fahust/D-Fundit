// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


contract Factory {

    mapping(uint256 => address) securityToken;
    uint256 internal countSecurityToken;
    address immutable OWNER;

    constructor() {
        OWNER = msg.sender;
    }

    function addSecurityToken(address _securityToken) external {
        require(OWNER == msg.sender,"Not The Owner");
        securityToken[countSecurityToken] = _securityToken;
        countSecurityToken++;
    }

    function listSecurityTokens(uint256 limit) external view returns(address[] memory){
        uint256 count = limit > countSecurityToken || limit == 0 ? countSecurityToken : limit;
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = securityToken[i];
        }
        return result;
    }

    function getCountSecurityToken() external view returns(uint256){
        return countSecurityToken;
    }
}
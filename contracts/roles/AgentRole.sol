// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./Roles.sol";

contract AgentRole is Ownable {
    using Roles for Roles.Role;

    event AgentAdded(address indexed _agent);
    event AgentRemoved(address indexed _agent);

    error NotAgent(address sender);

    Roles.Role private _agents;

    modifier onlyAgent() {
        if(!isAgent(_msgSender()) && owner() != _msgSender())
            revert NotAgent({ sender: _msgSender()});
        _;
    }

    function isAgent(address _agent) public view returns (bool) {
        return _agents.has(_agent);
    }

    function addAgent(address _agent) public onlyOwner {
        _agents.add(_agent);
        emit AgentAdded(_agent);
    }

    function removeAgent(address _agent) public onlyOwner {
        _agents.remove(_agent);
        emit AgentRemoved(_agent);
    }
}

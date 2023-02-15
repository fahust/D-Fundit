// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./Roles.sol";

contract WriterRole is Ownable {
    using Roles for Roles.Role;

    event WriterAdded(address indexed _writer);
    event WriterRemoved(address indexed _writer);

    error NotWriter(address sender);

    Roles.Role private _writers;

    modifier onlyWriter() {
        if(!isWriter(_msgSender()) && owner() != _msgSender())
            revert NotWriter({ sender: _msgSender()});
        _;
    }

    function isWriter(address _writer) public view returns (bool) {
        return _writers.has(_writer);
    }

    function addWriter(address _writer) public onlyOwner {
        _writers.add(_writer);
        emit WriterAdded(_writer);
    }

    function removeWriter(address _writer) public onlyOwner {
        _writers.remove(_writer);
        emit WriterRemoved(_writer);
    }
}

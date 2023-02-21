// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./Roles.sol";

contract ReaderRole is Ownable {
    using Roles for Roles.Role;

    event ReaderAdded(address indexed _reader);
    event ReaderRemoved(address indexed _reader);
    
    error NotReader(address sender);

    Roles.Role private _readers;

    modifier onlyReader() {
        if(!isReader(_msgSender()) && owner() != _msgSender())
            revert NotReader({ sender: _msgSender()});
        _;
    }

    function isReader(address _reader) public view returns (bool) {
        return _readers.has(_reader);
    }

    function addReader(address _reader) public onlyOwner {
        _readers.add(_reader);
        emit ReaderAdded(_reader);
    }

    function removeReader(address _reader) public onlyOwner {
        _readers.remove(_reader);
        emit ReaderRemoved(_reader);
    }
}

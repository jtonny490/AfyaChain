// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AfyaChain is ERC721, Ownable {
    uint256 private _nextTokenId;

    // Blockchain Audit Trail Events
    event RecordLogged(uint256 indexed tokenId, string dataHash, string storageURI, uint256 timestamp);
    event AccessGranted(uint256 indexed tokenId, address indexed doctor, uint256 timestamp);

    constructor() ERC721("AfyaChain Identity", "AFYA") Ownable(msg.sender) {}

    // Mint a Medical Identity NFT for a Patient
    function mintIdentity(address patient) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(patient, tokenId);
        return tokenId;
    }

    // Log a medical record hash to the blockchain (Immutability)
    function logRecord(uint256 tokenId, string memory dataHash, string memory storageURI) public {
        // In production, verify msg.sender is the patient or an authorized hospital
        emit RecordLogged(tokenId, dataHash, storageURI, block.timestamp);
    }

    // Soulbound implementation: Prevent transferring the medical identity
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "AfyaChain: Medical Identity is Soulbound");
        return super._update(to, tokenId, auth);
    }
}
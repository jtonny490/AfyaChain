// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * AfyaChain.sol
 * 
 * Soulbound NFT identity + medical record logging + consent management.
 * Deployed on Celo Alfajores Testnet.
 * 
 * Soulbound = non-transferable. Each patient gets exactly one token.
 * No medical data is stored on-chain — only hashes and IPFS pointers.
 */
contract AfyaChain {

    // ─────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────

    address public owner;
    uint256 private _tokenIdCounter;

    // patientAddress → tokenId
    mapping(address => uint256) public patientToken;

    // tokenId → patientAddress (reverse lookup)
    mapping(uint256 => address) public tokenOwner;

    // tokenId → list of record hashes
    // Each record: { dataHash, storageURI, timestamp }
    struct MedicalRecord {
        string  dataHash;    // SHA-256 hash of the encrypted file
        string  storageURI;  // IPFS CID or Supabase storage path
        uint256 timestamp;
    }
    mapping(uint256 => MedicalRecord[]) private _records;

    // tokenId => doctorAddress => expiry timestamp
    // expiry = 0 means no access
    mapping(uint256 => mapping(address => uint256)) private _accessGrants;

    // ─────────────────────────────────────────────
    // Events — these are what the Go backend reads
    // ─────────────────────────────────────────────

    event IdentityMinted(address indexed patient, uint256 indexed tokenId);
    event RecordLogged(uint256 indexed tokenId, string dataHash, string storageURI, uint256 timestamp);
    event AccessGranted(uint256 indexed tokenId, address indexed doctor, uint256 expiresAt);
    event AccessRevoked(uint256 indexed tokenId, address indexed doctor);
    event AccessChecked(uint256 indexed tokenId, address indexed accessor, bool granted, uint256 timestamp);

    // ─────────────────────────────────────────────
    // Modifiers
    // ─────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyPatient(uint256 tokenId) {
        require(tokenOwner[tokenId] == msg.sender, "Not the token owner");
        _;
    }

    modifier hasValidAccess(uint256 tokenId) {
        uint256 expiry = _accessGrants[tokenId][msg.sender];
        require(expiry > 0 && block.timestamp <= expiry, "Access not granted or expired");
        _;
    }

    // ─────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        _tokenIdCounter = 1; // start at 1, never 0
    }

    // ─────────────────────────────────────────────
    // Core Functions
    // ─────────────────────────────────────────────

    /**
     * Mint a soulbound identity NFT for a patient.
     * Each address can only hold one token.
     * Called by the backend when a patient registers.
     */
    function mintIdentity(address patient) external onlyOwner returns (uint256) {
        require(patient != address(0), "Invalid address");
        require(patientToken[patient] == 0, "Identity already exists");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        patientToken[patient] = tokenId;
        tokenOwner[tokenId] = patient;

        emit IdentityMinted(patient, tokenId);
        return tokenId;
    }

    /**
     * Log a medical record hash to the blockchain.
     * No actual medical data is stored here — only the hash and storage pointer.
     * Called by the backend after encrypting and uploading the file to IPFS/Supabase.
     */
    function logRecord(
        uint256 tokenId,
        string calldata dataHash,
        string calldata storageURI
    ) external onlyOwner {
        require(tokenOwner[tokenId] != address(0), "Token does not exist");

        _records[tokenId].push(MedicalRecord({
            dataHash:   dataHash,
            storageURI: storageURI,
            timestamp:  block.timestamp
        }));

        emit RecordLogged(tokenId, dataHash, storageURI, block.timestamp);
    }

    /**
     * Grant a doctor time-bound access to a patient's records.
     * Only the patient can call this.
     * durationSeconds: how long access lasts, e.g. 3600 = 1 hour, 86400 = 1 day
     */
    function grantAccess(uint256 tokenId, address doctor, uint256 durationSeconds)
        external
        onlyPatient(tokenId)
    {
        require(doctor != address(0), "Invalid doctor address");
        require(durationSeconds > 0, "Duration must be greater than zero");

        uint256 expiresAt = block.timestamp + durationSeconds;
        _accessGrants[tokenId][doctor] = expiresAt;

        emit AccessGranted(tokenId, doctor, expiresAt);
    }

    /**
     * Revoke a doctor's access immediately.
     * Only the patient can call this.
     */
    function revokeAccess(uint256 tokenId, address doctor)
        external
        onlyPatient(tokenId)
    {
        require(_accessGrants[tokenId][doctor] > 0, "No active grant to revoke");
        _accessGrants[tokenId][doctor] = 0;

        emit AccessRevoked(tokenId, doctor);
    }

    /**
     * Check if a doctor currently has valid access to a patient's records.
     * Returns true only if access was granted and has not expired.
     */
    function hasAccess(uint256 tokenId, address doctor) external returns (bool) {
        uint256 expiry = _accessGrants[tokenId][doctor];
        bool granted = expiry > 0 && block.timestamp <= expiry;

        emit AccessChecked(tokenId, doctor, granted, block.timestamp);
        return granted;
    }

    /**
     * Get all records for a token.
     * Only callable by the contract owner (backend) or a doctor with valid access.
     */
    function getRecords(uint256 tokenId)
        external
        view
        returns (MedicalRecord[] memory)
    {
        require(
            msg.sender == owner ||
            msg.sender == tokenOwner[tokenId] ||
            (_accessGrants[tokenId][msg.sender] > 0 && block.timestamp <= _accessGrants[tokenId][msg.sender]),
            "Access denied"
        );
        return _records[tokenId];
    }

    /**
     * Get total number of records for a patient.
     */
    function getRecordCount(uint256 tokenId) external view returns (uint256) {
        return _records[tokenId].length;
    }

    /**
     * Soulbound enforcement — block all transfers.
     * This makes the NFT non-transferable.
     */
    function transfer(address, uint256) external pure {
        revert("AfyaChain: soulbound tokens cannot be transferred");
    }
}

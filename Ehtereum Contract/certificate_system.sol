// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Blockchain-based Certificate Verification System
 * @dev Implements a secure and immutable certificate issuance and verification system
 */
contract CertificateVerification {
    
    struct Certificate {
        string studentName;
        string issuerName;
        string courseName;
        uint256 issueDate;
        string ipfsHash;
        bool isRevoked;
    }

    // Mapping of certificate ID to Certificate details
    mapping(bytes32 => Certificate) public certificates;
    mapping(bytes32 => address) public certificateOwners;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => string) public issuerMetadata;

    // Event declarations
    event CertificateIssued(bytes32 indexed certificateId, string studentName, string issuerName, string courseName, uint256 issueDate, string ipfsHash);
    event CertificateRevoked(bytes32 indexed certificateId, string reason);
    event IssuerAuthorized(address indexed issuer, string organizationName);
    event IssuerRevoked(address indexed issuer);

    address public admin;

    // Modifier to restrict actions to admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // Modifier to restrict actions to authorized issuers
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Only authorized issuers can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function authorizeIssuer(address issuer, string memory organizationName) public onlyAdmin {
        authorizedIssuers[issuer] = true;
        issuerMetadata[issuer] = organizationName;
        emit IssuerAuthorized(issuer, organizationName);
    }

    function revokeIssuer(address issuer) public onlyAdmin {
        authorizedIssuers[issuer] = false;
        delete issuerMetadata[issuer];
        emit IssuerRevoked(issuer);
    }

    function issueCertificate(
        string memory studentName,
        string memory courseName,
        uint256 issueDate,
        string memory ipfsHash
    ) public onlyAuthorizedIssuer returns (bytes32) {
        string memory issuerName = issuerMetadata[msg.sender];
        require(bytes(issuerName).length > 0, "Invalid issuing organization");
        
        // Generate unique certificate ID
        bytes32 certificateId = keccak256(abi.encodePacked(studentName, issuerName, courseName, issueDate, ipfsHash));

        require(certificates[certificateId].issueDate == 0, "Certificate already exists");

        certificates[certificateId] = Certificate({
            studentName: studentName,
            issuerName: issuerName,
            courseName: courseName,
            issueDate: issueDate,
            ipfsHash: ipfsHash,
            isRevoked: false
        });
        certificateOwners[certificateId] = msg.sender;

        emit CertificateIssued(certificateId, studentName, issuerName, courseName, issueDate, ipfsHash);
        return certificateId;
    }

    /**
     * @dev Batch issue 100 certificates with the same credentials
     * @param studentName Name of the certificate holder
     * @param courseName Name of the course
     * @param issueDate Timestamp of issuance
     * @param ipfsHash IPFS hash of the certificate file
     */
    function batchIssueCertificates(
        string memory studentName,
        string memory courseName,
        uint256 issueDate,
        string memory ipfsHash
    ) public onlyAuthorizedIssuer {
        string memory issuerName = issuerMetadata[msg.sender];
        require(bytes(issuerName).length > 0, "Invalid issuing organization");

        for (uint256 i = 0; i < 100; i++) {
            bytes32 certificateId = keccak256(abi.encodePacked(studentName, issuerName, courseName, issueDate, ipfsHash, i));

            require(certificates[certificateId].issueDate == 0, "Certificate already exists");

            certificates[certificateId] = Certificate({
                studentName: studentName,
                issuerName: issuerName,
                courseName: courseName,
                issueDate: issueDate,
                ipfsHash: ipfsHash,
                isRevoked: false
            });
            certificateOwners[certificateId] = msg.sender;

            emit CertificateIssued(certificateId, studentName, issuerName, courseName, issueDate, ipfsHash);
        }
    }

    function revokeCertificate(bytes32 certificateId, string memory reason) public onlyAuthorizedIssuer {
        require(certificates[certificateId].issueDate != 0, "Certificate does not exist");
        require(!certificates[certificateId].isRevoked, "Certificate is already revoked");

        certificates[certificateId].isRevoked = true;

        emit CertificateRevoked(certificateId, reason);
    }

    function verifyCertificate(bytes32 certificateId) public view returns (bool isValid, string memory ipfsHash, string memory issuer) {
        Certificate memory cert = certificates[certificateId];
        return (cert.issueDate != 0 && !cert.isRevoked, cert.ipfsHash, cert.issuerName);
    }
}

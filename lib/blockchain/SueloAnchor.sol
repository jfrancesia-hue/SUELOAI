// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SueloAnchor
 * @dev Smart contract minimalista para anclar hashes SHA-256 de contratos
 *      inmobiliarios de Suelo en blockchain pública.
 *
 * CARACTERÍSTICAS:
 * - NO es un security token
 * - NO representa participación en activos
 * - Solo guarda hashes verificables con timestamp
 * - Cualquiera puede verificar on-chain
 * - Bajo costo (~$0.001-0.01 por anchor en Polygon)
 *
 * DEPLOY RECOMENDADO: Polygon Mainnet
 *
 * USO:
 * 1. Suelo backend llama a anchor(hash, investmentId, metadata)
 * 2. Se emite evento HashAnchored
 * 3. Frontend puede verificar con verify(hash) o via events
 */

contract SueloAnchor {
    // ============================================
    // EVENTS
    // ============================================
    event HashAnchored(
        bytes32 indexed hash,
        bytes32 indexed referenceId,
        address indexed anchoredBy,
        uint256 timestamp,
        string metadata
    );

    event AnchorRevoked(bytes32 indexed hash, address indexed revokedBy, uint256 timestamp);

    // ============================================
    // STATE
    // ============================================
    struct AnchorRecord {
        uint256 timestamp;
        address anchoredBy;
        bytes32 referenceId;
        string metadata;
        bool revoked;
    }

    mapping(bytes32 => AnchorRecord) public anchors;
    mapping(address => bool) public authorizedAnchors;
    address public owner;
    uint256 public totalAnchors;

    // ============================================
    // MODIFIERS
    // ============================================
    modifier onlyAuthorized() {
        require(authorizedAnchors[msg.sender] || msg.sender == owner, "No autorizado");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner");
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================
    constructor() {
        owner = msg.sender;
        authorizedAnchors[msg.sender] = true;
    }

    // ============================================
    // CORE FUNCTIONS
    // ============================================

    /**
     * @dev Ancla un hash en blockchain.
     * @param hash Hash SHA-256 del contrato/documento
     * @param referenceId ID de referencia (ej: investment_id como bytes32)
     * @param metadata String con info adicional (project title, amount)
     */
    function anchor(
        bytes32 hash,
        bytes32 referenceId,
        string calldata metadata
    ) external onlyAuthorized returns (bool) {
        require(hash != bytes32(0), "Hash invalido");
        require(anchors[hash].timestamp == 0, "Hash ya anclado");

        anchors[hash] = AnchorRecord({
            timestamp: block.timestamp,
            anchoredBy: msg.sender,
            referenceId: referenceId,
            metadata: metadata,
            revoked: false
        });

        totalAnchors++;
        emit HashAnchored(hash, referenceId, msg.sender, block.timestamp, metadata);
        return true;
    }

    /**
     * @dev Ancla múltiples hashes en una sola transacción (gas-efficient)
     */
    function batchAnchor(
        bytes32[] calldata hashes,
        bytes32[] calldata referenceIds,
        string[] calldata metadataArr
    ) external onlyAuthorized {
        require(hashes.length == referenceIds.length, "Length mismatch");
        require(hashes.length == metadataArr.length, "Length mismatch");

        for (uint i = 0; i < hashes.length; i++) {
            if (anchors[hashes[i]].timestamp == 0) {
                anchors[hashes[i]] = AnchorRecord({
                    timestamp: block.timestamp,
                    anchoredBy: msg.sender,
                    referenceId: referenceIds[i],
                    metadata: metadataArr[i],
                    revoked: false
                });
                totalAnchors++;
                emit HashAnchored(hashes[i], referenceIds[i], msg.sender, block.timestamp, metadataArr[i]);
            }
        }
    }

    /**
     * @dev Revocar un anchor (para casos de error)
     */
    function revoke(bytes32 hash) external onlyAuthorized {
        require(anchors[hash].timestamp > 0, "No existe");
        require(!anchors[hash].revoked, "Ya revocado");
        anchors[hash].revoked = true;
        emit AnchorRevoked(hash, msg.sender, block.timestamp);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @dev Verificar si un hash existe y no fue revocado
     */
    function verify(bytes32 hash) external view returns (
        bool exists,
        bool valid,
        uint256 timestamp,
        address anchoredBy,
        string memory metadata
    ) {
        AnchorRecord memory rec = anchors[hash];
        exists = rec.timestamp > 0;
        valid = exists && !rec.revoked;
        timestamp = rec.timestamp;
        anchoredBy = rec.anchoredBy;
        metadata = rec.metadata;
    }

    /**
     * @dev Verificación simple (boolean)
     */
    function isAnchored(bytes32 hash) external view returns (bool) {
        return anchors[hash].timestamp > 0 && !anchors[hash].revoked;
    }

    // ============================================
    // ADMIN
    // ============================================
    function addAuthorized(address addr) external onlyOwner {
        authorizedAnchors[addr] = true;
    }

    function removeAuthorized(address addr) external onlyOwner {
        authorizedAnchors[addr] = false;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}

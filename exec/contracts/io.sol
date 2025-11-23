// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract io {

    struct ObfuscatedCircuit {
        uint8[32] pointer;     // Pointer/index field
        bytes32 pubkey;         // 32-byte public key
        uint256 timestamp;      // Optional: timestamp for when data was created
        address owner;          // Optional: owner of this data
    }

    struct Ciphertext {
        uint8[32] pointer;     // Pointer field
        bytes data;             // Encrypted data
        bytes program;          // Program field
    }

    event initial_mint_event (address user, Ciphertext ciphertext);
    event send(address sender, Ciphertext ciphertext);
    event recieve(address recipient, Ciphertext ciphertext);
    event eval_event(uint256 circuitId, uint8[32] circuitPointer, Ciphertext ciphertext, bytes result);

    mapping(address => Ciphertext) public balances;
    mapping(uint256 => uint256) public obfuscatedCircuits;
    mapping(uint256 => ObfuscatedCircuit) public obfuscatedCircuitStore;  // Store obfuscated circuits by ID
    uint256 public totalSupply;
    uint256 public obfuscatedCircuitCounter;  // Counter for obfuscated circuit IDs 


    function intial_mint(Ciphertext calldata ciphertext) public {
        balances[msg.sender] = ciphertext;
        emit initial_mint_event(msg.sender, ciphertext);
    }

    function get_balance(address user) public view returns (Ciphertext memory) {
        return balances[user];
    }

    function transfer(address recipient, Ciphertext calldata ciphertext) public {
        emit send(msg.sender, ciphertext);
        emit recieve(recipient, ciphertext);
    }

    // Functions to work with obfuscated circuits
    function createObfuscatedCircuit(
        uint8[32] calldata _pointer,
        bytes32 _pubkey
    ) public returns (uint256) {
        uint256 id = obfuscatedCircuitCounter++;
        obfuscatedCircuitStore[id] = ObfuscatedCircuit({
            pointer: _pointer,
            pubkey: _pubkey,
            timestamp: block.timestamp,
            owner: msg.sender
        });
        return id;
    }

    function getObfuscatedCircuit(uint256 _id) public view returns (ObfuscatedCircuit memory) {
        return obfuscatedCircuitStore[_id];
    }

    function eval(uint256 circuitId, Ciphertext memory ciphertext) public returns (bytes memory) {
        // Evaluation function for ciphertext
        // Look up the circuit and emit its pointer
        ObfuscatedCircuit memory circuit = obfuscatedCircuitStore[circuitId];
        bytes memory result = ciphertext.data;
        emit eval_event(circuitId, circuit.pointer, ciphertext, result);
        return result;
    }

}


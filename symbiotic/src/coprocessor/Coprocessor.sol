// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface ICoprocessor {
    event EncryptedExecution(bytes32 indexed taskId, address indexed caller, bytes encryptedData, bytes result, uint256 timestamp);
    event LeaderElected(bytes32 indexed roundId, address indexed leader, uint256 timestamp);
    event AttestationSubmitted(bytes32 indexed taskId, address indexed validator, bytes attestation, uint256 timestamp);
    
    function processEncryptedRequest(bytes memory encryptedData) external returns (bytes32 taskId);
    function submitAttestation(bytes32 taskId, bytes memory attestation) external;
    function electLeader() external returns (address);
    function getLeader(uint256 roundId) external view returns (address);
    function getResult(bytes32 taskId) external view returns (bytes memory);
    function getAttestation(bytes32 taskId, address validator) external view returns (bytes memory);
}

contract Coprocessor is ICoprocessor {
    mapping(address => bool) public validators;
    mapping(uint256 => address) public leaders;
    mapping(bytes32 => bytes) public results;
    mapping(bytes32 => mapping(address => bytes)) public attestations;
    mapping(bytes32 => address) public taskCreators;
    mapping(address => uint256) public validatorWeights;
    
    uint256 public currentRound;
    uint256 public constant ROUND_DURATION = 100; // blocks
    string public constant EXTERNAL_ENDPOINT = "http://34.46.119.33:3000/run/dummy";
    
    bytes32[] public activeTasks;
    uint256 public totalValidators;
    
    modifier onlyValidator() {
        require(validators[msg.sender], "Coprocessor: caller is not validator");
        _;
    }
    
    modifier onlyLeader() {
        require(msg.sender == leaders[currentRound], "Coprocessor: caller is not current leader");
        _;
    }
    
    constructor() {
        validators[msg.sender] = true;
        validatorWeights[msg.sender] = 1;
        totalValidators = 1;
        electLeader();
    }
    
    function setValidator(address validator, bool status) external {
        require(msg.sender == address(this) || totalValidators == 0, "Only owner can set validators");
        
        if (status && !validators[validator]) {
            validators[validator] = true;
            validatorWeights[validator] = 1;
            totalValidators++;
        } else if (!status && validators[validator]) {
            validators[validator] = false;
            validatorWeights[validator] = 0;
            totalValidators--;
        }
    }
    
    function electLeader() public returns (address) {
        if (totalValidators == 0) return address(0);
        
        uint256 newRound = block.number / ROUND_DURATION;
        if (newRound > currentRound) {
            uint256 seed = uint256(blockhash(newRound * ROUND_DURATION));
            uint256 selector = seed % totalValidators;
            
            address[] memory validatorList = new address[](100); // Simplified for demo
            uint256 count = 0;
            
            // Simplified validator selection
            if (validators[msg.sender] || validators[address(this)]) {
                leaders[newRound] = msg.sender;
            } else {
                leaders[newRound] = address(uint160(seed));
            }
            
            currentRound = newRound;
            
            emit LeaderElected(bytes32(currentRound), leaders[currentRound], block.timestamp);
        }
        
        return leaders[currentRound];
    }
    
    function getLeader(uint256 roundId) public view returns (address) {
        return leaders[roundId];
    }
    
    function processEncryptedRequest(bytes memory encryptedData) public returns (bytes32 taskId) {
        taskId = keccak256(abi.encodePacked(msg.sender, block.timestamp, encryptedData, currentRound));
        taskCreators[taskId] = msg.sender;
        activeTasks.push(taskId);
        
        // Emit event for off-chain leader to process
        emit EncryptedExecution(taskId, msg.sender, encryptedData, "", block.timestamp);
        
        return taskId;
    }
    
    function storeResult(bytes32 taskId, bytes memory result) external onlyLeader {
        results[taskId] = result;
        emit EncryptedExecution(taskId, taskCreators[taskId], "", result, block.timestamp);
    }
    
    function submitAttestation(bytes32 taskId, bytes memory attestation) external onlyValidator {
        attestations[taskId][msg.sender] = attestation;
        emit AttestationSubmitted(taskId, msg.sender, attestation, block.timestamp);
    }
    
    function getResult(bytes32 taskId) external view returns (bytes memory) {
        return results[taskId];
    }
    
    function getAttestation(bytes32 taskId, address validator) external view returns (bytes memory) {
        return attestations[taskId][validator];
    }
    
    function getAttestationCount(bytes32 taskId) external view returns (uint256) {
        return validators[msg.sender] ? 1 : 0; // Simplified for demo
    }
    
    function getTaskCreator(bytes32 taskId) external view returns (address) {
        return taskCreators[taskId];
    }
    
    function getExternalEndpoint() external pure returns (string memory) {
        return EXTERNAL_ENDPOINT;
    }
}

contract CoprocessorEmitter {
    ICoprocessor public coprocessor;
    
    event ProtectedExecution(bytes32 indexed taskId, address indexed developer, bytes encryptedLogic, bytes result);
    
    constructor(address _coprocessor) {
        coprocessor = ICoprocessor(_coprocessor);
    }
    
    function executeEncrypted(bytes memory encryptedProgramLogic) external returns (bytes32 taskId) {
        taskId = coprocessor.processEncryptedRequest(encryptedProgramLogic);
        emit ProtectedExecution(taskId, msg.sender, encryptedProgramLogic, "");
    }
    
    function emitResult(bytes32 taskId, bytes memory result) external {
        emit ProtectedExecution(taskId, address(0), "", result);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

// Minimal SumTask that compiles with existing structure
contract SumTask {
    uint32 public constant TASK_EXPIRY = 1000;
    
    struct Task {
        uint256 numberA;
        uint256 numberB;
        uint256 nonce;
        uint48 createdAt;
    }
    
    struct Response {
        uint48 answeredAt;
        uint256 answer;
    }
    
    mapping(bytes32 => Task) public tasks;
    mapping(bytes32 => Response) public responses;
    
    uint256 public nonce;
    address public settlement;
    
    enum TaskStatus {
        NotFound,
        Active,
        Completed,
        Expired
    }
    
    event CreateTask(bytes32 indexed taskId, Task task);
    event RespondTask(bytes32 indexed taskId, Response response);
    
    error AlreadyResponded();
    error InvalidQuorumSignature();
    error InvalidVerifyingEpoch();
    
    constructor(address _settlement) {
        settlement = _settlement;
    }
    
    function createTask(uint256 numberA, uint256 numberB) public returns (bytes32 taskId) {
        taskId = keccak256(abi.encodePacked(msg.sender, block.timestamp, nonce, numberA, numberB));
        
        unchecked {
            tasks[taskId] = Task(numberA, numberB, nonce++, uint48(block.timestamp));
        }
        
        emit CreateTask(taskId, tasks[taskId]);
    }
    
    function respondTask(bytes32 taskId, uint256 result, uint48 epoch, bytes memory) public {
        if (responses[taskId].answeredAt != 0) {
            revert AlreadyResponded();
        }
        
        Task memory task = tasks[taskId];
        if (task.createdAt + TASK_EXPIRY < block.timestamp) {
            revert InvalidVerifyingEpoch();
        }
        
        uint256 computedResult = task.numberA + task.numberB;
        require(result == computedResult, "Invalid result");
        
        responses[taskId] = Response(uint48(block.timestamp), result);
        emit RespondTask(taskId, responses[taskId]);
    }
    
    function getTaskStatus(bytes32 taskId) public view returns (TaskStatus) {
        Task memory task = tasks[taskId];
        Response memory response = responses[taskId];
        
        if (task.createdAt == 0) {
            return TaskStatus.NotFound;
        }
        
        if (response.answeredAt != 0) {
            return TaskStatus.Completed;
        }
        
        if (task.createdAt + TASK_EXPIRY < block.timestamp) {
            return TaskStatus.Expired;
        }
        
        return TaskStatus.Active;
    }
    
    function input(bytes memory) public pure returns (bytes4 selector, bytes memory data) {
        selector = this.input.selector;
        data = "";
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@symbioticfi/relay-contracts/src/modules/tasks/Tasks.sol";
import "@symbioticfi/relay-contracts/src/modules/getter/IGetter.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract SumTask is Tasks {
    uint32 public immutable TASK_EXPIRY = 1000;

    address private immutable ENTRYPOINT;

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

    event CreateTask(bytes32 indexed taskId, Task task);
    event RespondTask(bytes32 indexed taskId, Response response);

    error AlreadyResponded();
    error InvalidQuorumSignature();
    error InvalidVerifyingEpoch();

    constructor(address _settlement) Tasks(_settlement) {
        ENTRYPOINT = address(new ExposedReturns256());
    }

    function createTask(uint256 numberA, uint256 numberB) public returns (bytes32 taskId) {
        taskId = _createTask(abi.encode(ENTRYPOINT, abi.encodeCall(ExposedReturns256.input, ())));

        unchecked {
            tasks[taskId] = Task(numberA, numberB, nonce++, uint48(block.timestamp));
        }

        emit CreateTask(taskId, tasks[taskId]);
    }

    function respondTask(bytes32 taskId, uint256 _result, uint48 epoch, bytes memory /* proof */ ) public {
        if (responses[taskId].answeredAt != 0) {
            revert AlreadyResponded();
        }

        Task memory task = tasks[taskId];

        if (task.createdAt + TASK_EXPIRY < block.timestamp) {
            revert InvalidVerifyingEpoch();
        }

        uint256 result = task.numberA + task.numberB;

        if (result != _result) {
            revert InvalidQuorumSignature();
        }

        responses[taskId] = Response(uint48(block.timestamp), result);

        _respondTask(taskId, epoch);

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
}
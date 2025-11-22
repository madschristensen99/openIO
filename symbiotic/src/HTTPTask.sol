// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ISettlement} from "@symbioticfi/relay-contracts/src/interfaces/modules/settlement/ISettlement.sol";

contract HTTPTask {
    error AlreadyResponded();
    error InvalidQuorumSignature();
    error InvalidVerifyingEpoch();

    enum TaskStatus {
        CREATED,
        RESPONDED,
        EXPIRED,
        NOT_FOUND
    }

    struct Task {
        string url;
        string method;
        string requestData;
        uint256 nonce;
        uint48 createdAt;
        bool expectJsonResponse;
    }

    struct Response {
        uint48 answeredAt;
        string responseData;
        uint256 responseCode;
        bool success;
    }

    event CreateTask(bytes32 indexed taskId, Task task);

    event RespondTask(bytes32 indexed taskId, Response response);

    uint32 public constant TASK_EXPIRY = 12_000;

    ISettlement public settlement;

    uint256 public nonce;

    mapping(bytes32 => Task) public tasks;

    mapping(bytes32 => Response) public responses;

    constructor(address _settlement) {
        settlement = ISettlement(_settlement);
    }

    function getTaskStatus(bytes32 taskId) public view returns (TaskStatus) {
        if (responses[taskId].answeredAt > 0) {
            return TaskStatus.RESPONDED;
        }

        if (tasks[taskId].createdAt == 0) {
            return TaskStatus.NOT_FOUND;
        }

        if (block.timestamp > tasks[taskId].createdAt + TASK_EXPIRY) {
            return TaskStatus.EXPIRED;
        }

        return TaskStatus.CREATED;
    }

    function createTask(
        string calldata url,
        string calldata method,
        string calldata requestData,
        bool expectJsonResponse
    ) public returns (bytes32 taskId) {
        uint256 nonce_ = nonce++;
        Task memory task = Task({
            url: url,
            method: method,
            requestData: requestData,
            nonce: nonce_,
            createdAt: uint48(block.timestamp),
            expectJsonResponse: expectJsonResponse
        });
        taskId = keccak256(
            abi.encode(block.chainid, url, method, requestData, nonce_)
        );
        tasks[taskId] = task;

        emit CreateTask(taskId, task);
    }

    function respondTask(
        bytes32 taskId,
        string calldata responseData,
        uint256 responseCode,
        bool success,
        uint48 epoch,
        bytes calldata proof
    ) public {
        // check if the task is not responded yet
        if (responses[taskId].answeredAt > 0) {
            revert AlreadyResponded();
        }

        // verify that the verifying epoch is not stale
        uint48 nextEpochCaptureTimestamp = settlement.getCaptureTimestampFromValSetHeaderAt(epoch + 1);
        if (nextEpochCaptureTimestamp > 0 && block.timestamp >= nextEpochCaptureTimestamp + TASK_EXPIRY) {
            revert InvalidVerifyingEpoch();
        }

        // verify the quorum signature
        bytes memory encodedResult = abi.encode(taskId, responseData, responseCode, success);
        bytes32 resultHash = keccak256(encodedResult);
        if (!settlement.verifyQuorumSigAt(
                abi.encode(resultHash),
                settlement.getRequiredKeyTagFromValSetHeaderAt(epoch),
                settlement.getQuorumThresholdFromValSetHeaderAt(epoch),
                proof,
                epoch,
                new bytes(0)
            )) {
            revert InvalidQuorumSignature();
        }

        Response memory response = Response({
            answeredAt: uint48(block.timestamp),
            responseData: responseData,
            responseCode: responseCode,
            success: success
        });
        responses[taskId] = response;

        emit RespondTask(taskId, response);
    }

    // Utility function to create simple GET tasks
    function createGETTask(
        string calldata url
    ) external returns (bytes32 taskId) {
        return createTask(url, "GET", "", true);
    }

    // Utility function to create POST tasks
    function createPOSTTask(
        string calldata url,
        string calldata jsonData
    ) external returns (bytes32 taskId) {
        return createTask(url, "POST", jsonData, true);
    }
}

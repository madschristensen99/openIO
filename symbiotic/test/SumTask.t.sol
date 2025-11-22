// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {HTTPTask} from "../src/SumTask.sol";
import {SettlementMock} from "./mock/SettlementMock.sol";

contract HTTPTaskTest is Test {
    HTTPTask public httpTask;

    function setUp() public {
        httpTask = new HTTPTask(address(new SettlementMock()));
    }

    function test_CreateGETTask() public {
        bytes32 taskId = httpTask.createGETTask("https://httpbin.org/json");
        assertEq(httpTask.nonce(), 1);
        
        (string memory url, string memory method, string memory requestData, uint256 nonce, uint48 createdAt, bool expectJson) = httpTask.tasks(taskId);
        assertEq(url, "https://httpbin.org/json");
        assertEq(method, "GET");
        assertEq(requestData, "");
        assertEq(expectJson, true);
    }

    function test_CreatePOSTTask() public {
        bytes32 taskId = httpTask.createPOSTTask("https://httpbin.org/post", '{"test":"data"}');
        assertEq(httpTask.nonce(), 1);
        
        (string memory url, string memory method, string memory requestData, uint256 nonce, uint48 createdAt, bool expectJson) = httpTask.tasks(taskId);
        assertEq(url, "https://httpbin.org/post");
        assertEq(method, "POST");
        assertEq(requestData, '{"test":"data"}');
        assertEq(expectJson, true);
    }

    function test_CreateTask() public {
        bytes32 taskId = httpTask.createTask("https://httpbin.org/get", "GET", "", true);
        assertEq(httpTask.nonce(), 1);
    }

    function test_RespondToTask() public {
        bytes32 taskId = httpTask.createGETTask("https://httpbin.org/json");
        httpTask.respondTask(taskId, "{\"response\":\"success\"}", 200, true, 1, new bytes(0));
        
        (uint48 answeredAt, string memory responseData, uint256 responseCode, bool success) = httpTask.responses(taskId);
        assertTrue(success);
        assertEq(responseCode, 200);
        assertEq(responseData, '{"response":"success"}');
        assertEq(answeredAt, uint48(block.timestamp));
    }
}

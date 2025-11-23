// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract ExposedReturns256 {
    function input(bytes memory) public pure returns (bytes4 selector, bytes memory data) {
        selector = this.input.selector;
        data = "";
    }
	
	function process(bytes memory) public pure returns (uint256) {
		return 42;
	}
}
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress, parseEther } from "viem";

import { network } from "hardhat";

describe("io", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer, user1, user2] = await viem.getWalletClients();

  // Helper function to create a uint8[32] array
  function createUint8Array(value: bigint): bigint[] {
    const arr = new Array(32).fill(0n);
    // Convert bigint to bytes and fill array (simple implementation)
    let val = value;
    for (let i = 0; i < 32 && val > 0n; i++) {
      arr[i] = val % 256n;
      val = val / 256n;
    }
    return arr;
  }

  it("Should deploy the io contract", async function () {
    const io = await viem.deployContract("io");
    assert.ok(io.address);
  });

  it("Should emit initial_mint_event when calling intial_mint", async function () {
    const io = await viem.deployContract("io");
    const amount = createUint8Array(1000n);

    await viem.assertions.emitWithArgs(
      io.write.intial_mint([amount]),
      io,
      "initial_mint_event",
      [deployer.account.address, amount],
    );
  });

  it("Should set balance correctly after minting", async function () {
    const io = await viem.deployContract("io");
    const amount = createUint8Array(1000n);

    await io.write.intial_mint([amount]);
    const balance = await io.read.get_balance([deployer.account.address]);
    
    assert.deepEqual(balance, amount);
  });

  it("Should emit send and recieve events on transfer", async function () {
    const io = await viem.deployContract("io");
    const amount = createUint8Array(500n);

    await io.write.intial_mint([amount]);

    const deploymentBlockNumber = await publicClient.getBlockNumber();

    await io.write.transfer([user1.account.address, amount]);

    const sendEvents = await publicClient.getContractEvents({
      address: io.address,
      abi: io.abi,
      eventName: "send",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });

    const recieveEvents = await publicClient.getContractEvents({
      address: io.address,
      abi: io.abi,
      eventName: "recieve",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });

    assert.equal(sendEvents.length, 1);
    assert.equal(recieveEvents.length, 1);
    assert.equal(sendEvents[0].args.sender, deployer.account.address);
    assert.equal(recieveEvents[0].args.recipient, user1.account.address);
  });

  it("Should create an obfuscated circuit and return an ID", async function () {
    const io = await viem.deployContract("io");
    const pointer = 123n;
    const pubkey = "0x" + "1".repeat(64); // 32 bytes

    const id = await io.write.createObfuscatedCircuit([pointer, pubkey]);

    assert.equal(id, 0n);
  });

  it("Should retrieve obfuscated circuit data correctly", async function () {
    const io = await viem.deployContract("io");
    const pointer = 456n;
    const pubkey = "0x" + "2".repeat(64); // 32 bytes

    const id = await io.write.createObfuscatedCircuit([pointer, pubkey]);
    const circuit = await io.read.getObfuscatedCircuit([id]);

    assert.equal(circuit.pointer, pointer);
    assert.equal(circuit.pubkey, pubkey);
    assert.equal(circuit.owner, deployer.account.address);
    assert.ok(circuit.timestamp > 0n);
  });

  it("Should increment obfuscatedCircuitCounter for each new circuit", async function () {
    const io = await viem.deployContract("io");
    const pubkey = "0x" + "3".repeat(64);

    const id1 = await io.write.createObfuscatedCircuit([1n, pubkey]);
    const id2 = await io.write.createObfuscatedCircuit([2n, pubkey]);
    const id3 = await io.write.createObfuscatedCircuit([3n, pubkey]);

    assert.equal(id1, 0n);
    assert.equal(id2, 1n);
    assert.equal(id3, 2n);
  });

  it("Should evaluate ciphertext and return data", async function () {
    const io = await viem.deployContract("io");
    const ciphertextData = "0x" + "deadbeef".repeat(8); // 32 bytes of test data

    const result = await io.read.eval([{ data: ciphertextData }]);

    assert.equal(result, ciphertextData);
  });

  it("Should handle multiple users creating circuits", async function () {
    const io = await viem.deployContract("io");
    const pubkey1 = "0x" + "a".repeat(64);
    const pubkey2 = "0x" + "b".repeat(64);

    const id1 = await io.write.createObfuscatedCircuit([100n, pubkey1], {
      account: deployer.account,
    });

    const id2 = await io.write.createObfuscatedCircuit([200n, pubkey2], {
      account: user1.account,
    });

    const circuit1 = await io.read.getObfuscatedCircuit([id1]);
    const circuit2 = await io.read.getObfuscatedCircuit([id2]);

    assert.equal(circuit1.owner, deployer.account.address);
    assert.equal(circuit2.owner, user1.account.address);
    assert.equal(circuit1.pointer, 100n);
    assert.equal(circuit2.pointer, 200n);
  });

  it("Should initialize obfuscatedCircuitCounter to zero", async function () {
    const io = await viem.deployContract("io");
    const counter = await io.read.obfuscatedCircuitCounter();
    assert.equal(counter, 0n);
  });
});


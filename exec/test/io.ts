import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress, parseEther } from "viem";

import { network } from "hardhat";

describe("io", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer, user1, user2] = await viem.getWalletClients();

  // Helper function to create a uint8[32] array as a tuple
  function createUint8Array(value: bigint): readonly [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] {
    const arr: number[] = new Array(32).fill(0);
    // Convert bigint to bytes and fill array (simple implementation)
    let val = value;
    for (let i = 0; i < 32 && val > 0n; i++) {
      arr[i] = Number(val % 256n);
      val = val / 256n;
    }
    return arr as unknown as readonly [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
  }

  // Helper function to create a Ciphertext object
  function createCiphertext(pointerValue: bigint, dataHex?: `0x${string}`, programHex?: `0x${string}`) {
    return {
      pointer: createUint8Array(pointerValue),
      data: (dataHex || `0x${"00".repeat(32)}`) as `0x${string}`,
      program: (programHex || `0x${"00".repeat(32)}`) as `0x${string}`,
    };
  }

  it("Should deploy the io contract", async function () {
    const io = await viem.deployContract("io");
    assert.ok(io.address);
  });

  it("Should emit initial_mint_event when calling intial_mint", async function () {
    const io = await viem.deployContract("io");
    const ciphertext = createCiphertext(1000n);

    await viem.assertions.emitWithArgs(
      io.write.intial_mint([ciphertext]),
      io,
      "initial_mint_event",
      [deployer.account.address, ciphertext],
    );
  });

  it("Should set balance correctly after minting", async function () {
    const io = await viem.deployContract("io");
    const ciphertext = createCiphertext(1000n, `0x${"deadbeef".repeat(8)}` as `0x${string}`, `0x${"cafebabe".repeat(8)}` as `0x${string}`);

    await io.write.intial_mint([ciphertext]);
    const balance = await io.read.get_balance([deployer.account.address]);
    
    assert.deepEqual(balance.pointer, ciphertext.pointer);
    assert.equal(balance.data, ciphertext.data);
    assert.equal(balance.program, ciphertext.program);
  });

  it("Should emit send and recieve events on transfer", async function () {
    const io = await viem.deployContract("io");
    const ciphertext = createCiphertext(500n);

    await io.write.intial_mint([ciphertext]);

    const deploymentBlockNumber = await publicClient.getBlockNumber();

    await io.write.transfer([user1.account.address, ciphertext]);

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
    const pointer = createUint8Array(123n);
    const pubkey = `0x${"1".repeat(64)}` as `0x${string}`; // 32 bytes

    const id = await io.write.createObfuscatedCircuit([pointer, pubkey]);

    assert.equal(id, 0n);
  });

  it("Should retrieve obfuscated circuit data correctly", async function () {
    const io = await viem.deployContract("io");
    const pointer = createUint8Array(456n);
    const pubkey = `0x${"2".repeat(64)}` as `0x${string}`; // 32 bytes

    const id = await io.write.createObfuscatedCircuit([pointer, pubkey]);
    const circuit = await (io.read.getObfuscatedCircuit as any)([id]);

    assert.deepEqual(circuit.pointer, pointer);
    assert.equal(circuit.pubkey, pubkey);
    assert.equal(circuit.owner, deployer.account.address);
    assert.ok(BigInt(circuit.timestamp) > 0n);
  });

  it("Should increment obfuscatedCircuitCounter for each new circuit", async function () {
    const io = await viem.deployContract("io");
    const pubkey = `0x${"3".repeat(64)}` as `0x${string}`;

    const id1 = await io.write.createObfuscatedCircuit([createUint8Array(1n), pubkey]);
    const id2 = await io.write.createObfuscatedCircuit([createUint8Array(2n), pubkey]);
    const id3 = await io.write.createObfuscatedCircuit([createUint8Array(3n), pubkey]);

    assert.equal(id1, 0n);
    assert.equal(id2, 1n);
    assert.equal(id3, 2n);
  });

  it("Should evaluate ciphertext and return data", async function () {
    const io = await viem.deployContract("io");
    const ciphertextData = `0x${"deadbeef".repeat(8)}` as `0x${string}`; // 32 bytes of test data
    const program = `0x${"cafebabe".repeat(8)}` as `0x${string}`; // 32 bytes of test program
    const ciphertext = createCiphertext(100n, ciphertextData, program);

    // Create a circuit first
    const circuitPointer = createUint8Array(999n);
    const pubkey = `0x${"5".repeat(64)}` as `0x${string}`;
    const circuitId = await io.write.createObfuscatedCircuit([circuitPointer, pubkey]);

    const deploymentBlockNumber = await publicClient.getBlockNumber();

    const result = await (io.write.eval as any)(circuitId, ciphertext);

    assert.equal(result, ciphertextData);

    const evalEvents = await publicClient.getContractEvents({
      address: io.address,
      abi: io.abi,
      eventName: "eval_event",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });

    assert.equal(evalEvents.length, 1);
    const eventArgs = evalEvents[0].args as any;
    assert.equal(eventArgs.circuitId, circuitId);
    assert.deepEqual(eventArgs.circuitPointer, circuitPointer);
    assert.equal(eventArgs.result, ciphertextData);
  });

  it("Should handle multiple users creating circuits", async function () {
    const io = await viem.deployContract("io");
    const pubkey1 = `0x${"a".repeat(64)}` as `0x${string}`;
    const pubkey2 = `0x${"b".repeat(64)}` as `0x${string}`;
    const pointer1 = createUint8Array(100n);
    const pointer2 = createUint8Array(200n);

    const id1 = await io.write.createObfuscatedCircuit([pointer1, pubkey1], {
      account: deployer.account,
    });

    const id2 = await io.write.createObfuscatedCircuit([pointer2, pubkey2], {
      account: user1.account,
    });

    const circuit1 = await (io.read.getObfuscatedCircuit as any)([id1]);
    const circuit2 = await (io.read.getObfuscatedCircuit as any)([id2]);

    assert.equal(circuit1.owner, deployer.account.address);
    assert.equal(circuit2.owner, user1.account.address);
    assert.deepEqual(circuit1.pointer, pointer1);
    assert.deepEqual(circuit2.pointer, pointer2);
  });

  it("Should initialize obfuscatedCircuitCounter to zero", async function () {
    const io = await viem.deployContract("io");
    const counter = await io.read.obfuscatedCircuitCounter();
    assert.equal(counter, 0n);
  });
});


const { ethers } = require('ethers');

// Configuration
const RPC_URL = 'http://localhost:8545';
const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const COPROCESSOR_ADDRESS = '0xYourCoprocessorAddress'; // This will be updated after deployment

// Create provider and wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Coprocessor ABI
const COPROCESSOR_ABI = [
    "event EncryptedExecutionRequested(bytes32 indexed taskId, address indexed caller, bytes encryptedData, uint256 timestamp)",
    "event LeaderElected(bytes32 indexed roundId, address indexed leader, uint256 timestamp)",
    "event AttestationSubmitted(bytes32 indexed taskId, address indexed validator, bytes attestation, uint256 timestamp)",
    "function requestEncryptedExecution(bytes memory encryptedData) external returns (bytes32 taskId)",
    "function submitAttestation(bytes32 taskId, bytes memory attestation) external",
    "function electLeader(uint256 roundId) external returns (address)",
    "function getLeader(uint256 roundId) external view returns (address)",
    "function getTaskResult(bytes32 taskId) external view returns (bytes memory result)",
    "function createTask(uint256 numberA, uint256 numberB) external returns (bytes32 taskId)",
    "function TASK_EXPIRY() external view returns (uint32)"
];

// CoprocessorEmitter ABI
const EMITTER_ABI = [
    "event DeveloperExecution(bytes32 indexed taskId, bytes encryptedData, bytes result)",
    "function executeEncrypted(bytes calldata encryptedProgramLogic) external returns (bytes32 taskId)",
    "function completeExecution(bytes32 taskId, bytes calldata result) external"
];

async function testCoprocessorIntegration() {
    console.log('Testing Coprocessor Integration...');
    
    // Connect to contracts
    const coprocessor = new ethers.Contract(COPROCESSOR_ADDRESS, COPROCESSOR_ABI, wallet);
    
    // Test 1: Deploy coprocessor emitter
    const emitterFactory = await ethers.getContractFactory('CoprocessorEmitter', wallet);
    const emitter = await emitterFactory.deploy(COPROCESSOR_ADDRESS);
    await emitter.waitForDeployment();
    console.log('CoprocessorEmitter deployed at:', await emitter.getAddress());
    
    // Test 2: Request encrypted execution
    console.log('Testing encrypted execution request...');
    const encryptedData = ethers.hexlify(ethers.toUtf8Bytes('encrypted_program_logic_payload'));
    
    const tx1 = await emitter.executeEncrypted(encryptedData);
    console.log('Encrypted execution request sent, tx:', tx1.hash);
    await tx1.wait();
    
    // Test 3: Create regular sum task
    console.log('Testing sum task...');
    const tx2 = await coprocessor.createTask(33, 9);
    console.log('Sum task created, tx:', tx2.hash);
    await tx2.wait();
    
    // Test 4: Elect leader
    const roundId = Math.floor(Date.now() / 100000);
    const tx3 = await coprocessor.electLeader(roundId);
    console.log('Leader election complete, tx:', tx3.hash);
    await tx3.wait();
    
    // Test 5: Check current leader
    const leader = await coprocessor.getLeader(roundId);
    console.log('Current leader:', leader);
    
    // Test 6: Check task completion (after network validation)
    setTimeout(async () => {
        try {
            const tasks = await coprocessor.queryFilter('CreateTask');
            console.log('Tasks:', tasks.length);
            
            if (tasks.length > 0) {
                const taskId = tasks[tasks.length - 1].args[0];
                console.log('Latest task ID:', taskId);
                
                // This would be after attestation and consensus
                const result = await coprocessor.getTaskResult(taskId);
                console.log('Task result:', result);
            }
        } catch (error) {
            console.log('Error querying tasks:', error.message);
        }
    }, 10000);
    
    console.log('Integration test completed!');
}

// Contract deployment helper
async function deployContracts() {
    console.log('Deploying Coprocessor contracts...');
    
    try {
        const coprocessorFactory = await ethers.getContractFactory('Coprocessor', wallet);
        const settlementAddress = '0x882B9439598239d9626164f7578F812Ef324F5Cb'; // Replace with actual address
        
        const coprocessor = await coprocessorFactory.deploy(settlementAddress);
        await coprocessor.waitForDeployment();
        
        console.log('Coprocessor deployed at:', await coprocessor.getAddress());
        console.log('Deployment successful!');
        
        return await coprocessor.getAddress();
    } catch (error) {
        console.error('Deployment failed:', error);
        throw error;
    }
}

// Helper function to test HTTP endpoint
async function testExternalEndpoint() {
    const response = await fetch('http://34.46.119.33:3000/run/dummy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            encryptedData: 'test_encrypted_payload',
            leader: wallet.address,
            timestamp: Math.floor(Date.now() / 1000)
        })
    });
    
    const result = await response.json();
    console.log('External endpoint result:', result);
}

// Run integration tests
async function runTests() {
    try {
        console.log('Starting coprocessor integration tests...');
        
        // Uncomment to deploy contracts
        // const coprocessorAddress = await deployContracts();
        // console.log('Update COPROCESSOR_ADDRESS in test file to:', coprocessorAddress);
        
        // Test existing deployment
        await testCoprocessorIntegration();
        // await testExternalEndpoint();
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Export for use in other scripts
module.exports = {
    testCoprocessorIntegration,
    deployContracts,
    testExternalEndpoint,
    COPROCESSOR_ADDRESS,
    runTests
};

// Run if called directly
if (require.main === module) {
    runTests();
}
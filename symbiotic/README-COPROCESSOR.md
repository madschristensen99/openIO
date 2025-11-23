# Symbiotic Coprocessor Implementation

This implementation adds a coprocessor layer to the Symbiotic network with leader election, attestation, and encrypted program logic execution capabilities.

## Architecture Overview

The coprocessor consists of three main components:

1. **Smart Contracts** (`src/symbiotic/Coprocessor.sol`)
   - Leader election system using deterministic selection
   - Encrypted execution request interface
   - Attestation submission and verification
   - Developer-friendly emitter for integration

2. **Off-chain Services** (`off-chain/cmd/coprocessor/main.go`)
   - Leader election coordination
   - HTTP client for external endpoint querying
   - Attestation signing and verification
   - Network discovery and validation

3. **Integrations** (`CoprocessorEmitter`)
   - Simple interface for developers
   - Encrypted program logic execution
   - Event emission for result tracking

## Features

### Leader Election
- Deterministic leader selection based on block numbers
- Round-based rotation (every 100 blocks)
- Validator participation required
- Cryptographic validation

### HTTP Integration
- Leader fetches from external endpoint: `http://34.46.119.33:3000/run/dummy`
- POST requests with encrypted data
- Timeout handling and retry logic
- Result validation and processing

### Attestation System
- Validator signatures using ECDSA
- Per-task attestation tracking
- Consensus threshold verification
- Cryptographic proof of execution

### Developer Interface
- Simple function calls for encrypted execution
- Event-based result notification
- Type-safe interfaces
- Gas-optimized operations

## Quick Start

### 1. Deploy Contracts
```bash
# Navigate to symbiotic directory
cd symbiotic

# Ensure contracts are compiled
forge build

# Deploy the coprocessor
./scripts/deploy-coprocessor.toml
```

### 2. Run Off-chain Services
```bash
# Start leader election service
cd symbiotic/off-chain
go run ./cmd/coprocessor
```

### 3. Test Integration
```bash
# Run integration tests
node scripts/test-integration.js

# Or run specific components
node -e "
  const { testExternalEndpoint } = require('./scripts/test-integration.js');
  testExternalEndpoint().catch(console.error);
"
```

## Usage Examples

### Simple Encrypted Execution
```javascript
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const emitter = new ethers.Contract(EMITTER_ADDRESS, EMITTER_ABI, wallet);

// Request encrypted execution
const encryptedProgram = ethers.hexlify(ethers.toUtf8Bytes('my encrypted program logic'));
const tx = await emitter.executeEncrypted(encryptedProgram);
await tx.wait();
```

### Query Results
```javascript
const coprocessor = new ethers.Contract(COPROCESSOR_ADDRESS, COPROCESSOR_ABI, wallet);

// Get task result
const result = await coprocessor.getTaskResult(taskId);
console.log('Encrypted execution result:', result);
```

### Leader Information
```javascript
// Get current leader
const roundId = Math.floor(Date.now() / 100000);
const leader = await coprocessor.getLeader(roundId);
```

## Network Configuration

### Services
- **Primary Network**: `http://localhost:8545`
- **Settlement Network**: `http://localhost:8546`
- **External Endpoint**: `http://34.46.119.33:3000/run/dummy`

### Deployment Addresses
After deployment, update these addresses:
- `COPROCESSOR_ADDRESS` in scripts
- `SETTLEMENT_ADDRESS` in deployment configs

### Environment Variables
```bash
export RPC_URL="http://localhost:8545"
export PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
export SETTLEMENT_ADDRESS="your_settlement_contract_address"
```

## Security Considerations

1. **Private Key Management**
   - Never use mainnet addresses for testing
   - Use environment variables for sensitive data
   - Rotate keys regularly in production

2. **Validator Selection**
   - Implement proper validator discovery
   - Ensure cryptographic verification
   - Maintain validator registry

3. **External Endpoints**
   - Validate all external responses
   - Implement rate limiting
   - Use HTTPS in production

## Development

### Contract Structure
```
src/symbiotic/
├── Coprocessor.sol      # Main coprocessor contract
├── SumTask.sol         # Original sum task logic
└── DRIVERs             # Network initialization
```

### Off-chain Structure
```
off-chain/
├── cmd/
│   └── coprocessor/    # Leader election service
├── internal/
│   ├── contracts/      # Contract bindings
│   └── utils/         # Utility functions
└── scripts/
    └── test-*         # Integration tests
```

## Testing

### Unit Tests
```bash
forge test -vvv
```

### Integration Tests
```bash
# Start test network
./scripts/deploy.sh

# Run integration tests
node scripts/test-integration.js

# Test external endpoint
curl -X POST http://34.46.119.33:3000/run/dummy \
  -H "Content-Type: application/json" \
  -d '{"encryptedData": "test_program", "leader": "0x123..."}'
```

## Troubleshooting

### Common Issues
1. **Connection Refused**: Check if RPC endpoints are accessible
2. **Transaction Failed**: Verify gas limits and balances
3. **Leader Election**: Ensure validators are properly registered
4. **External Endpoint**: Verify network connectivity to 34.46.119.33:3000

### Debug Commands
```bash
# Check balance
cast balance 0xYourAddress --rpc-url http://localhost:8545

# View contract
cast call $COPROCESSOR_ADDRESS "getLeader(uint256)" 123 --rpc-url http://localhost:8545

# Logs
docker logs -f symbiotic-sum-node-1
```

## Future Enhancements

1. **ZK Proofs**: Zero-knowledge attestation system
2. **Multi-sig**: Validator consensus mechanism
3. **Privacy**: Homomorphic encryption support
4. **Scalability**: Sharding and parallel processing
5. **Monitoring**: Prometheus metrics and alerting

## License

MIT License - See LICENSE file for details.
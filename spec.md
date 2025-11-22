# Diamond IO Coprocessor - Hackathon Spec

## Abstract
Build a coprocessor that brings Indistinguishability Obfuscation (iO) to Ethereum smart contracts, enabling developers to obfuscate arbitrary computation logic on-chain. Similar to FHE coprocessors, this system offloads heavy iO operations off-chain while maintaining cryptographic guarantees on-chain.

**Repository**: [MachinaIO/diamond-io](https://github.com/MachinaIO/diamond-io)  
**Hackathon Goal**: MVP enabling Solidity developers to deploy obfuscated logic contracts with minimal friction.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          EVM Chain (L1/L2)                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  DiamondIORegistry (Singleton)                               │  │
│  │  - Stores obfuscated program hashes                          │  │
│  │  - Handles input/output commitments                          │  │
│  │  - Verifies coprocessor attestations                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
│         │                  │                  │                      │
│         │ Events           │ Callbacks        │ Proofs               │
│         │                  │                  │                      │
└─────────┼──────────────────┼──────────────────┼──────────────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼──────────────────────┐
│                 Off-Chain Coprocessor Network                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  DioNode     │  │  DioNode     │  │  DioNode     │              │
│  │  (Rust)      │  │  (Rust)      │  │  (Rust)      │              │
│  │              │  │              │  │              │              │
│  │  - Event     │  │  - Event     │  │  - Event     │              │
│  │    Listener  │  │    Listener  │  │    Listener  │              │
│  │  - iO Engine │  │  - iO Engine │  │  - iO Engine │              │
│  │  - Prover    │  │  - Prover    │  │  - Prover    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│              │            │                │                        │
│              └────────────┴────────────────┘                        │
│                           │                                           │
│                    ┌──────▼──────┐                                    │
│                    │  DiamondIO  │                                    │
│                    │  Library    │                                    │
│                    │  (diamond-io│                                    │
│                    │   Rust crate)│                                   │
│                    └─────────────┘                                    │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 2. How It Works (User Flow)

### For Developers:
1. **Write Logic**: Create program in supported DSL (e.g., arithmetic circuit, WASM subset)
2. **Obfuscate**: Use CLI tool to generate:
   - Obfuscated program blob (stored off-chain, e.g., IPFS)
   - Verifier contract solidity code
   - Deployment artifacts
3. **Deploy**: Deploy verifier contract + register in DiamondIORegistry
4. **Execute**: 
   - Call `execute(inputs)` on verifier contract
   - Coprocessor picks up event, runs obfuscated computation
   - Result posted on-chain with cryptographic proof

### For Users:
1. Send transaction with encrypted/private inputs to verifier contract
2. Coprocessor processes inputs through obfuscated program
3. Result + proof submitted on-chain
4. Verifier contract validates proof and emits output

---

## 3. Developer Interface

### Solidity Integration

```solidity
// Auto-generated Verifier Contract
contract MyObfuscatedLogic is IDiamondIOVerifier {
    address constant REGISTRY = 0x...;
    bytes32 public programHash;
    
    function execute(bytes calldata encryptedInput) external payable {
        // 1. Commit inputs to registry
        uint256 requestId = DiamondIORegistry(REGISTRY).submitRequest(
            programHash,
            encryptedInput,
            msg.sender
        );
        
        // 2. Coprocessor listens and processes...
        // 3. Callback with result
    }
    
    // Called by coprocessor
    function fulfill(
        uint256 requestId,
        bytes calldata output,
        bytes calldata proof
    ) external {
        DiamondIORegistry(REGISTRY).verifyAndFulfill(
            requestId,
            output,
            proof
        );
        
        // Use output in your app
        emit ComputationResult(requestId, output);
    }
}
```

### CLI Tooling

```bash
# Install
cargo install dio-cli

# Obfuscate program
dio obfuscate \
  --program ./my_logic.circ \
  --params secure \
  --output ./artifacts/ \
  --generate-verifier

# Deploy (uses foundry)
dio deploy \
  --verifier ./artifacts/verifier.sol \
  --registry 0x... \
  --rpc $RPC_URL

# Test execution
dio execute \
  --program-hash 0x... \
  --input "private_value:42" \
  --rpc $RPC_URL
```

---

## 4. Hackathon MVP Scope

### Phase 1: Core Coprocessor (Day 1-2)
- [ ] **On-chain contracts**:
  - `DiamondIORegistry.sol`: Request submission, event emission, proof verification stub
  - `IDiamondIOVerifier.sol`: Interface for auto-generated verifiers
  - Mock verifier for dummy parameters
  
- [ ] **Off-chain node**:
  - Event listener (using `ethers-rs`)
  - Diamond IO integration (wrap `diamond-io` crate)
  - Proof generation (placeholder for hackathon)
  - Result submission loop

- [ ] **CLI tooling**:
  - Basic `dio` command structure
  - Program parsing (support minimal arithmetic circuits)
  - Artifact generation

### Phase 2: E2E Integration (Day 3-4)
- [ ] **Circuit DSL**: Simple language for defining obfuscated logic
  ```rust
  // Example: Private voting logic
  circuit {
    input private: uint32[2]; // [vote, salt]
    input public: address;
    
    // Obfuscated: verify signature, tally vote
    bool valid = verify_signature(public, private[1]);
    uint32 result = valid ? private[0] : 0;
    
    output result;
  }
  ```

- [ ] **Solidity codegen**: Auto-generate verifier contracts from obfuscated programs
- [ ] **IPFS integration**: Store program blobs off-chain
- [ ] **Example app**: Private order matching, sealed-bid auction, or leverage calculation

### Phase 3: Polish & Demo (Day 5)
- [ ] **Docker setup**: One-command node deployment
- [ ] **Frontend**: Minimal UI for deploying/obfuscating
- [ ] **Gas optimization**: Commit-compress proofs, batched submissions
- [ ] **Hackathon examples**: 3 working dApps showing iO uniqueness

---

## 5. API Specification

### DiamondIORegistry.sol

```solidity
pragma solidity ^0.8.20;

interface IDiamondIORegistry {
    event NewRequest(
        bytes32 indexed programHash,
        uint256 indexed requestId,
        address indexed submitter,
        bytes encryptedInput
    );
    
    event RequestFulfilled(
        uint256 indexed requestId,
        bytes output,
        bytes proof
    );
    
    function submitRequest(
        bytes32 programHash,
        bytes calldata encryptedInput,
        address callback
    ) external payable returns (uint256 requestId);
    
    function verifyAndFulfill(
        uint256 requestId,
        bytes calldata output,
        bytes calldata proof
    ) external;
}
```

### DioNode API (Rust)

```rust
// Core trait for obfuscation providers
pub trait ObfuscationEngine {
    fn obfuscate(
        &self,
        circuit: Circuit,
        params: ObfuscationParams,
    ) -> Result<ObfuscatedProgram, Error>;
    
    fn evaluate(
        &self,
        program: &ObfuscatedProgram,
        input: &[u8],
    ) -> Result<(Vec<u8>, Proof), Error>;
}

// Event handler
pub async fn process_event(
    registry: Address,
    event: NewRequestEvent,
    engine: &dyn ObfuscationEngine,
) -> Result<(), Error> {
    // 1. Fetch program from IPFS
    // 2. Evaluate with encrypted input
    // 3. Submit fulfillment tx
}
```

---

## 6. Performance Targets (Hackathon Demo)

| Metric | Dummy Params | Demo Params |
|--------|--------------|-------------|
| Obfuscation time | <5s | <2min |
| Evaluation time | <1s | <10s |
| On-chain gas (submit) | ~50k | ~100k |
| On-chain gas (verify) | ~30k | ~200k |
| Off-chain memory | ~500MB | ~8GB |

*Note: Real iO is computationally intensive. Hackathon version uses reduced parameters for demo viability.*

---

## 7. Security Considerations

### For Hackathon (MVP):
- **Trust model**: Coprocessor nodes are trusted for liveness, not correctness (proofs prevent malicious outputs)
- **Parameter safety**: Clearly mark dummy params as "INSECURE - FOR TESTING ONLY"
- **Proof system**: Use simplified KZG-like proofs; note this is not production-ready
- **Private inputs**: UseElGamal encryption or similar; coprocessor decrypts with TEE or MPC (hackathon: mock this)

### Future Production:
- Full ZK-SNARK for proof compression
- Decentralized coprocessor network with threshold signatures
- Formal verification of obfuscation toolchain
- Post-quantum parameter sets

---

## 8. Hackathon-Specific Setup

### Quickstart (5 minutes)

```bash
# Clone and setup
git clone --recurse-submodules https://github.com/MachinaIO/diamond-io-coprocessor
cd diamond-io-coprocessor
docker-compose up -d

# In another terminal
cd dapp-examples
cp .env.example .env
# Edit .env with RPC_URL

# Deploy registry
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast

# Run example: Private voting
cd examples/private-voting
dio obfuscate --program voting.circ --output ./artifacts
dio deploy --verifier ./artifacts/Voting.sol --registry $REGISTRY
dio execute --program-hash $HASH --input "vote:1,salt:12345"
```

### Project Structure

```
diamond-io-coprocessor/
├── contracts/          # Solidity contracts
├── dio-node/           # Rust coprocessor node
├── dio-cli/            # CLI tooling
├── sdk/                # TypeScript SDK
├── examples/           # Hackathon example dApps
│   ├── private-voting/
│   ├── sealed-bid-auction/
│   └── onchain-poker/
└── docker-compose.yml
```

---

## 9. Judging Criteria Alignment

| Criteria | How We Deliver |
|----------|----------------|
| **Innovation** | First iO coprocessor for EVM; enables new class of private computation dApps |
| **Technical Difficulty** | Integrating cutting-edge iO research (Diamond) with blockchain infrastructure |
| **Practicality** | Solidity devs can obfuscate logic in 3 CLI commands; familiar workflow |
| **Impact** | Unlocks private order books, hidden-state games, proprietary on-chain logic |
| **Completeness** | E2E working MVP with 3 example dApps, CLI, docs, and Docker deployment |

---

## 10. Resource Requirements

### For Hackathon Team:
- **Team size**: 3-4 people
  - Rust dev (integrate `diamond-io` crate)
  - Solidity dev (registry + verifier patterns)
  - DevRel (examples, docs, CLI UX)
  - Optional: Frontend (minimal UI)

### Compute:
- **Build**: 16GB RAM, 4 cores (for dummy params)
- **Demo**: 64GB RAM, 8 cores (for secure-ish params)
- **Cloud**: Use Rented GPU instance for faster obfuscation

---

## 11. Example Use Cases for Demo

### A. Private Order Matching (DEX)
- **Logic**: Match orders without revealing order book
- **iO value**: Hide matching algorithm to prevent MEV

### B. Sealed-Bid Vickrey Auction
- **Logic**: Second-price auction with private bids
- **iO value**: Hide bid values until auction ends, hide winner calculation

### C. On-Chain Poker with Hidden State
- **Logic**: Shuffle and deal cards, manage private hands
- **iO value**: Hide deck state, prevent front-running draws

---

## 12. Deliverables Checklist

- [ ] **Core**: Working coprocessor node + registry contract
- [ ] **CLI**: `dio obfuscate`, `deploy`, `execute` commands
- [ ] **Examples**: 3 working dApps with frontend
- [ ] **Docs**: Setup guide, API reference, tutorial video
- [ ] **Live Demo**: Deployed on testnet (Holesky/Arb Sepolia)
- [ ] **Pitch Deck**: Technical architecture + use cases

---

## 13. Risks & Mitigations

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Obfuscation too slow | High | Use dummy params for demo; pre-compute programs |
| Memory overflow | Medium | Disk-backed matrices; limit circuit size |
| Complex setup | High | Docker + comprehensive setup scripts |
| Judges don't understand iO | High | Clear before/after examples; focus on dev UX |

---

## 14. Future Roadmap (Post-Hackathon)

- **Decentralization**: Network of nodes with threshold decryption
- **Proof compression**: Full zk-SNARK verification on-chain
- **DSL improvements**: Support higher-level languages (Cairo → iO)
- **Hardware acceleration**: FPGA/ASIC for trapdoor sampling
- **Production params**: Audit-safe parameter generation
- **EVM precompile**: Native `DIAMOND_IO_VERIFY` opcode

---

## 15. Getting Started for Hackathon Judges

1. **Try the demo**: `docker run machinaio/diamond-io-demo`
2. **Read examples**: Check `examples/private-voting/README.md`
3. **Watch**: 2-minute explainer video (link in repo)
4. **Test**: Run `cargo test -r --test e2e_coprocessor` in repo

**Key Innovation**: We make iO practical for blockchain devs by wrapping academic implementation (Diamond) into a coprocessor pattern developers already understand from FHE.

---

This spec is designed to be hackathon-practical: focus on demonstrating the *concept* and *developer experience* rather than production-ready cryptography. The Diamond IO repo provides the heavy crypto; your job is to make it accessible to Solidity developers.

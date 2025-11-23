# Scalable Private World Computer via Root iO

**Application-Agnostic iO and Our Roadmap for Making It Practical**

Sora Suegami* and Enrico Bottazzi*  
*Equal contributions  
Machina iO, Ethereum Foundation  
November 2, 2025

---

## Abstract

Ethereum has established itself as a world computer, enabling general-purpose, decentralized, and verifiable computation via smart contracts on a globally replicated state. However, because all computations and state are public by default, it is fundamentally unsuitable for confidential smart contracts that jointly process private data from multiple users. This motivates the notion of a **private world computer**: an ideal future form of Ethereum that preserves its integrity and availability guarantees while supporting such confidential smart contracts.

Prior constructions based on implementable cryptographic primitives such as fully homomorphic encryption (FHE) inevitably rely on committees that hold secret shares and perform computations using those shares, a capability that is not provided by today's Ethereum validators. We cannot simply modify the Ethereum protocol so as to shift the committees' role onto the Ethereum validators, because the computational and communication costs borne by the committee grow with the demand for confidential smart contracts, forcing higher hardware requirements for participation, undermining decentralization, and increasing the risk of malicious collusion. Hence, there remains a fundamental trade-off between committee decentralization and scalability for confidential smart contracts.

### Our Contributions

In this position paper, we make two contributions toward a scalable private world computer:

1. **Root iO Architecture**: We show how indistinguishability/ideal obfuscation (iO), combined with FHE and succinct non-interactive arguments of knowledge (SNARK), yields a private world computer that, after a one-time obfuscation process, introduces no additional ongoing trust assumptions beyond Ethereum's validators, incurring no additional overhead for validators to process confidential smart contracts compared to public smart contracts. In this design, a single application-agnostic obfuscated circuit, called **root iO**, suffices to realize arbitrary confidential smart contracts. The outputs of root iO can be verified on-chain at a cost comparable to signature verification, and the obfuscation process can be distributed among multiple parties while remaining secure as long as at least one party is honest.

2. **Practical Roadmap**: We outline our roadmap toward a practical implementation of root iO. Assuming that the underlying assumptions of our lattice-based iO construction remain secure, the remaining missing pieces are technically concrete: namely, practical implementations of verifiable FHE and of homomorphic evaluation of a pseudorandom function (PRF) and SNARK verification over key-homomorphic encodings, which together would allow us to implement root iO without incurring prohibitive overhead.

---

## 1. Introduction

Ethereum has established itself as a world computer, a decentralized platform capable of executing arbitrary programs, called smart contracts, on the Ethereum virtual machine, and of achieving global consensus on a verifiable, timestamped shared state. To achieve these two capabilities, all computations and all state data are public by default. This fundamental lack of privacy severely limits the scope of decentralized applications, preventing the creation of any system that relies on computation over private data coming from multiple parties.

### The Private World Computer Vision

The ambition to solve this challenge has prompted us to introduce the concept of a **private world computer** as an ideal future form of Ethereum. Such a system extends the capabilities of Ethereum to support arbitrary computation over encrypted data, enabling applications to interact with each other's private state data. Smart contracts specify the application logic executed on ciphertexts, as well as the access policies governing their evaluation and decryption.

We aim for any smart contract on the private world computer to achieve:
- **Integrity** (tamper-resistance)
- **Availability** (censorship-resistance)
- **Confidentiality** (privacy)

All at the same security level as today's public smart contracts on Ethereum.

### The Challenge with Existing Solutions

Since the security of Ethereum is primarily derived from the decentralization of its validators, any new functionality added to Ethereum to support confidentiality should neither compromise this decentralization nor introduce new trust assumptions in parties that are likely to be less decentralized than the validators.

Unfortunately, existing solutions for confidential smart contracts—including those based on secret-sharing multiparty computation (MPC) or fully homomorphic encryption (FHE)—are not ideal for realizing a private world computer. This is because they rely on ad-hoc trusted parties whose required capabilities are not compatible with today's Ethereum validators; we refer to these parties as **committees** in this paper to distinguish them from the validators. These committees must hold secret shares specific to the underlying primitive and perform computations using those shares.

We cannot simply modify the Ethereum protocol so as to offload the committees' role onto the existing validators because the computational and communication costs borne by the committee scale with the demand for the private world computer. Even with a solution for confidential smart contracts based on fully homomorphic encryption (FHE), which allows the committee to delegate computation on ciphertexts to permissionless parties, called evaluators, a trusted ad-hoc committee is still necessary to manage secret key shares and perform FHE decryption of output ciphertexts via MPC. This causes the computational and communication costs of each committee party to grow proportionally to the number of decryption requests.

### The Scalability-Decentralization Trade-off

Therefore, improving the scalability of the private world computer—in particular, the throughput of ciphertexts that the committee can decrypt per unit time—requires all committee parties to upgrade their hardware capabilities.

However, raising the hardware requirements for participating in the committee undermines its decentralization and could increase the likelihood that a threshold number of malicious committee parties collude. Especially, requiring a sufficiently high bandwidth for the hardware not only increases its cost, effectively limiting committee participation to well-funded individuals or organizations, but also risks undermining geographic decentralization because only those located in regions with enough bandwidth can operate such hardware. Thus, for currently implementable cryptographic primitives, including FHE, there is a trade-off between the decentralization of the committee and the throughput at which outputs of confidential smart contracts can be obtained. This implies that achieving scalability for private smart contracts remains a significant challenge.

---

## 2. Preliminaries

### 2.1 Signature-based Blockchain

In Ethereum, each smart contract deployed by each application developer has its own program and storage. The storage consists of multiple slots, and the values stored in each slot persist across blocks indefinitely. A user's transaction finalized on the Ethereum blockchain can modify values in slots only in accordance with the contract's program.

Rather than defining the fully fledged specifications of the Ethereum consensus layer, we define a more abstract and general notion of a "signature-based blockchain". That is, for each block number T ∈ ℕ, we simply model each T-th block as the following tuple:

```
block_T := (storage_T, pks_T, txs_T, prevhash_T)
```

where:
- **storage_T** is a list of values in the storages of all smart contracts at block number T
- **pks_T** is a list of the assigned validators' public keys at block number T
- **txs_T** is a list of user transactions in the T-th block
- **prevhash_T** is a hash of the previous block

The initial hash prevhash₀ is a fixed string.

We assume a function `Transit` that derives a next storage and the validators' public keys as follows:

```
(storage_T, pks_T) := Transit(T, storage_{T-1}, pks_{T-1}, txs_T, prevhash_T)
```

#### NP Relation R_SW

We define an NP relation R_SW where an instance is a tuple of:
- The initial block block⁰
- A smart contract address contAddr
- A list of slot indices slots
- A list of integers v ∈ ℤ*

A witness is:
- A block number T ≤ T_max
- A list of T tuples (block_i, signs_i) for i ∈ {1,...,T}

An instance-witness pair is in R_SW if and only if:
- block₁ is identical to block⁰
- For every i ∈ {2,...,T}: Transit produces correct storage_i and pks_i
- Each signs_i contains valid signatures from threshold validators
- The hash of block_{i-1} equals prevhash_i
- txs_T contains a transaction that writes integers v to slots in contAddr

### 2.2 FHE-based Private World Computer

We review a design of a private world computer inspired by the fhevm protocol introduced by Zama. It employs FHE to enable arbitrary computation on encrypted data originating from different parties.

#### Syntax and Properties of FHE

A public-key FHE scheme provides:

- **FHE.Setup(1^λ) → (pk_FHE, sk_FHE)**: Given security parameter λ, outputs public and secret keys
- **FHE.Enc(pk_FHE, x) → c**: Given public key and message x, outputs ciphertext c
- **FHE.Eval(pk_FHE, C, (c₁,...,c_L)) → (c'₁,...,c'_M)**: Given public key, circuit C with L inputs and M outputs, and L input ciphertexts, outputs M output ciphertexts
- **FHE.Dec(sk_FHE, (c₁,...,c_M)) → (y₁,...,y_M)**: Given secret key and M ciphertexts, outputs messages

**Correctness**: Decrypting the output of FHE.Eval yields the circuit output C(x₁,...,x_L).

**Security**: A ciphertext leaks no non-trivial information about the message it encrypts.

#### FHE-based Private World Computer Architecture

The system relies on three core components:

1. **FHE co-processor**: Permissionless evaluators execute FHE.Eval on specified circuits and input ciphertexts

2. **Decryption co-processor**: Handles decryption of ciphertexts

3. **Smart contracts**: A set of smart contracts on Ethereum, including:
   - Various application-specific smart contracts specifying evaluation functions and decryption policies
   - A single gateway smart contract that orchestrates interactions among components

#### Decryption Co-processor Requirements

The decryption co-processor must satisfy:

**Security against malicious evaluators**: Even if the evaluator is malicious and attempts to extract private information from ciphertexts or doesn't evaluate the requested circuit correctly, the system remains secure. This is addressed by verifiable FHE, which enables the evaluator to make a succinct proof that output ciphertexts are obtained by executing FHE.Eval on the specified inputs and circuit. The committee should only decrypt provided output ciphertexts when the evaluator provides a valid proof.

**Application-agnostic implementation**: Although decryption policies differ from one application to another, the implementation of the decryption co-processor—specifically, the operations executed by the committee parties—must be the same regardless of the application. Such application-specific differences can instead be absorbed by the gateway contract. The gateway contract maintains an "access control list (ACL)" that specifies, for each ciphertext, which application contracts are allowed to access it. An application contract evaluates its application-specific decryption policy in its own program, and if the policy is satisfied for some ciphertexts, it calls a decryption-request function of the gateway contract. If and only if the calling contract is authorized to access the supplied ciphertexts according to the ACL, the gateway contract writes the ciphertexts to certain designated slots in its storage. Consequently, for all applications, it suffices for the committee to decrypt only the ciphertexts written into the designated slots of the gateway contract's storage.

### 2.3 Indistinguishability / Ideal Obfuscation

We use the abbreviation iO for both indistinguishability obfuscation and ideal obfuscation. Both primitives provide the following algorithms:

1. **iO.Obf(1^λ, C) → Ĉ**: Given security parameter λ and circuit C with L inputs and M outputs, outputs obfuscated circuit Ĉ

2. **iO.Eval(Ĉ, x) → y**: Given obfuscated circuit Ĉ and L inputs x, outputs evaluation results y = C(x)

**Indistinguishability obfuscation** guarantees that obfuscations of two circuits with the same size and functionality are indistinguishable from each other. The construction for all circuits exists in a standard model based on standard cryptographic assumptions.

**Ideal obfuscation** guarantees that an obfuscated circuit leaks no nontrivial information beyond its input-output behavior for most natural circuits; however, its construction is possible only in a heuristic model called pseudorandom oracle model.

If we can implement indistinguishability obfuscation, then we can immediately extend it to an implementation of ideal obfuscation.

---

## 3. Root iO: Obfuscation for All Applications

### 3.1 Definition

**Root iO** is a single obfuscation of an application-agnostic circuit that is available to all applications on the private world computer. We introduce this to realize the decryption co-processor without relying on any ad-hoc committee after a one-time setup.

The obfuscation and evaluation algorithms for root iO are defined with the following syntax:

- **RiO.Obf(1^λ) → Ĉ**: Given security parameter λ, outputs obfuscated circuit Ĉ

- **RiO.Eval(Ĉ, c, T, (block_i, signs_i)_{i∈[T]}) → y**: Given the obfuscated circuit Ĉ, FHE ciphertexts c, a block number T ∈ ℕ, and a list of T tuples each consisting of block_i and signatures signs_i, outputs plaintexts y

Notably, the obfuscation algorithm is assumed to be executed by a single trusted third party initially; we address the need for decentralization in Subsection 3.4.

### 3.2 Instantiation

At a high level, root iO is instantiated by obfuscating a circuit C_RiO that simulates the behavior of the committee used for the decryption MPC. Recall that to decide whether given ciphertexts c are allowed to be decrypted, by the application-agnostic implementation of the decryption co-processor, it suffices to simply check whether those ciphertexts have been written into designated slots in the storage of the gateway contract. Such a condition can be decided by the NP relation R_SW.

Therefore, we design the circuit C_RiO so that it takes as input ciphertexts c and a SNARK proof for the relation R_SW, and outputs the decryption of c if and only if it successfully verifies that the proof is valid for c.

#### Hardcoded Values in C_RiO

We hardcode the following values in the circuit C_RiO:

- A verification key vk_SW of the SNARK scheme for R_SW
- The first block of Ethereum block⁰
- The address of the gateway contract contAddr
- The designated slots in the gateway contract storage
- The FHE secret key sk_FHE

#### Circuit Definition

**C_RiO(c, π) → y**:

1. Verify the provided proof π with verification key vk_SW and instance (block⁰, contAddr, slots, c). If verification fails, return y := ⊥
2. Return decryption results y := FHE.Dec(sk_FHE, c)

#### Root iO Algorithms

Using C_RiO and the fixed initial block block⁰, we instantiate the obfuscation and evaluation algorithms:

**RiO.Obf(1^λ) → Ĉ**:

1. Execute (pk_FHE, sk_FHE) ← FHE.Setup(1^λ)
2. Sample proving key pvk_SW and verification key vk_SW for the SNARK scheme for R_SW
3. Deploy a gateway contract, obtaining its address contAddr and designated slots
4. Construct circuit C_RiO with sk_FHE, vk_SW, contAddr, slots hardcoded
5. Execute Ĉ' ← iO.Obf(1^λ, C_RiO)
6. Output Ĉ := (pk_FHE, pvk_SW, contAddr, slots, Ĉ')

**RiO.Eval(Ĉ, c, T, (block_i, signs_i)_{i∈[T]}) → y**:

1. Parse Ĉ as (pk_FHE, pvk_SW, contAddr, slots, Ĉ')
2. Generate SNARK proof π using proving key pvk_SW, witness (T, (block_i, signs_i)_{i∈[T]}), and instance (block⁰, contAddr, slots, c)
3. Execute y ← iO.Eval(Ĉ', c, π)
4. Output y

#### Correctness Property

If the ciphertexts c have been written to the slots specified by slots at block number T on Ethereum, then:

```
RiO.Eval(Ĉ, c, T, (block_i, signs_i)_{i∈[T]}) = FHE.Dec(sk_FHE, c)
```

#### Trust Assumption During Evaluation

Once the obfuscated circuit Ĉ is generated honestly, all evaluation can be delegated to permissionless evaluators. Users do not need to place any trust in them because evaluators can neither learn the private data being processed nor deliberately provide incorrect results. Specifically:

- Ideal obfuscation guarantees that Ĉ leaks no non-trivial information beyond its input-output behavior, implying that the embedded FHE secret key sk_FHE remains unknown to evaluators
- The proof verification inside Ĉ ensures that confidentiality of any ciphertexts not authorized for decryption by the decryption policies is preserved

Therefore, unlike existing constructions that rely on FHE and MPC for decryption, our root iO-based construction, after a one-time setup for obfuscation, does not require any additional trust beyond that already placed on the Ethereum validators.

### 3.3 On-chain Verification of Obfuscated Circuit Outputs

Anyone can verify that given decryption results y are indeed the outputs of the obfuscated circuit Ĉ by re-executing Ĉ on the same input. However, such a re-execution within a smart contract program (on-chain) is expected to incur prohibitive costs.

#### Signature-based Verification

One way to perform on-chain verification at only a small cost is to have the obfuscator sample a signing key of a digital signature scheme and embed this key into the obfuscated circuit, whose functionality is modified to additionally output a digital signature on the decryption result y. If the obfuscator publishes the corresponding verification key, smart contracts can then verify that a given y was output by Ĉ simply by checking this signature under the published verification key.

Furthermore, the signature need not necessarily be generated directly inside the circuit C_RiO itself. Concretely:

1. The obfuscator publishes an FHE encryption of the signing key
2. Using this ciphertext together with the ciphertext c, the evaluator homomorphically evaluates under FHE the signing algorithm on the output y encrypted in c, obtaining a ciphertext sign that encrypts the signature on y
3. The evaluator proves that sign is precisely the ciphertext obtained by the above homomorphic evaluation (in addition to satisfying R_SW)
4. The circuit C_RiO outputs the decryptions of both c and sign if and only if both proofs are valid

In this manner, we can keep the computation inside the obfuscated circuit limited to SNARK verification and FHE decryption, while reducing the on-chain verification cost to be as small as that of a signature verification.

### 3.4 Decentralized and Verifiable Obfuscation

While the definition of iO assumes a single trusted obfuscator, in practice, a private world computer cannot rely on the existence of such a party. Moreover, for the root iO obfuscation, we must keep certain values—most notably the FHE secret key embedded in the obfuscated circuit Ĉ' and the private random coin used in its obfuscation—private, while still allowing public verification that Ĉ' is indeed an obfuscation of the intended circuit C_RiO and that the public values embedded in Ĉ' match those published by the obfuscator.

#### Decentralization via Multi-party FHE

Rather than using a publicly verifiable MPC (which would stack MPC costs on top of obfuscation costs), we propose a more efficient method leveraging the concrete structure of the RiO.Obf algorithm.

The RiO.Obf algorithm uses a private random coin for key samplings of the SNARK and FHE schemes, as well as obfuscation. For the SNARK scheme, one can either use a transparent SNARK that doesn't require a private coin for setup, or employ an MPC protocol specialized for SNARK setup that requires only one honest participant.

To efficiently decentralize generation of the remaining components (FHE key pair and obfuscation Ĉ'), we employ a non-interactive multi-party or multi-key FHE scheme for the decryption process. In these schemes, each party holding a secret key share only needs to release a partial decryption for ciphertexts being decrypted, and a threshold number of partial decryptions is sufficient to recover the plaintext.

Let n be the committee size. For every i ∈ {1,...,n}, we define a circuit C_RiO,i obtained from C_RiO by hardcoding the i-th party's secret key share sk_i in place of the FHE secret key sk_FHE, and by making it output the i-th party's partial decryptions for the provided ciphertexts c if the verification of the provided proof π succeeds. We set the threshold for decryption to n, i.e., the FHE secret key remains confidential if at least one party is honest.

Using the modified circuit C_RiO,i, each i-th party only needs to obfuscate C_RiO,i because the evaluator can non-interactively recover the decryption result by combining the partial decryptions obtained from each obfuscation of C_RiO,i. This implies that the committee does not need to execute the iO algorithm within the MPC.

#### Decentralized Obfuscation Algorithm

**RiO.DObf(1^λ, n) → Ĉ**:

1. The n parties execute an MPC protocol to setup a FHE public key pk_FHE and n secret key shares {sk_i}_{i∈{1,...,n}}, where the i-th party holds sk_i
2. The n parties execute an MPC protocol to produce proving key pvk_SW and verification key vk_SW of the SNARK scheme for R_SW
3. The first party deploys a gateway contract and publishes its address contAddr and designated slots to other parties
4. For every i ∈ {1,...,n}, the i-th party constructs circuit C_RiO,i with sk_i, vk_SW, contAddr, slots hardcoded
5. For every i ∈ {1,...,n}, the i-th party executes Ĉ'_i ← iO.Obf(1^λ, C_RiO,i)
6. Output Ĉ := (pk_FHE, pvk_SW, contAddr, slots, {Ĉ'_i}_{i∈{1,...,n}})

#### Trust Assumption During Obfuscation

The decentralized obfuscation algorithm only requires that **at least one party is honest** to ensure the confidentiality of the FHE secret key embedded in the obfuscated circuits {Ĉ'_i}_{i∈{1,...,n}}.

Since the Ethereum validators cannot themselves act as obfuscators, one might suspect that our root iO-based construction ultimately requires the same trust assumptions as existing designs. However, in our case the committee is needed only during a **one-time setup**: once the obfuscated circuits are produced, the system no longer depends on the committee. This allows us to:

- Set the threshold to its maximum value n
- Simply wait for all parties to output their obfuscated circuits
- Re-run the setup with a fresh committee if the previous one fails, without any impact on users

#### Verifiability via Cut-and-Choose

To make the provided obfuscated circuit verifiable without revealing hardcoded secrets and private coins, we adapt the cut-and-choose technique used for garbled circuits:

1. The parties repeat ν times the procedure that generates a pair (pk_FHE, {Ĉ'_i}_{i∈{1,...,n}}) using a fresh random coin
2. The verifier uniformly at random selects a subset T ⊆ {1,...,ν} of t distinct indices
3. For each index in T, the verifier requests the committee to open the random coins used in the corresponding obfuscation procedure
4. After these coins are revealed, the verifier honestly re-runs the obfuscation algorithm with the revealed randomness and checks that all outputs exactly match those originally provided by the committee
5. The remaining ν - t obfuscations whose random coins are not opened are used by the evaluator to actually obtain the output of the root iO
6. If their outputs are not all identical, the evaluator adopts the value given by the majority of these obfuscations

By choosing ν to be sufficiently large yet still polynomial in the security parameter λ, the soundness error can be bounded by a negligible function in λ. The protocol can be made non-interactive in the random oracle model via the Fiat-Shamir transform.

---

## 4. Roadmap for Making Root iO Practical

### 4.1 Limitations of Existing iO Constructions and Implementations

Despite recent theoretical advances in iO, it remains far from being practical. To the best of our knowledge, all existing implementations of iO are incomplete for one of the following reasons:

- **Limited functionality**: No vulnerabilities have been found in the constructions and implementations, but the program functionalities supported are significantly restricted (e.g., point functions, conjunction programs)

- **Incomplete implementations**: The theoretical construction supports arbitrary programs, but existing implementations omit some computations required for security due to efficiency limitations

- **Security vulnerabilities**: Vulnerabilities have been found in the theoretical constructions themselves

We classify existing iO constructions for arbitrary programs by their underlying assumptions:

#### iO from Multilinear Maps

The first iO construction relies on multilinear maps, a generalization of bilinear maps. Several candidates have been proposed (GGH13a, CLT13, GGH15).

**Implementations and attacks**:
- CLT13 multilinear maps have been implemented, but polynomial-time attacks have been demonstrated against them
- GGH15 multilinear maps have been used to implement iO for read-once branching programs, but several attacks have been demonstrated
- New attacks and countermeasures continue to emerge, with no known GGH15-based iO construction secure under standard assumptions

#### iO from Standard Assumptions

A new line of work constructs iO without relying on multilinear maps, ultimately leading to the first construction based solely on standard assumptions. Three standard assumptions suffice:

1. The Decision Linear assumption on bilinear groups
2. The Learning Parity with Noise (LPN) assumption over large prime fields
3. Either a Boolean pseudo-random generator (PRG) represented by a constant-depth circuit or the sparse LPN assumption over binary fields

**Limitations**:
- Not post-quantum secure (relies on bilinear maps)
- No complete implementation exists
- Major bottleneck: complexity and inefficiency from composing cryptographic primitives in a black-box manner across multiple layers
- The transformation from functional encryption (FE) to iO is costly because it recursively invokes the FE encryption algorithm on every input bit
- FE constructions are already far from concretely efficient due to multi-layer composition of cryptographic primitives

For example, one construction represents functions by multivariate polynomials that output Yao's garbled circuits. If the degree in variables corresponding to private inputs is at most d, then the FE ciphertext must contain O(2^{d/2}) elements of a bilinear group. For Goldreich's PRG, d is at most 56, incurring an impractical number of elements.

#### iO from New Lattice Assumptions

Another line of research proposes lattice-based iO constructions. Most rely on newly introduced lattice assumptions, with a common structure summarized under the umbrella term "LWE-with-hints" assumptions. Informally, they claim that some LWE samples remain pseudorandom even if an adversary can access hints designed to leak additional information.

**Security concerns**:
- Subsequent work has exhibited counterexamples demonstrating that hints can leak more information than intended
- However, this doesn't immediately break the iO constructions, as some underlying assumptions (like private-coin evasive LWE) are non-falsifiable
- The existence of a few counterexamples doesn't invalidate the assumption in all cases

**Efficiency perspective**:
- Conceptually simpler than constructions based on standard assumptions
- Can be realized using cryptographic primitives like FHE with fewer layers of composition
- Still has bottleneck: simulating homomorphic evaluation algorithm of FHE scheme on key-homomorphic encodings

#### Diamond iO

To address the common bottleneck of dependence on the FE-to-iO transformation, we proposed **Diamond iO**, a lattice-based iO construction that removes dependence on conventional transformation methods by:

- Replacing recursive FE encryption with simple matrix multiplications using GGH15 encodings
- Using the AKY24 FE scheme in a non-black-box manner
- Proven secure under LWE and private-coin evasive LWE assumptions, plus our new "all-product LWE" assumption

**Implementation and vulnerability**:
- We implemented Diamond iO and evaluated its performance
- Discovered a vulnerability in an optimization introduced only in the implementation
- The theoretical construction remains secure as long as the underlying assumptions hold

**Scalability limitations**:
- Severely constrained in input size: for practical parameter choices, supports at most one dozen input bits
- As input size L grows, noise added to GGH15 encodings grows exponentially
- Requires increasing the encoding modulus q accordingly
- The bit-length log₂ q grows proportionally to input size L
- Asymptotic complexity of obfuscation and evaluation algorithms grows as O(L⁶)

**Benchmark results**:
- For four input bits: obfuscation takes 373 minutes, evaluation 85 minutes, obfuscated circuit size 8 GB
- Difficult to scale input size to a practically meaningful range with current construction

### 4.2 Our Roadmap toward Practical Implementation of Root iO

Our roadmap focuses primarily on improving efficiency, while further cryptanalysis of underlying lattice assumptions must proceed in parallel. This roadmap reflects what we currently believe to be the most direct path toward practical iO, but doesn't rule out alternative approaches.

#### Missing Components

Apart from verifiable FHE, the only components for which we have not yet found a practical implementation are:

1. **Homomorphic PRF evaluation** over key-homomorphic encodings
2. **SNARK verification** over key-homomorphic encodings

**We believe that if these two operations can be computed efficiently over the encodings, root iO can be made practical.**

#### Review of BGG+ Encodings

Let ℤ_q := ℤ/qℤ denote the integers modulo q for modulus q ≥ 2. The BGG+ encoding of integer x ∈ ℤ_q under a secret s ∈ ℤ_q^n and a public key A ∈ ℤ_q^{n×m} is:

```
Encode_{s,A}(x) := sA + (-x ⊗ G) + e
```

where:
- G ∈ ℤ_q^{n×m} is a fixed matrix called gadget matrix
- ⊗ denotes a tensor product operation
- e is a small (norm-bounded) error added to each term

**Key property**: BGG+ encodings support key-homomorphic evaluation of arithmetic circuits over encodings. One can publicly compute an encoding of circuit outputs from that of inputs, without knowing the secret s. Additionally, the public key in the output encoding can be deterministically derived only from the circuit and input public key, independent of the encoded inputs.

Two deterministic algorithms:

- **EvalPK(C, A) → A_C**: Given circuit C with L inputs and M outputs and input public key A ∈ ℤ_q^{n×Lm}, returns output public key A_C ∈ ℤ_q^{n×M}

- **EvalEnco(C, A, x, Encode_{s,A}(x)) → Encode_{s,A_C}(C(x))**: Given circuit C, input public key A, inputs x ∈ ℤ_q^L, input encoding, returns output encoding

The outputs satisfy:
```
Encode'_{s,A_C}(C(x)) = sA_C + C(x)
```

At a high level, the output encoding hides the outputs C(x) ∈ ℤ_q^M in the second term using the mask sA_C in the first term, which is unique to the secret s and the output public key A_C. Therefore, if a trusted party who knows s releases the mask sA_C by multiplying s and the output of the EvalPK algorithm, an evaluator running the EvalEnco algorithm can recover C(x) from the output encoding.

**Important limitation**: The mask doesn't allow the evaluator to learn outputs of circuits other than the specified circuit C. However, performing homomorphic multiplications between encodings requires the evaluator to know the corresponding inputs—the inputs must be public except when used only in linear computations.

#### Handling Private Multiplication Over Encodings

A common approach is to encode FHE encryptions of the private inputs and then evaluate a circuit C' that simulates FHE evaluation over encodings. By using existing techniques, one can decrypt FHE ciphertexts over the encodings without revealing the FHE secret key k.

However, the circuit output C'(·) contains not only the decryption result in its higher bits but also decryption errors in its lower bits because these decryption techniques don't perform rounding after an inner product between k and the ciphertexts. To prevent these errors from leaking to the evaluator, the AKY24 FE scheme additionally computes a homomorphic PRF over the encodings and adds its output in the lower bits, thereby masking the errors.

#### Homomorphic PRF over Encodings

Homomorphic PRF evaluation over encodings is essential for:
- Security (masking decryption errors as discussed above)
- Improving efficiency via noise refreshing (described below)

It requires a circuit that takes as input:
- An FHE encryption of a PRF key K_PRF
- A public seed s

And outputs FHE encryptions of pseudorandom values r where |r| is upper bounded by q (the modulus of both BGG+ encodings and FHE ciphertexts).

**Current challenge**: Even a single FHE multiplication over the encodings is not yet practical. This is mainly because multiplication over encodings requires the encoded integers to be significantly smaller than the encoding modulus q—typically just a few bits—to avoid large blow-up of errors after multiplication. Therefore, when using conventional BGG+ encodings, we need to simulate FHE evaluation by Boolean circuits, incurring large circuit size and multiplicative depth.

**Our improvement**: We introduced a method to evaluate lookup tables (LUTs) over BGG+ encodings. It packs many integers into a single encoding and processes multiple bits in a single LUT evaluation, thereby reducing circuit size and depth. For example, when simulating modulo-q multiplication over encodings, LUT evaluation reduces circuit size and multiplicative depth by factors of about 3 and 4, respectively, compared to Boolean-simulation baseline. However, even after this reduction, the depth still exceeds 150, which is an obstacle to finding practical parameters that satisfy both correctness and security.

**Promising approaches**:
1. Evaluate LWR-based PRF via a single programmable/functional bootstrapping of FHE
2. Evaluate FHE-friendly block ciphers or hash functions as PRF without FHE bootstrapping

#### Noise Refreshing of GGH15 Encodings

As described earlier, the current Diamond iO construction cannot support a large input size without increasing the modulus q since the noise added to the GGH15 encodings of the evaluator's input bits grows exponentially with the input size. The goal of noise refreshing is to periodically refresh the noise in GGH15 encodings by homomorphically computing new encodings of the same inputs whose error terms (noise) are freshly sampled via a PRF so that both the maximum noise magnitude and the modulus q grow at most polynomially in the input bit-length L of the circuit being obfuscated.

In Diamond iO, for every i ∈ {0,1,...,L}, the GGH15 encoding of first i bits of the evaluator's inputs x ∈ {0,1}^L is defined as:

```
P_{x_i} = ([1, x_i], s ⊗ [1, x_i]) B_i + e_{x_i}
```

where:
- x_i ∈ ℤ_q^i and e_{x_i} ∈ ℤ_q^m are a secret and an error unique to x_i
- B_i ∈ ℤ_q^{(i+1)n×m} is a public matrix sampled for each i (but independent of x)

For every i ∈ {1,...,L} and b ∈ {0,1}, the obfuscator provides a special matrix K_{i+1,b} (technically lattice preimages) such that multiplication between P_{x_i} and K_{i+1,b} produces the encoding of x_i|b (i.e., P_{x_i} K_{i+1,b} = P_{x_i|b}).

According to each bit of the inputs x_i ∈ {0,1}^i, the evaluator multiplies matrices, a process called input-insertion. After inserting all input bits, the evaluator multiplies the final GGH15 encoding by another special matrix K_out included in the obfuscated circuit that converts the GGH15 encoding of x ∈ {0,1}^L into a BGG+ encoding of the same inputs.

During these processes, because each error e_{x_i} grows multiplicatively by each matrix multiplication, the noise in the resulting BGG+ encoding increases exponentially in the input size L. This is why the error e_{x_i} must be periodically refreshed to a small value to make supported input size scalable.

**Noise refreshing procedure**: For example, consider refreshing GGH15 encodings every 8 input bits. For each i that is a multiple of 8, the evaluator evaluates the following circuit C_ref over the BGG+ encodings of x_i, the FHE encryption of the PRF key K_PRF, and the FHE secret key k:

1. Evaluate the homomorphic PRF on input an encryption of the PRF key K_PRF with the public seed (secret, i, x_i), obtaining an encryption of a fresh secret s'_{x_i} ∈ {0,±1}^n that is indistinguishable from a uniformly random vector in {0,±1}^n

2. Evaluate another homomorphic PRF on input an encryption of the PRF key K_PRF with the public seed (error, i, x_i), obtaining an encryption of a fresh error e'_{x_i} ∈ {0,±1}^m that is indistinguishable from a random vector sampled from an appropriate centered binomial distribution (CBD)

This refreshing allows the system to scale to larger input sizes by keeping noise growth polynomial rather than exponential.

---

## Comparison of Approaches

| Primitive | Trust Assumptions | Scalability |
|-----------|------------------|-------------|
| **FHE + MPC for decryption** | Ethereum validators + Ongoing t-out-of-n committee | Committee costs grow with demand |
| **FHE + MPC for obfuscation + Root iO** | Ethereum validators + n-out-of-n committee for one-time setup | No ongoing overhead after setup |

---

## Conclusion

This position paper presents a vision for a scalable private world computer based on root iO—a single application-agnostic obfuscated circuit that can realize arbitrary confidential smart contracts. Our approach offers significant advantages:

**Key advantages**:
- No ongoing trust assumptions beyond Ethereum validators after one-time setup
- No additional validator overhead for processing confidential vs public contracts
- On-chain verification costs comparable to signature verification
- Distributed obfuscation secure as long as at least one party is honest

**Remaining challenges**:
Assuming the security of our lattice-based Diamond iO construction, the remaining missing pieces are technically concrete:
1. Practical implementations of verifiable FHE
2. Practical homomorphic evaluation of PRF over key-homomorphic encodings
3. Practical SNARK verification over key-homomorphic encodings

Once these components are available, we can combine them to construct root iO without incurring prohibitive overhead, realizing a truly scalable private world computer that maintains Ethereum's decentralization while enabling confidential computation at scale.

---

## References

[References would be listed here in the full paper]

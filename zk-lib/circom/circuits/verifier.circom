pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template VerifySignature() {
    signal input message;
    signal input signature;
    signal input publicKey;
    signal output valid;
    
    // Poseidon hash for message authentication
    component hasher = Poseidon(1);
    hasher.inputs[0] <== message;
    
    // Verify signature (simplified for demo - use proper ECDSA for production)
    component sigVerify = ForceEqualIfEnabled();
    sigVerify.in[0] <== hasher.out;
    sigVerify.in[1] <== signature;
    sigVerify.enabled <== 1;
    
    valid <== sigVerify.out;
}

template RangeProof() {
    signal input value;
    signal input max;
    signal output inRange;
    
    component lessThan = LessThan(252);
    lessThan.in[0] <== value;
    lessThan.in[1] <== max;
    
    inRange <== lessThan.out;
}

template ZKVerifier() {
    signal input privateData;
    signal input publicData;
    signal input signature;
    signal input publicKey;
    signal input rangeMax;
    
    signal output isValid;
    
    // Verify signature authenticity
    component sigCheck = VerifySignature();
    sigCheck.message <== publicData;
    sigCheck.signature <== signature;
    sigCheck.publicKey <== publicKey;
    
    // Verify range proof for private data
    component rangeCheck = RangeProof();
    rangeCheck.value <== privateData;
    rangeCheck.max <== rangeMax;
    
    // Combine results
    isValid <== sigCheck.valid * rangeCheck.inRange;
}

component main = ZKVerifier();
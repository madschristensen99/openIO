pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

template PrivateSwap() {
    signal input fromAmount;
    signal input toAmount;
    signal input exchangeRate;
    signal input fee;
    signal input slippage;
    signal input privateKey;
    signal input recipient;
    
    signal output swapHash;
    signal output isValid;
    
    // Calculate expected output with fee
    signal expectedOutput;
    signal multiplier;
    multiplier <-- 10000 - fee;
    expectedOutput <-- (fromAmount * exchangeRate * multiplier) / 10000;
    
    // Verify within slippage tolerance
    signal minAmount;
    signal maxSlippage;
    maxSlippage <-- 10000 - slippage;
    minAmount <-- (expectedOutput * maxSlippage) / 10000;
    
    component checkMinAmount = GreaterEqThan(252);
    checkMinAmount.in[0] <== toAmount;
    checkMinAmount.in[1] <== minAmount;
    
    // Verify amounts are positive
    component checkFrom = GreaterThan(252);
    checkFrom.in[0] <== fromAmount;
    checkFrom.in[1] <== 0;
    
    component checkTo = GreaterThan(252);
    checkTo.in[0] <== toAmount;
    checkTo.in[1] <== 0;
    
    // Generate unique swap hash
    component hasher = Poseidon(7);
    hasher.inputs[0] <== fromAmount;
    hasher.inputs[1] <== toAmount;
    hasher.inputs[2] <== exchangeRate;
    hasher.inputs[3] <== fee;
    hasher.inputs[4] <== slippage;
    hasher.inputs[5] <== privateKey;
    hasher.inputs[6] <== recipient;
    
    swapHash <== hasher.out;
    isValid <== checkMinAmount.out * checkFrom.out * checkTo.out;
}

template ZKSwap() {
    signal private input fromAmount;
    signal private input toAmount;
    signal private input exchangeRate;
    signal private input fee;
    signal private input slippage;
    signal private input privateKey;
    signal public input recipient;
    signal public input deadline;
    signal public input currentTime;
    
    signal output commitment;
    signal output valid;
    
    // Verify deadline
    component checkDeadline = GreaterEqThan(252);
    checkDeadline.in[0] <== deadline;
    checkDeadline.in[1] <== currentTime;
    
    // Verify swap parameters
    component swapVerify = PrivateSwap();
    swapVerify.fromAmount <== fromAmount;
    swapVerify.toAmount <== toAmount;
    swapVerify.exchangeRate <== exchangeRate;
    swapVerify.fee <== fee;
    swapVerify.slippage <== slippage;
    swapVerify.privateKey <== privateKey;
    swapVerify.recipient <== recipient;
    
    commitment <== swapVerify.swapHash;
    valid <== swapVerify.isValid * checkDeadline.out;
}

component main = ZKSwap();
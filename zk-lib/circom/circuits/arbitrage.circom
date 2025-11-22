pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

template ArbitrageVerifier() {
    signal input dex1Price;
    signal input dex2Price;
    signal input minProfit;
    signal input amount;
    signal input privateProof;
    signal output isProfitable;

    // Ensure prices are valid (non-zero)
    component checkDex1 = GreaterEqThan(252);
    checkDex1.in[0] <== dex1Price;
    checkDex1.in[1] <== 1;

    component checkDex2 = GreaterEqThan(252);
    checkDex2.in[0] <== dex2Price;
    checkDex2.in[1] <== 1;

    // Calculate price difference
    signal priceDiff;
    component sub = NonEqualChecker();
    sub.in[0] <== dex1Price;
    sub.in[1] <== dex2Price;
    
    priceDiff <-- (dex1Price > dex2Price) ? (dex1Price - dex2Price) : (dex2Price - dex1Price);

    // Ensure profit meets minimum
    component checkProfit = GreaterEqThan(252);
    checkProfit.in[0] <== priceDiff;
    checkProfit.in[1] <== minProfit;

    // Verify arbitrage opportunity
    isProfitable <== checkDex1.out * checkDex2.out * checkProfit.out;
}

template PriceCalculation() {
    signal input amount;
    signal input price;
    signal input fee;
    signal output amountOut;

    // Calculate output: amount * price * (1 - fee/10000)
    signal multiplier;
    multiplier <-- 10000 - fee;
    
    // Ensure final amount is positive
    component checkPositive = GreaterEqThan(252);
    checkPositive.in[0] <-- amount * price * multiplier;
    checkPositive.in[1] <== 1;
    
    amountOut <-- (amount * price * multiplier) / 10000;
}

template ZKArbitrage() {
    signal input dex1Price;
    signal input dex2Price;
    signal input amount;
    signal input fee1;
    signal input fee2;
    signal input minProfit;
    signal input slippage;
    signal input privateKey;
    
    signal output arbitrageId;
    signal output isValid;
    
    // Generate unique arbitrage ID
    component hasher = Poseidon(7);
    hasher.inputs[0] <== dex1Price;
    hasher.inputs[1] <== dex2Price;
    hasher.inputs[2] <== amount;
    hasher.inputs[3] <== fee1;
    hasher.inputs[4] <== fee2;
    hasher.inputs[5] <== minProfit;
    hasher.inputs[6] <== slippage;
    
    arbitrageId <== hasher.out;
    
    // Calculate net profit after both fees
    signal price1, price2;
    component calc1 = PriceCalculation();
    calc1.amount <== amount;
    calc1.price <== dex1Price;
    calc1.fee <== fee1;
    price1 <-- calc1.amountOut;
    
    component calc2 = PriceCalculation();
    calc2.amount <== amount;
    calc2.price <== dex2Price;
    calc2.fee <== fee2;
    price2 <-- calc2.amountOut;
    
    signal profit;
    profit <-- price1 > price2 ? (price1 - price2) : (price2 - price1);
    
    // Verify profitability
    component checkProfit = GreaterEqThan(252);
    checkProfit.in[0] <== profit;
    checkProfit.in[1] <== minProfit;
    
    // Verify slippage tolerance
    component checkSlippage = GreaterEqThan(252);
    signal maxSlippage;
    maxSlippage <-- (dex1Price * slippage) / 10000;
    checkSlippage.in[0] <== profit;
    checkSlippage.in[1] <== maxSlippage;
    
    isValid <== checkProfit.out * checkSlippage.out;
}

component main = ZKArbitrage();
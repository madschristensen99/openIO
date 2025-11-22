#!/bin/bash

# Simple script to start local anvil nodes for openIO deployment
echo "Starting local blockchain nodes..."
cd /home/remsee/openIO/symbiotic

# Kill any existing processes
pkill -f anvil || true

# Start anvil nodes in background
anvil --chain-id 31337 --accounts 10 --balance 10000 --fork-url http://localhost:8545 --rpc-url http://localhost:8545 --host 0.0.0.0 --port 8545 &
ANVIL_PID=$!

# Start settlement node
anvil --chain-id 31338 --accounts 5 --balance 5000 --host 0.0.0.0 --port 8546 --rpc-url http://localhost:8546 &
ANVIL_SETTLEMENT_PID=$!

# Wait for nodes to start
echo "Waiting for nodes to start..."
sleep 3

# Check if nodes are ready
if curl -s http://localhost:8545 > /dev/null; then
    echo "✓ Main chain ready on http://localhost:8545"
else
    echo "✗ Failed to start main chain"
    exit 1
fi

if curl -s http://localhost:8546 > /dev/null; then
    echo "✓ Settlement chain ready on http://localhost:8546"
else
    echo "✗ Failed to start settlement chain"
    exit 1
fi

echo "Local nodes are ready!"
echo "ANVIL_PID=$ANVIL_PID"
echo "ANVIL_SETTLEMENT_PID=$ANVIL_SETTLEMENT_PID"

# Function to stop nodes stop_nodes() {
#   kill $ANVIL_PID 2>/dev/null || true
#   kill $ANVIL_SETTLEMENT_PID 2>/dev/null || true
# }
#
# trap stop_nodes EXIT

echo "Press Ctrl+C to stop both nodes"
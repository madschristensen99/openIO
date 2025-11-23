#!/bin/bash

# ZK Development Environment Setup Script
echo "🔒 Setting up ZK Development Environment for Circom and Noir..."

# Create project structure
echo "📁 Creating ZK project structure..."
mkdir -p zk-projects/{templates,examples,builds}
mkdir -p zk-projects/circom/{circuits,tests,build}
mkdir -p zk-projects/noir/{src,tests,build}

# Install required global tools
echo "🛠️ Installing global tools and dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install Circom-related tools
echo "📦 Installing Circom compiler and snarkjs..."
npx circom --version 2>/dev/null || npm install -g circom
npm install -g snarkjs

# Install Noir
if ! command -v noir &> /dev/null; then
    echo "📦 Installing Noir..."
    curl -L https://raw.githubusercontent.com/noir-lang/noir/main/install/install.sh | bash
fi

# Set up project templates
echo "📝 Setting up project templates..."

# Create package.json for template projects
cat > zk-projects/circom/package.json << 'EOF'
{
  "name": "circuit-development",
  "version": "1.0.0",
  "scripts": {
    "install-circom": "npm install -g circom@latest",
    "check": "python -c \"import subprocess; subprocess.run(['circom', '--version'])\"",
    "compile": "bash compile.sh",
    "setup": "bash setup.sh",
    "prove": "bash prove.sh",
    "verify": "bash verify.sh"
  },
  "dependencies": {
    "circomlib": "^2.0.5",
    "snarkjs": "^0.7.4"
  }
}
EOF

# Create compilation script for circom
cat > zk-projects/circom/compile.sh << 'EOF'
#!/bin/bash
if [ $# -eq 0 ]; then
    echo "Usage: $0 <circuit-name>"
    exit 1
fi

CIRCUIT=$1
echo "🔧 Compiling $CIRCUIT..."
circom $CIRCUIT.circom --r1cs --wasm --sym
echo "✓ Compiled ${CIRCUIT}.circom to build/${CIRCUIT}/"
EOF

# Create Noir project structure
cat > zk-projects/noir/Nargo.toml << 'EOF'
[package]
name = "noir_zk_circuits"
type = "bin"
version = "0.1.0"

[dependencies]
EOF

# Create example circuits
echo "🎯 Creating example circuits..."

# Simple Multiplier for Circom
cat > zk-projects/circom/circuits/multiplier.circom << 'EOF'
pragma circom 2.0.0;

// A simple template for multiplying two numbers
template Multiplier() {
    signal input a;
    signal input b;
    signal output c;
    
    c <== a * b;
}

component main = Multiplier();
EOF

# Simple Multiplier for Noir
cat > zk-projects/noir/src/main.nr << 'EOF'
fn main(x: Field, y: Field) -> pub Field {
    x * y
}
EOF

# Create example inputs
cat > zk-projects/circom/input.json << 'EOF'
{
    "a": 5,
    "b": 7
}
EOF

cat > zk-projects/noir/Prover.toml << 'EOF'
x = 5
y = 7
EOF

cat > zk-projects/noir/Verifier.toml << 'EOF'
return = 35
EOF

# Create deployment utilities
cat > zk-projects/deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying ZK Circuit to Boundless..."
echo "📋 Deployment Configuration:"
echo "   - Network: boundless-testnet"
echo "   - Verifier: Standard Groth16"
echo ""

if [ -f "build/verification_key.json" ]; then
    echo "✓ Verification key found"
elif [ -f "target/noir_zk_circuits.json" ]; then
    echo "✓ Noir build artifacts found"
else
    echo "❌ No build artifacts found. Please compile your circuit first."
    exit 1
fi

echo "✨ Deployment simulation complete!"
echo "🔗 Use /dapp/deploy to deploy via the web interface"
EOF

# Make scripts executable
chmod +x zk-projects/circom/compile.sh zk-projects/deploy.sh

# Create configuration
cat > zk-projects/config.json << 'EOF'
{
  "boundless": {
    "network": "testnet",
    "verifier": "standard-groth16",
    "timeout": 300
  },
  "compilers": {
    "circom": {
      "version": "2.0.0",
      "libraries": ["circomlib", "circomlibjs"]
    },
    "noir": {
      "version": "1.0.0-beta",
      "backend": "barretenberg"
    }
  }
}
EOF

# Create README
cat > zk-projects/README.md << 'EOF'
# ZK Development Environment

## Quick Start
1. **Create Project**: Use `/dapp/zk` to create new projects
2. **Compile**: Use Circom or Noir compilers
3. **Deploy**: Use Boundless network integration

## Directory Structure
```
zk-projects/
├── circom/
│   ├── circuits/        # Circuit source code
│   ├── tests/          # Test files
│   └── build/          # Build artifacts
├── noir/
│   ├── src/            # Noir source files
│   ├── tests/          # Noir tests
│   └── build/          # Build artifacts
├── examples/           # Example circuits
├── templates/          # Project templates
└── configs/            # Configuration files
```

## Available Commands
- `npm run compile` - Compile circuits
- `npm run prove` - Generate proofs
- `npm run verify` - Verify proofs
- `npm run deploy` - Deploy to networks

## Support
- Circom: snarkjs + circomlib
- Noir: Nargo + barretenberg backend
- Deployment: Boundless network integration
EOF

echo "✅ ZK Development Environment setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Visit /dapp/zk to create your first circuit"
echo "2. Use /dapp/deploy for deployment options"
echo "3. Check zk-projects/README.md for detailed instructions"
echo ""
echo "🎉 Ready to build zero-knowledge circuits!"
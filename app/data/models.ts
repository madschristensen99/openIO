export type ModelCategory = 'zk' | 'fhe' | 'io' | 'operation';

export interface Model {
  id: string;
  name: string;
  author: string;
  category: ModelCategory;
  description: string;
  downloads: string;
  likes: string;
  updated: string;
  parameters?: string;
  tags?: string[];
}

export const models: Model[] = [
  // ZK Circuits
  {
    id: 'zk-verifier',
    name: 'ZK Verifier Circuit',
    author: 'openio',
    category: 'zk',
    description: 'Zero-knowledge proof verifier circuit for private computation',
    downloads: '12.4k',
    likes: '1.2k',
    updated: '2 hours ago',
    parameters: '2.3M gates',
    tags: ['ZK', 'verification', 'circuit'],
  },
  {
    id: 'zk-prover',
    name: 'ZK Prover Circuit',
    author: 'zk-dev',
    category: 'zk',
    description: 'High-performance ZK proof generation circuit',
    downloads: '8.7k',
    likes: '856',
    updated: '5 hours ago',
    parameters: '5.1M gates',
    tags: ['ZK', 'proving', 'circuit'],
  },
  {
    id: 'zk-arbitrage',
    name: 'Arbitrage Proof Circuit',
    author: 'openio',
    category: 'zk',
    description: 'ZK circuit for private arbitrage strategy verification',
    downloads: '15.2k',
    likes: '2.1k',
    updated: '1 day ago',
    parameters: '8.7M gates',
    tags: ['ZK', 'arbitrage', 'defi'],
  },
  {
    id: 'zk-swap',
    name: 'Private Swap Verifier',
    author: 'defi-builder',
    category: 'zk',
    description: 'ZK circuit for verifying private swap transactions',
    downloads: '9.1k',
    likes: '643',
    updated: '3 days ago',
    parameters: '4.2M gates',
    tags: ['ZK', 'swap', 'defi'],
  },
  {
    id: 'zk-circom',
    name: 'Circom Circuit',
    author: 'circom-dev',
    category: 'zk',
    description: 'Zero-knowledge circuit written in Circom language for SNARKs',
    downloads: '24.3k',
    likes: '3.2k',
    updated: '1 hour ago',
    parameters: '3.2M gates',
    tags: ['Circom', 'SNARK', 'circuit', 'ZK'],
  },
  {
    id: 'zk-risczero',
    name: 'Risc Zero Circuit',
    author: 'risczero',
    category: 'zk',
    description: 'Zero-knowledge VM execution proofs using Risc Zero zkVM',
    downloads: '18.7k',
    likes: '2.8k',
    updated: '3 hours ago',
    parameters: '1.8M constraints',
    tags: ['Risc Zero', 'zkVM', 'ZK', 'STARK'],
  },
  {
    id: 'zk-cairo',
    name: 'Cairo Circuit',
    author: 'starkware',
    category: 'zk',
    description: 'STARK-based ZK proofs generated from Cairo programs',
    downloads: '31.5k',
    likes: '5.1k',
    updated: '30 minutes ago',
    parameters: '4.7M traces',
    tags: ['Cairo', 'STARK', 'StarkWare', 'ZK'],
  },
  {
    id: 'zk-noir',
    name: 'Noir Circuit',
    author: 'aztec-protocol',
    category: 'zk',
    description: 'Zero-knowledge circuits written in Noir language for Aztec',
    downloads: '22.1k',
    likes: '3.7k',
    updated: '2 hours ago',
    parameters: '2.9M gates',
    tags: ['Noir', 'Aztec', 'ZK-SNARK', 'circuit'],
  },

  // FHE Engines
  {
    id: 'fhe-encrypt',
    name: 'FHE Encryption Engine',
    author: 'openio',
    category: 'fhe',
    description: 'Fully homomorphic encryption engine for private computation',
    downloads: '11.3k',
    likes: '1.5k',
    updated: '6 hours ago',
    parameters: '1.2M ops',
    tags: ['FHE', 'encryption', 'compute'],
  },
  {
    id: 'fhe-compute',
    name: 'FHE Compute Engine',
    author: 'crypto-research',
    category: 'fhe',
    description: 'High-performance FHE computation engine',
    downloads: '9.7k',
    likes: '892',
    updated: '1 day ago',
    parameters: '890k ops',
    tags: ['FHE', 'computation', 'engine'],
  },
  {
    id: 'fhe-ckks',
    name: 'CKKS Encryption Engine',
    author: 'openio',
    category: 'fhe',
    description: 'CKKS scheme implementation for approximate FHE',
    downloads: '10.5k',
    likes: '1.1k',
    updated: '3 days ago',
    parameters: '1.5M ops',
    tags: ['FHE', 'CKKS', 'approximate'],
  },
  {
    id: 'fhe-bgv',
    name: 'BGV Compute Engine',
    author: 'fhe-dev',
    category: 'fhe',
    description: 'BGV scheme FHE engine for exact computation',
    downloads: '8.9k',
    likes: '756',
    updated: '4 days ago',
    parameters: '1.1M ops',
    tags: ['FHE', 'BGV', 'exact'],
  },
  {
    id: 'fhe-zama',
    name: 'Zama FHE Engine',
    author: 'zama-fhe',
    category: 'fhe',
    description: 'Concrete-ML Zama framework for TFHE-based FHE computation',
    downloads: '41.2k',
    likes: '6.8k',
    updated: '15 minutes ago',
    parameters: '3.2M ops',
    tags: ['Zama', 'TFHE', 'FHE', 'machine-learning', 'Concrete-ML'],
  },
  {
    id: 'fhe-fhenix',
    name: 'Fhenix FHE Engine',
    author: 'fhenix-protocol',
    category: 'fhe',
    description: 'Fhenix network FHE engine for smart contract computation',
    downloads: '28.7k',
    likes: '4.3k',
    updated: '1 hour ago',
    parameters: '2.7M ops',
    tags: ['Fhenix', 'FHE', 'smart-contracts', 'EVM', 'network'],
  },

  // iO Coprocessors
  {
    id: 'io-seal',
    name: 'iO Seal Coprocessor',
    author: 'openio',
    category: 'io',
    description: 'Indistinguishability obfuscation seal processor',
    downloads: '6.3k',
    likes: '542',
    updated: '1 day ago',
    parameters: 'Sealed',
    tags: ['iO', 'seal', 'obfuscation'],
  },
  {
    id: 'io-execute',
    name: 'iO Execute Coprocessor',
    author: 'openio',
    category: 'io',
    description: 'iO execution engine for sealed logic',
    downloads: '7.8k',
    likes: '623',
    updated: '2 days ago',
    parameters: 'Sealed',
    tags: ['iO', 'execute', 'runtime'],
  },
  {
    id: 'io-contract',
    name: 'iO Contract Template',
    author: 'openio',
    category: 'io',
    description: 'Template for building iO-sealed smart contracts',
    downloads: '15.2k',
    likes: '2.3k',
    updated: '1 week ago',
    parameters: 'Template',
    tags: ['iO', 'contract', 'template'],
  },
  {
    id: 'io-arbitrage',
    name: 'Sealed Arbitrage Strategy',
    author: 'crypto-dev',
    category: 'io',
    description: 'iO-sealed arbitrage trading strategy',
    downloads: '12.1k',
    likes: '1.8k',
    updated: '3 days ago',
    parameters: 'Sealed',
    tags: ['iO', 'arbitrage', 'trading'],
  },

  // Operations
  {
    id: 'op-add',
    name: 'Add Operation',
    author: 'openio',
    category: 'operation',
    description: 'Basic addition operation for privacy computation',
    downloads: '4.2k',
    likes: '234',
    updated: '5 hours ago',
    tags: ['operation', 'arithmetic', 'basic'],
  },
  {
    id: 'op-multiply',
    name: 'Multiply Operation',
    author: 'openio',
    category: 'operation',
    description: 'Multiplication operation for encrypted computation',
    downloads: '3.8k',
    likes: '198',
    updated: '1 day ago',
    tags: ['operation', 'arithmetic', 'basic'],
  },
  {
    id: 'op-compare',
    name: 'Compare Operation',
    author: 'openio',
    category: 'operation',
    description: 'Comparison operation for private data',
    downloads: '2.9k',
    likes: '156',
    updated: '2 days ago',
    tags: ['operation', 'comparison', 'logic'],
  },
  {
    id: 'op-aggregate',
    name: 'Aggregate Operation',
    author: 'openio',
    category: 'operation',
    description: 'Aggregation operation for encrypted datasets',
    downloads: '5.1k',
    likes: '312',
    updated: '1 week ago',
    tags: ['operation', 'aggregation', 'data'],
  },
];

export const getModelsByCategory = (category: ModelCategory): Model[] => {
  return models.filter(model => model.category === category);
};

export const getModelById = (id: string): Model | undefined => {
  return models.find(model => model.id === id);
};

export const searchModels = (query: string): Model[] => {
  const lowerQuery = query.toLowerCase();
  return models.filter(model =>
    model.name.toLowerCase().includes(lowerQuery) ||
    model.description.toLowerCase().includes(lowerQuery) ||
    model.author.toLowerCase().includes(lowerQuery) ||
    model.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};


'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DappMainPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const features = [
    {
      id: 'zk-dev',
      title: 'ZK Circuits',
      description: 'Build and deploy zero-knowledge circuits with Circom and Noir',
      link: '/dapp/zk',
      icon: '🔒',
      color: 'bg-purple-100 border-purple-200 hover:bg-purple-200',
    },
    {
      id: 'builder',
      title: 'Circuit Builder',
      description: 'Visual circuit construction tool with drag-and-drop interface',
      link: '/dapp/builder',
      icon: '🏗️',
      color: 'bg-blue-100 border-blue-200 hover:bg-blue-200',
    },
    {
      id: 'models',
      title: 'AI Models',
      description: 'Deploy and manage machine learning models for circuit generation',
      link: '/dapp/models',
      icon: '🤖',
      color: 'bg-green-100 border-green-200 hover:bg-green-200',
    },
    {
      id: 'deploy',
      title: 'Deploy',
      description: 'Deploy circuits to production environments and testnets',
      link: '/dapp/deploy',
      icon: '🚀',
      color: 'bg-orange-100 border-orange-200 hover:bg-orange-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            OpenZK - Zero Knowledge Development Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Build, deploy, and operate zero-knowledge circuits with Circom and Noir. 
            From development to production deployment in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.link}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`block p-6 border-2 rounded-lg transition-all duration-200 ${feature.color} ${
                hoveredCard === feature.id ? 'transform -translate-y-1 shadow-lg' : ''
              }`}
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{feature.icon}</span>
                <h3 className="text-xl font-bold">{feature.title}</h3>
              </div>
              <p className="text-gray-700">{feature.description}</p>
              <div className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800">
                Get Started →
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
            <p className="text-gray-600 mb-6">
              Ready to build your first zero-knowledge circuit? Get started in minutes with our templates.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/dapp/zk"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create ZK Project
              </Link>
              <Link
                href="/dapp/deploy"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                View Deployments
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🔧</div>
              <h3 className="font-bold mb-2">Circuit Templates</h3>
              <p className="text-sm text-gray-600">
                Start with battle-tested templates for age verification, 
                hash commitments, and more.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Live Testing</h3>
              <p className="text-sm text-gray-600">
                Compile and test circuits in real-time with immediate feedback 
                on constraints and performance.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="font-bold mb-2">Multi-Chain Deployment</h3>
              <p className="text-sm text-gray-600">
                Deploy your circuits to Ethereum, Optimism, Arbitrum, 
                and other EVM-compatible networks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
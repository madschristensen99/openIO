'use client';

import { useState } from 'react';
import ZKCircuitEditor from './ZKCircuitEditor';
import ZKProjectCreator from './ZKProjectCreator';

export default function ZKDevelopmentPage() {
  const [activeTab, setActiveTab] = useState<'editor' | 'create'>('editor');
  const [circuitType, setCircuitType] = useState<'circom' | 'noir'>('circom');

  return (
    <div className="zk-development-page p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">ZK Circuit Development</h1>
          <p className="text-gray-600">
            Design, compile, and deploy zero-knowledge circuits with advanced tooling and templates.
          </p>
        </div>

        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Project
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'editor'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Circuit Editor
          </button>
        </div>

        {activeTab === 'create' && (
          <div className="animate-fadeIn">
            <ZKProjectCreator />
          </div>
        )}

        {activeTab === 'editor' && (
          <div>
            <div className="mb-4">
              <div className="flex gap-4 items-center">
                <label className="font-medium">Circuit Type:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCircuitType('circom')}
                    className={`px-3 py-1 rounded text-sm ${
                      circuitType === 'circom'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Circom
                  </button>
                  <button
                    onClick={() => setCircuitType('noir')}
                    className={`px-3 py-1 rounded text-sm ${
                      circuitType === 'noir'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Noir
                  </button>
                </div>
              </div>
            </div>
            
            <div className="animate-fadeIn">
              <ZKCircuitEditor type={circuitType} />
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Features Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-900">Circom Support</h4>
              <p className="text-blue-700">Complete circuit development with snarkjs integration</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Noir Circuits</h4>
              <p className="text-blue-700">Modern ZK language with Barretenberg backend</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Deployment Tools</h4>
              <p className="text-blue-700">One-click deployment to Boundless and other platforms</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
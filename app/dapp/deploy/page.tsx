'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { PhalaDeployUI } from '../components/PhalaDeployUI';

export default function DeployPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Deploy FHE Apps to TEE
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Deploy your Rust-based Fully Homomorphic Encryption applications to 
              Trusted Execution Environments like Phala Network with just one click.
            </p>
          </div>

          <PhalaDeployUI />

          <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">👨‍💻</div>
                <h4 className="font-semibold mb-1">1. Write FHE Code</h4>
                <p className="text-sm text-gray-600">
                  Use our code editor to write Rust FHE applications with the TFHE library
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚙️</div>
                <h4 className="font-semibold mb-1">2. Configure TEE</h4>
                <p className="text-sm text-gray-600">
                  Set runtime parameters like memory limits and timeouts for your TEE deployment
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🚀</div>
                <h4 className="font-semibold mb-1">3. One-Click Deploy</h4>
                <p className="text-sm text-gray-600">
                  Deploy your application to secure hardware enclaves with a single click
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
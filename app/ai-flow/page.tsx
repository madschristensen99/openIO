'use client';

import AIFlowGenerator from '../components/AIFlowGenerator';

export default function AIFlowPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Flow Diagram Generator</h1>
          <p className="mt-2 text-gray-600">
            Describe any flow or process, and our AI will generate a React Flow diagram for you
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '70vh' }}>
          <AIFlowGenerator />
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Examples</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Try these prompts:</h3>
              <ul className="space-y-1">
                <li>• &quot;Create a user authentication flow with login, registration, and password reset&quot;</li>
                <li>• &quot;Make an e-commerce checkout process with cart, payment, and confirmation&quot;</li>
                <li>• &quot;Design a simple blog post workflow: draft, review, publish, archive&quot;</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Features:</h3>
              <ul className="space-y-1">
                <li>• AI-powered diagram generation</li>
                <li>• Interactive React Flow visualization</li>
                <li>• Easy drag-and-drop interface</li>
                <li>• Real-time editing capabilities</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
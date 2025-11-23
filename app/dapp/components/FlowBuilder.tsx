'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const AIFlowGenerator = dynamic(() => import('../../components/AIFlowGenerator'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
});

export default function FlowBuilder() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">AI Flow Diagram Builder</h2>
        <p className="text-sm text-gray-600 mt-1">
          Generate React Flow diagrams with natural language prompts
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      {isExpanded && (
        <div style={{ height: '60vh' }}>
          <AIFlowGenerator />
        </div>
      )}
      
      {!isExpanded && (
        <div className="p-8 text-center text-gray-500">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-lg font-medium mb-2">Powered by Kimi AI</h3>
          <p className="text-sm">
            Expand to create intelligent flow diagrams with your KIMIKEY
          </p>
        </div>
      )}
    </div>
  );
}
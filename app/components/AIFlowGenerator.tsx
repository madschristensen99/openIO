'use client';

import { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  Node, 
  Edge, 
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Position,
  NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { OpenAI } from 'openai';

interface AIFlowGeneratorProps {
  className?: string;
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_KIMIKEY || process.env.KIMIKEY || 'dummy-key',
  baseURL: "https://api.moonshot.cn/v1",
});

export default function AIFlowGenerator({ className }: AIFlowGeneratorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const generateFlowDiagram = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const completion = await openai.chat.completions.create({
        model: "kimi-k2-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are a React Flow diagram generator. Based on the user's request, create a JSON response containing nodes and edges for a React Flow diagram.

Return a JSON object with this structure:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "default",
      "position": { "x": 100, "y": 100 },
      "data": { "label": "Node Label" },
      "style": {
        "background": "#ffffff",
        "border": "1px solid #ccc",
        "borderRadius": "8px",
        "padding": "10px"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "Label"
    }
  ]
}

Position nodes in a clear layout (grid-like) with appropriate spacing (150-300 units apart). Use distinct colors for different node types when appropriate.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      // Clean the response - remove markdown code blocks if present
      const cleanResponse = response.replace(/```json\n?|```\n?/g, '');
      const diagramData = JSON.parse(cleanResponse);

      setNodes(diagramData.nodes || []);
      setEdges(diagramData.edges || []);
      
    } catch (err: any) {
      console.error('Error generating diagram:', err);
      setError(err.message || 'Failed to generate diagram');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearDiagram = () => {
    setNodes([]);
    setEdges([]);
    setPrompt('');
    setError(null);
  };

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the flow diagram you want to create..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && generateFlowDiagram()}
          />
          <button
            onClick={generateFlowDiagram}
            disabled={isGenerating || !prompt.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
          <button
            onClick={clearDiagram}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mb-2">
            Error: {error}
          </div>
        )}
        
        <div className="text-xs text-gray-600">
          AI-powered React Flow diagram generator using Kimi API
        </div>
      </div>

      <div className="flex-1">
        {nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center text-gray-500">
              <h3 className="text-lg font-semibold mb-2">Generate a Flow Diagram</h3>
              <p>Describe the diagram you want to create and click generate</p>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="bg-gray-50"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
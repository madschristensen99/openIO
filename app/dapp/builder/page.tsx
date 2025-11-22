'use client';

import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Navbar from '../../components/Navbar';

const initialNodes: Node[] = [
  { 
    id: '1', 
    position: { x: 250, y: 100 }, 
    data: { label: 'ZK Circuit' },
    type: 'default',
  },
  { 
    id: '2', 
    position: { x: 100, y: 200 }, 
    data: { label: 'FHE Engine' },
    type: 'default',
  },
  { 
    id: '3', 
    position: { x: 400, y: 200 }, 
    data: { label: 'iO Module' },
    type: 'default',
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

export default function BuilderPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <>
      <Navbar />
      <div className="builder-page">
        <div className="builder-header">
          <h1 className="builder-title">Workflow Builder</h1>
          <p className="builder-subtitle">
            Drag and drop to build privacy computation workflows
          </p>
        </div>
        <div className="builder-flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="react-flow-dark"
          >
            <Background />
            <Controls />
            <MiniMap 
              nodeColor="#667eea"
              maskColor="rgba(0, 0, 0, 0.8)"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
            />
          </ReactFlow>
        </div>
      </div>
    </>
  );
}


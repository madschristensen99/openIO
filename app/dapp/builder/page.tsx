'use client';

import { useState, useCallback, useMemo } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Navbar from '../../components/Navbar';
import { models, getModelsByCategory, ModelCategory } from '../../data/models';
import AIChat from '../components/AIChat';

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

export default function BuilderPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedZK, setSelectedZK] = useState('');
  const [selectedFHE, setSelectedFHE] = useState('');
  const [selectedIO, setSelectedIO] = useState('');
  const [selectedOp, setSelectedOp] = useState('');
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(true);

  const zkModels = useMemo(() => getModelsByCategory('zk'), []);
  const fheModels = useMemo(() => getModelsByCategory('fhe'), []);
  const ioModels = useMemo(() => getModelsByCategory('io'), []);
  const opModels = useMemo(() => getModelsByCategory('operation'), []);

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

  const addNode = useCallback((label: string, category: string) => {
    const newNode: Node = {
      id: `${category}-${Date.now()}`,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { label },
      type: 'default',
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const handleZKChange = (value: string) => {
    setSelectedZK(value);
    if (value) {
      const model = zkModels.find(m => m.id === value);
      if (model) {
        addNode(model.name, 'zk');
        setSelectedZK(''); // Reset dropdown
      }
    }
  };

  const handleFHEChange = (value: string) => {
    setSelectedFHE(value);
    if (value) {
      const model = fheModels.find(m => m.id === value);
      if (model) {
        addNode(model.name, 'fhe');
        setSelectedFHE(''); // Reset dropdown
      }
    }
  };

  const handleIOChange = (value: string) => {
    setSelectedIO(value);
    if (value) {
      const model = ioModels.find(m => m.id === value);
      if (model) {
        addNode(model.name, 'io');
        setSelectedIO(''); // Reset dropdown
      }
    }
  };

  const handleOpChange = (value: string) => {
    setSelectedOp(value);
    if (value) {
      const model = opModels.find(m => m.id === value);
      if (model) {
        addNode(model.name, 'op');
        setSelectedOp(''); // Reset dropdown
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="builder-page">
        <div className="builder-header">
          <div className="builder-dropdowns">
            <div className="builder-dropdown-group">
              <label className="builder-dropdown-label">ZK Circuits</label>
              <select
                className="builder-dropdown"
                value={selectedZK}
                onChange={(e) => handleZKChange(e.target.value)}
              >
                <option value="">Add ZK Circuit</option>
                {zkModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="builder-dropdown-group">
              <label className="builder-dropdown-label">FHE Engines</label>
              <select
                className="builder-dropdown"
                value={selectedFHE}
                onChange={(e) => handleFHEChange(e.target.value)}
              >
                <option value="">Add FHE Engine</option>
                {fheModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="builder-dropdown-group">
              <label className="builder-dropdown-label">iO Coprocessors</label>
              <select
                className="builder-dropdown"
                value={selectedIO}
                onChange={(e) => handleIOChange(e.target.value)}
              >
                <option value="">Add iO Coprocessor</option>
                {ioModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="builder-dropdown-group">
              <label className="builder-dropdown-label">Operations</label>
              <select
                className="builder-dropdown"
                value={selectedOp}
                onChange={(e) => handleOpChange(e.target.value)}
              >
                <option value="">Add Operation</option>
                {opModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="builder-main-content">
          <div className={`builder-flow-container ${isAISidebarOpen ? 'with-sidebar' : ''}`}>
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
          
          <div className={`builder-ai-sidebar ${isAISidebarOpen ? 'open' : 'collapsed'}`}>
            <div className="ai-sidebar-header">
              <h3 className="ai-sidebar-title">AI Assistant</h3>
              <button 
                className="ai-sidebar-toggle"
                onClick={() => setIsAISidebarOpen(!isAISidebarOpen)}
                aria-label={isAISidebarOpen ? 'Minimize' : 'Expand'}
              >
                {isAISidebarOpen ? '−' : '+'}
              </button>
            </div>
            {isAISidebarOpen && (
              <div className="ai-sidebar-content">
                <AIChat />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


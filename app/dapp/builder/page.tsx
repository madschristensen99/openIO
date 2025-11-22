'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Navbar from '../../components/Navbar';
import { models, getModelsByCategory, ModelCategory } from '../../data/models';
import AIChat from '../components/AIChat';
import CodeEditor from '../components/CodeEditor';
import FileExplorer from '../components/FileExplorer';

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

interface CustomModule {
  id: string;
  name: string;
  filename: string;
  content: string;
  category: 'zk' | 'fhe' | 'io' | 'operation' | 'custom';
  createdAt: number;
}

// Dummy file contents
const dummyFileContents: Record<string, string> = {
  'module1.io': `// module1.io
// Example ZK Circuit Module

export function verifyProof(proof: any, publicInputs: any) {
  // ZK verification logic here
  return true;
}`,
  'module2.io': `// module2.io
// Example FHE Encryption Module

export function encryptData(data: any, key: any) {
  // FHE encryption logic here
  return encrypted;
}`,
  'module3.io': `// module3.io
// Example iO Coprocessor Module

export function processSealed(input: any) {
  // iO processing logic here
  return result;
}`
};

export default function BuilderPage() {
  const [mode, setMode] = useState<'code' | 'node'>('code');
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedZK, setSelectedZK] = useState('');
  const [selectedFHE, setSelectedFHE] = useState('');
  const [selectedIO, setSelectedIO] = useState('');
  const [selectedOp, setSelectedOp] = useState('');
  const [selectedCustom, setSelectedCustom] = useState('');
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(true);
  
  // Code Mode state
  const [customModules, setCustomModules] = useState<CustomModule[]>([]);
  const [files, setFiles] = useState<string[]>([
    'module1.io',
    'module2.io',
    'module3.io'
  ]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [currentFileContent, setCurrentFileContent] = useState<string>('');
  const [newFileName, setNewFileName] = useState<string>('');

  const zkModels = useMemo(() => getModelsByCategory('zk'), []);
  const fheModels = useMemo(() => getModelsByCategory('fhe'), []);
  const ioModels = useMemo(() => getModelsByCategory('io'), []);
  const opModels = useMemo(() => getModelsByCategory('operation'), []);

  // Get custom modules by category
  const customZKModules = useMemo(() => customModules.filter(m => m.category === 'zk'), [customModules]);
  const customFHEModules = useMemo(() => customModules.filter(m => m.category === 'fhe'), [customModules]);
  const customIOModules = useMemo(() => customModules.filter(m => m.category === 'io'), [customModules]);
  const customOpModules = useMemo(() => customModules.filter(m => m.category === 'operation'), [customModules]);
  const allCustomModules = useMemo(() => customModules, [customModules]);

  // Update files list when modules change (keep dummy files + custom modules)
  useEffect(() => {
    const customFiles = customModules.map(m => m.filename);
    const dummyFiles = ['module1.io', 'module2.io', 'module3.io'];
    setFiles([...dummyFiles, ...customFiles.filter(f => !dummyFiles.includes(f))]);
  }, [customModules]);

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

  const addNode = useCallback((label: string, category: string, moduleId?: string) => {
    const newNode: Node = {
      id: `${category}-${Date.now()}`,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { label, moduleId },
      type: 'default',
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  // Code Mode functions
  const handleCreateFile = useCallback(() => {
    if (!newFileName.trim()) return;
    const filename = newFileName.endsWith('.io') ? newFileName : `${newFileName}.io`;
    
    if (files.includes(filename)) {
      alert('File already exists!');
      return;
    }

    const newModule: CustomModule = {
      id: `custom-${Date.now()}`,
      name: filename.replace('.io', ''),
      filename,
      content: `// ${filename}\n// Write your module code here\n\nexport function main(input: any) {\n  // Your logic here\n  return input;\n}\n`,
      category: 'custom',
      createdAt: Date.now(),
    };

    setCustomModules(prev => [...prev, newModule]);
    setNewFileName('');
    setSelectedFile(filename);
    setCurrentFileContent(newModule.content);
  }, [newFileName, files]);

  const handleSelectFile = useCallback((filename: string) => {
    setSelectedFile(filename);
    // Check if it's a dummy file
    if (dummyFileContents[filename]) {
      setCurrentFileContent(dummyFileContents[filename]);
    } else {
      // Check if it's a custom module
      const module = customModules.find(m => m.filename === filename);
      if (module) {
        setCurrentFileContent(module.content);
      } else {
        setCurrentFileContent('');
      }
    }
  }, [customModules]);

  const handleSaveFile = useCallback(() => {
    if (!selectedFile) return;
    
    // Check if it's a dummy file that needs to be converted to a custom module
    const isDummyFile = dummyFileContents.hasOwnProperty(selectedFile);
    const existingModule = customModules.find(m => m.filename === selectedFile);
    
    if (isDummyFile && !existingModule) {
      // Convert dummy file to custom module
      const newModule: CustomModule = {
        id: `custom-${Date.now()}`,
        name: selectedFile.replace('.io', ''),
        filename: selectedFile,
        content: currentFileContent,
        category: 'custom',
        createdAt: Date.now(),
      };
      setCustomModules(prev => [...prev, newModule]);
    } else if (existingModule) {
      // Update existing custom module
      setCustomModules(prev => prev.map(m => 
        m.filename === selectedFile 
          ? { ...m, content: currentFileContent }
          : m
      ));
    } else {
      // Create new custom module from scratch
      const newModule: CustomModule = {
        id: `custom-${Date.now()}`,
        name: selectedFile.replace('.io', ''),
        filename: selectedFile,
        content: currentFileContent,
        category: 'custom',
        createdAt: Date.now(),
      };
      setCustomModules(prev => [...prev, newModule]);
    }
  }, [selectedFile, currentFileContent, customModules]);

  const handleDeleteFile = useCallback((filename: string) => {
    if (confirm(`Delete ${filename}?`)) {
      setCustomModules(prev => prev.filter(m => m.filename !== filename));
      if (selectedFile === filename) {
        setSelectedFile(null);
        setCurrentFileContent('');
      }
    }
  }, [selectedFile]);

  const handleSetModuleCategory = useCallback((filename: string, category: 'zk' | 'fhe' | 'io' | 'operation' | 'custom') => {
    setCustomModules(prev => prev.map(m => 
      m.filename === filename ? { ...m, category } : m
    ));
  }, []);

  const handleZKChange = (value: string) => {
    setSelectedZK(value);
    if (value) {
      if (value.startsWith('custom-')) {
        const module = customZKModules.find(m => m.id === value);
        if (module) {
          addNode(module.name, 'zk', module.id);
        }
      } else {
        const model = zkModels.find(m => m.id === value);
        if (model) {
          addNode(model.name, 'zk');
        }
      }
      setSelectedZK(''); // Reset dropdown
    }
  };

  const handleFHEChange = (value: string) => {
    setSelectedFHE(value);
    if (value) {
      if (value.startsWith('custom-')) {
        const module = customFHEModules.find(m => m.id === value);
        if (module) {
          addNode(module.name, 'fhe', module.id);
        }
      } else {
        const model = fheModels.find(m => m.id === value);
        if (model) {
          addNode(model.name, 'fhe');
        }
      }
      setSelectedFHE(''); // Reset dropdown
    }
  };

  const handleIOChange = (value: string) => {
    setSelectedIO(value);
    if (value) {
      if (value.startsWith('custom-')) {
        const module = customIOModules.find(m => m.id === value);
        if (module) {
          addNode(module.name, 'io', module.id);
        }
      } else {
        const model = ioModels.find(m => m.id === value);
        if (model) {
          addNode(model.name, 'io');
        }
      }
      setSelectedIO(''); // Reset dropdown
    }
  };

  const handleOpChange = (value: string) => {
    setSelectedOp(value);
    if (value) {
      if (value.startsWith('custom-')) {
        const module = customOpModules.find(m => m.id === value);
        if (module) {
          addNode(module.name, 'op', module.id);
        }
      } else {
        const model = opModels.find(m => m.id === value);
        if (model) {
          addNode(model.name, 'op');
        }
      }
      setSelectedOp(''); // Reset dropdown
    }
  };

  const handleCustomChange = (value: string) => {
    setSelectedCustom(value);
    if (value) {
      const module = allCustomModules.find(m => m.id === value);
      if (module) {
        addNode(module.name, module.category, module.id);
        setSelectedCustom(''); // Reset dropdown
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="builder-page">
        <div className="builder-header">
          <div className="builder-mode-selector">
            <button
              className={`mode-button ${mode === 'code' ? 'active' : ''}`}
              onClick={() => setMode('code')}
            >
              Code Mode
            </button>
            <button
              className={`mode-button ${mode === 'node' ? 'active' : ''}`}
              onClick={() => setMode('node')}
            >
              Node Mode
            </button>
          </div>
          
          {mode === 'code' ? (
            <div className="code-mode-header">
              <div className="file-creation">
                <input
                  type="text"
                  className="new-file-input"
                  placeholder="New module name (e.g., myModule)"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                />
                <button className="create-file-button" onClick={handleCreateFile}>
                  Create Module
                </button>
              </div>
              {selectedFile && (
                <div className="file-actions">
                  <select
                    className="category-select"
                    value={customModules.find(m => m.filename === selectedFile)?.category || 'custom'}
                    onChange={(e) => handleSetModuleCategory(selectedFile, e.target.value as any)}
                  >
                    <option value="custom">Custom</option>
                    <option value="zk">ZK Circuit</option>
                    <option value="fhe">FHE Engine</option>
                    <option value="io">iO Coprocessor</option>
                    <option value="operation">Operation</option>
                  </select>
                  <button className="save-file-button" onClick={handleSaveFile}>
                    Save
                  </button>
                  <button 
                    className="delete-file-button" 
                    onClick={() => handleDeleteFile(selectedFile)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="builder-dropdowns">
            <div className="builder-dropdown-group">
              <label className="builder-dropdown-label">ZK Circuits</label>
              <select
                className="builder-dropdown"
                value={selectedZK}
                onChange={(e) => handleZKChange(e.target.value)}
              >
                <option value="">Add ZK Circuit</option>
                {customZKModules.length > 0 && (
                  <optgroup label="Custom Modules">
                    {customZKModules.map(module => (
                      <option key={module.id} value={module.id}>
                        {module.name} (Custom)
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Pre-built Models">
                  {zkModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </optgroup>
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
                {customFHEModules.length > 0 && (
                  <optgroup label="Custom Modules">
                    {customFHEModules.map(module => (
                      <option key={module.id} value={module.id}>
                        {module.name} (Custom)
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Pre-built Models">
                  {fheModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </optgroup>
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
                {customIOModules.length > 0 && (
                  <optgroup label="Custom Modules">
                    {customIOModules.map(module => (
                      <option key={module.id} value={module.id}>
                        {module.name} (Custom)
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Pre-built Models">
                  {ioModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </optgroup>
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
                {customOpModules.length > 0 && (
                  <optgroup label="Custom Modules">
                    {customOpModules.map(module => (
                      <option key={module.id} value={module.id}>
                        {module.name} (Custom)
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Pre-built Models">
                  {opModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="builder-dropdown-group">
              <label className="builder-dropdown-label">Customs</label>
              <select
                className="builder-dropdown"
                value={selectedCustom}
                onChange={(e) => handleCustomChange(e.target.value)}
              >
                <option value="">Add Custom Module</option>
                {allCustomModules.length > 0 ? (
                  allCustomModules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.name} ({module.category})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No custom modules yet</option>
                )}
              </select>
            </div>
            </div>
          )}
        </div>
        <div className="builder-main-content">
          {mode === 'code' ? (
            <div className="code-mode-container">
              <div className="code-mode-sidebar">
                <FileExplorer
                  files={files}
                  selectedFile={selectedFile}
                  onSelectFile={handleSelectFile}
                />
              </div>
              <div className="code-mode-editor">
                {selectedFile ? (
                  <CodeEditor
                    filename={selectedFile}
                    content={currentFileContent}
                    onChange={setCurrentFileContent}
                  />
                ) : (
                  <div className="code-mode-empty">
                    <div className="empty-state">
                      <h3>No file selected</h3>
                      <p>Create a new module or select an existing file to start coding</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
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
          )}
          
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


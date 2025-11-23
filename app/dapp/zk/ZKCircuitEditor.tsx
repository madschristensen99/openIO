'use client';

import { useState, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import { ZKService } from './ZKService';

interface ZKCircuitEditorProps {
  type: 'circom' | 'noir';
}

export default function ZKCircuitEditor({ type }: ZKCircuitEditorProps) {
  const [zkService] = useState(() => new ZKService());
  const [circuitCode, setCircuitCode] = useState('');
  const [circuitName, setCircuitName] = useState('');
  const [inputs, setInputs] = useState<string>('{}');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResult, setCompilationResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Load templates when component mounts
  useEffect(() => {
    const templates = type === 'circom' 
      ? zkService.getCircomTemplates() 
      : zkService.getNoirTemplates();
    
    if (templates.length > 0) {
      setSelectedTemplate(templates[0].name);
      setCircuitCode(templates[0].template);
      setCircuitName(templates[0].name.toLowerCase().replace(/\s+/g, '-'));
    }
  }, [type, zkService]);

  const loadTemplate = (templateName: string) => {
    const templates = type === 'circom' 
      ? zkService.getCircomTemplates() 
      : zkService.getNoirTemplates();
    
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setCircuitCode(template.template);
      setCircuitName(template.name.toLowerCase().replace(/\s+/g, '-'));
    }
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setError('');
    setCompilationResult(null);

    try {
      let result;
      if (type === 'circom') {
        result = await zkService.compileCircom(circuitCode, circuitName);
      } else {
        result = await zkService.compileNoir(circuitCode, circuitName);
      }
      
      setCompilationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleProve = async () => {
    try {
      const parsedInputs = JSON.parse(inputs);
      const result = await zkService.proveCircuit({
        type,
        circuit: circuitCode,
        inputs: parsedInputs
      });
      
      setCompilationResult(prev => ({ ...prev, proof: result }));
      alert('Proof generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate proof');
    }
  };

  const templates = type === 'circom' 
    ? zkService.getCircomTemplates() 
    : zkService.getNoirTemplates();

  return (
    <div className="zk-circuit-editor p-4">
      <div className="editor-header">
        <h2 className="text-xl font-bold mb-4">{type.charAt(0).toUpperCase() + type.slice(1)} Circuit Development</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Template:</label>
          <select 
            value={selectedTemplate}
            onChange={(e) => {
              setSelectedTemplate(e.target.value);
              loadTemplate(e.target.value);
            }}
            className="border rounded px-2 py-1"
          >
            {templates.map(template => (
              <option key={template.name} value={template.name}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Circuit Name:</label>
          <input
            type="text"
            value={circuitName}
            onChange={(e) => setCircuitName(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            placeholder={`${type} circuit name...`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Circuit Code</h3>
          <CodeEditor
            filename={`${circuitName}.${type}`}
            content={circuitCode}
            onChange={setCircuitCode}
          />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Inputs (JSON)</h3>
          <textarea
            value={inputs}
            onChange={(e) => setInputs(e.target.value)}
            className="w-full h-32 rounded border p-2 font-mono text-sm"
            placeholder='{"a": 5, "b": 7}'
          />
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCompile}
              disabled={isCompiling}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isCompiling ? 'Compiling...' : 'Compile'}
            </button>
            
            <button
              onClick={handleProve}
              disabled={!compilationResult}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Generate Proof
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {compilationResult && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
              <h4 className="font-bold mb-2">Compilation Result:</h4>
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(compilationResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
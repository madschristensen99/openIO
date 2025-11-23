'use client';

import { useState } from 'react';
import { ZKService } from './ZKService';

interface ZKProjectCreatorProps {
  onProjectCreated?: (projectPath: string) => void;
}

interface ProjectConfig {
  name: string;
  type: 'circom' | 'noir';
  template?: string;
  description?: string;
  private: boolean;
}

export default function ZKProjectCreator({ onProjectCreated }: ZKProjectCreatorProps) {
  const [zkService] = useState(() => new ZKService());
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'circom' | 'noir'>('circom');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdProject, setCreatedProject] = useState<ProjectConfig | null>(null);
  const [files, setFiles] = useState<string[]>([]);

  const getAvailableTemplates = () => {
    return projectType === 'circom' 
      ? zkService.getCircomTemplates()
      : zkService.getNoirTemplates();
  };

  const validateProjectName = (name: string): boolean => {
    return /^[a-zA-Z0-9_-]+$/.test(name) && name.length > 0;
  };

  const handleCreateProject = async () => {
    if (!validateProjectName(projectName)) {
      alert('Please use only letters, numbers, hyphens and underscores in project name');
      return;
    }

    setIsCreating(true);

    try {
      // Simulate project creation
      const templates = getAvailableTemplates();
      const selected = templates.find(t => t.name === selectedTemplate);
      
      // Create project structure
      const projectConfig: ProjectConfig = {
        name: projectName,
        type: projectType,
        template: selectedTemplate,
        description,
        private: isPrivate
      };

      // Generate project files
      const projectFiles = [
        {
          name: `README.md`,
          content: `# ${projectName}

A ${projectType} zero-knowledge circuit project.

## Description
${description}

## Usage

### Prerequisites
- Node.js
- ${projectType === 'circom' ? 'SnarkJS' : 'Noir'}

### Setup
\`\`\`
npm install
\`\`\`

### Compile
\`\`\`
npm run compile
\`\`\`

### Generate Proof
\`\`\`
npm run prove
\`\`\`

### Verify
\`\`\`
npm run verify
\`\`\`
`
        },
        {
          name: `package.json`,
          content: JSON.stringify({
            name: projectName,
            version: "1.0.0",
            description: description,
            type: "commonjs",
            scripts: projectType === 'circom' ? {
              compile: "snarkjs groth16 compile",
              prove: "snarkjs groth16 prove",
              verify: "snarkjs groth16 verify",
              setup: "snarkjs groth16 setup"
            } : {
              compile: "nargo compile",
              prove: "nargo prove",
              verify: "nargo verify"
            },
            dependencies: projectType === 'circom' ? {
              "snarkjs": "^0.7.4",
              "circomlib": "^2.0.5"
            } : {
              "@noir-lang/noir_js": "^1.0.0-beta.1",
              "@noir-lang/backend_barretenberg": "^1.0.0-beta.1"
            }
          }, null, 2)
        },
        {
          name: projectType === 'circom' ? `${projectName}.circom` : `${projectName}.nr`,
          content: selected?.template || ''
        }
      ];

      // Add additional files based on type
      if (projectType === 'circom') {
        projectFiles.push(
          {
            name: 'compile.js',
            content: `const { exec } = require('child_process');

exec('circom ${projectName}.circom --r1cs --wasm --sym', (error, stdout, stderr) => {
  if (error) {
    console.error(\`Error: \${error.message}\`);
    return;
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
  console.log('Circuit compiled successfully!');
});`
          },
          {
            name: 'input.json',
            content: JSON.stringify({
              example: "inputs:",
              note: "replace with actual inputs",
              sample: { a: 1, b: 2 }
            }, null, 2)
          }
        );
      } else {
        projectFiles.push(
          {
            name: 'Nargo.toml',
            content: `[package]
name = "${projectName}"
type = "bin"
version = "0.1.0"

[dependencies]`
          },
          {
            name: 'Prover.toml',
            content: `# Example inputs - replace with actual values
value = 42
blinder = 12345`
          },
          {
            name: 'Verifier.toml',
            content: `# Public inputs - replace with actual values  
value = 42`
          }
        );
      }

      setCreatedProject(projectConfig);
      setFiles(projectFiles.map(f => f.name));

      if (onProjectCreated) {
        onProjectCreated(`/projects/${projectName}`);
      }

    } catch (error) {
      console.error('Project creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const templates = getAvailableTemplates();

  return (
    <div className="zk-project-creator p-4">
      <h2 className="text-xl font-bold mb-4">Create New ZK Project</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="project-config">
          <h3 className="font-semibold mb-3">Project Configuration</h3>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Project Name *</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="my-zk-circuit"
              required
            />
            <p className="text-sm text-gray-600 mt-1">Use only letters, numbers, hyphens and underscores</p>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Circuit Type *</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="circom"
                  checked={projectType === 'circom'}
                  onChange={() => setProjectType('circom')}
                  className="mr-2"
                />
                Circom
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="noir"
                  checked={projectType === 'noir'}
                  onChange={() => setProjectType('noir')}
                  className="mr-2"
                />
                Noir
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {templates.map(template => (
                <option key={template.name} value={template.name}>
                  {template.name} - {template.description}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 h-24"
              placeholder="Describe your circuit project..."
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="mr-2"
              />
              Private Project
            </label>
          </div>

          <button
            onClick={handleCreateProject}
            disabled={isCreating || !validateProjectName(projectName)}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Project'}
          </button>
        </div>

        <div className="project-preview">
          <h3 className="font-semibold mb-3">Project Preview</h3>
          
          <div className="bg-gray-100 p-4 rounded">
            <h4 className="font-bold">{projectName || 'project-name'}</h4>
            <p className="text-sm text-gray-600 mb-2">{projectType}</p>
            <p className="text-sm mb-3">{description || 'No description provided'}</p>
            
            {selectedTemplate && (
              <div className="mb-3">
                <strong>Template:</strong> {selectedTemplate}
              </div>
            )}

            <div className="text-sm">
              <div className="mb-2">
                <strong>Visibility:</strong> {isPrivate ? 'Private' : 'Public'}
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Generated Files:</h4>
              <ul className="text-sm space-y-1">
                {files.map(file => (
                  <li key={file} className="text-gray-700">• {file}</li>
                ))}
              </ul>
            </div>
          )}

          {createdProject && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
              <h4 className="font-bold text-green-800">Project Created!</h4>
              <p className="text-sm text-green-700">
                Your {projectType} project "{createdProject.name}" is ready.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Quick Start Guide</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>1. Choose a descriptive name for your circuit project</p>
          <p>2. Select between Circom or Noir based on your preference</p>
          <p>3. Pick from pre-made templates or start with a blank project</p>
          <p>4. The system will generate the basic file structure for you</p>
          <p>5. Customize the generated code and inputs for your specific use case</p>
        </div>
      </div>
    </div>
  );
}
'use client';

interface FileExplorerProps {
  files: string[];
  selectedFile: string | null;
  onSelectFile: (filename: string) => void;
}

export default function FileExplorer({ files, selectedFile, onSelectFile }: FileExplorerProps) {
  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.io')) return '📄';
    if (filename.endsWith('.json')) return '⚙️';
    if (filename.endsWith('.md')) return '📝';
    return '📄';
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h3>Files</h3>
      </div>
      <div className="file-list">
        {files.map((file) => (
          <div
            key={file}
            className={`file-item ${selectedFile === file ? 'active' : ''}`}
            onClick={() => onSelectFile(file)}
          >
            <span className="file-icon">{getFileIcon(file)}</span>
            <span className="file-name">{file}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


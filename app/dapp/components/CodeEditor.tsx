'use client';

import { useState, useEffect } from 'react';

interface CodeEditorProps {
  filename: string;
  content: string;
  onChange: (content: string) => void;
}

export default function CodeEditor({ filename, content, onChange }: CodeEditorProps) {
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content, filename]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onChange(newContent);
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <span className="editor-filename">{filename}</span>
      </div>
      <div className="editor-content">
        <textarea
          className="editor-textarea"
          value={localContent}
          onChange={handleChange}
          spellCheck={false}
          placeholder="// Start writing your sealed logic..."
        />
      </div>
    </div>
  );
}


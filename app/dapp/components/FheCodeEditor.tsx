'use client';

interface FheCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function FheCodeEditor({ value, onChange, className = '' }: FheCodeEditorProps) {
  return (
    <div className={`border rounded-lg ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-3 font-mono text-sm bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg resize-none"
        placeholder="// Your Rust FHE code here..."
        spellCheck={false}
      />
    </div>
  );
}
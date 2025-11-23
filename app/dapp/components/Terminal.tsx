'use client';

interface TerminalProps {
  output: string[];
}

export default function Terminal({ output }: TerminalProps) {
  return (
    <div className="terminal">
      <div className="terminal-header">
        <span className="terminal-title">Terminal</span>
      </div>
      <div className="terminal-content">
        {output.length === 0 ? (
          <div className="terminal-empty">
            <span className="terminal-prompt">$</span> Ready to compile and deploy
          </div>
        ) : (
          output.map((line, index) => (
            <div key={index} className="terminal-line">
              {line.startsWith('>') ? (
                <span className="terminal-prompt">{line}</span>
              ) : line.startsWith('✓') ? (
                <span className="terminal-success">{line}</span>
              ) : (
                <span>{line}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}


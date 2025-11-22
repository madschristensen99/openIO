'use client'

import { useState, useEffect } from 'react'

export default function RAGAgent() {
  const [status, setStatus] = useState<string>('Not uploaded')
  const [indexed, setIndexed] = useState<boolean>(false)
  const [question, setQuestion] = useState<string>('')
  const [answer, setAnswer] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [uploadLoading, setUploadLoading] = useState<boolean>(false)
  const [indexLoading, setIndexLoading] = useState<boolean>(false)
  const [rootHash, setRootHash] = useState<string>('')
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([])

  useEffect(() => {
    checkIndexStatus()
  }, [])

  const checkIndexStatus = async () => {
    try {
      const res = await fetch('/api/status')
      const data = await res.json()
      if (data.indexed) {
        setIndexed(true)
        setStatus('Indexed and ready')
        setRootHash(data.rootHash || '')
      }
    } catch (err) {
      console.error('Error checking status:', err)
    }
  }

  const handleUpload = async () => {
    setUploadLoading(true)
    setStatus('Uploading to 0G Storage...')
    try {
      const res = await fetch('/api/upload', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setRootHash(data.rootHash)
        setStatus(`Uploaded! Root Hash: ${data.rootHash.substring(0, 20)}...`)
      } else {
        setStatus(`Upload failed: ${data.error}`)
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setUploadLoading(false)
    }
  }

  const handleIndex = async () => {
    if (!rootHash) {
      setStatus('Please upload first')
      return
    }
    setIndexLoading(true)
    setStatus('Building RAG index (chunking & embedding)...')
    try {
      const res = await fetch('/api/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rootHash }),
      })
      const data = await res.json()
      if (data.success) {
        setIndexed(true)
        setStatus(`Indexed! ${data.chunks} chunks created`)
      } else {
        setStatus(`Indexing failed: ${data.error}`)
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setIndexLoading(false)
    }
  }

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !indexed) return

    setLoading(true)
    setAnswer('')
    const userMessage = { role: 'user', content: question }
    setChatHistory(prev => [...prev, userMessage])

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, chatHistory }),
      })
      const data = await res.json()
      if (data.success) {
        setAnswer(data.answer)
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }])
      } else {
        setAnswer(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setAnswer(`Error: ${err.message}`)
    } finally {
      setLoading(false)
      setQuestion('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          0G RAG Agent
        </h1>
        <p className="text-xl text-gray-300 mb-8">Diamond IO Codebase Expert</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-semibold mb-4">Step 1: Upload to 0G Storage</h2>
            <p className="text-gray-300 mb-4">Upload repomix-output.xml to decentralized storage</p>
            <button
              onClick={handleUpload}
              disabled={uploadLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:scale-100"
            >
              {uploadLoading ? 'Uploading...' : 'Upload XML File'}
            </button>
            {rootHash && (
              <div className="mt-4 p-3 bg-black/30 rounded-lg">
                <p className="text-xs text-gray-400">Root Hash:</p>
                <p className="text-sm font-mono text-green-400 break-all">{rootHash}</p>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-semibold mb-4">Step 2: Build RAG Index</h2>
            <p className="text-gray-300 mb-4">Chunk, embed & index the codebase</p>
            <button
              onClick={handleIndex}
              disabled={indexLoading || !rootHash}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:scale-100"
            >
              {indexLoading ? 'Indexing...' : 'Build RAG Index'}
            </button>
            <div className="mt-4 p-3 bg-black/30 rounded-lg">
              <p className="text-sm">
                <span className={indexed ? 'text-green-400' : 'text-yellow-400'}>
                  {indexed ? '✓ ' : '○ '}
                </span>
                {status}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-semibold mb-4">Step 3 & 4: Query the Agent</h2>
          
          <div className="mb-4 max-h-96 overflow-y-auto space-y-4">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600/30 ml-12'
                    : 'bg-purple-600/30 mr-12'
                }`}
              >
                <p className="text-xs text-gray-400 mb-1">
                  {msg.role === 'user' ? 'You' : 'DIO Expert Agent'}
                </p>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleQuery} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Ask a technical question:</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What does BenchCircuit::new_add_mul do?"
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/20 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-24"
                disabled={!indexed}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !indexed || !question.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:scale-100"
            >
              {loading ? 'Agent is thinking...' : 'Ask Agent'}
            </button>
          </form>

          {!indexed && (
            <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-200">
                ⚠️ Please upload and index the file first before querying
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-black/30 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-gray-400">Example Questions:</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• What does BenchCircuit::new_add_mul do?</li>
            <li>• Explain the role of switched_modulus in RunBenchConfig</li>
            <li>• How does BuildCircuit compute final gates?</li>
            <li>• What cryptographic primitives are used in the diamond-io system?</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

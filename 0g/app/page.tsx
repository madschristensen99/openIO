'use client'

import { useState, useEffect, useRef } from 'react'

export default function RAGAgent() {
  const [indexed, setIndexed] = useState<boolean>(false)
  const [question, setQuestion] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [indexLoading, setIndexLoading] = useState<boolean>(false)
  const [indexError, setIndexError] = useState<string>('')
  const [chunkCount, setChunkCount] = useState<number>(0)
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeIndex()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const initializeIndex = async () => {
    try {
      const statusRes = await fetch('/api/status')
      const statusData = await statusRes.json()
      
      if (statusData.indexed) {
        setIndexed(true)
        setChunkCount(statusData.chunks || 0)
      } else {
        setIndexLoading(true)
        const indexRes = await fetch('/api/index-local', { method: 'POST' })
        const indexData = await indexRes.json()
        
        if (indexData.success) {
          setIndexed(true)
          setChunkCount(indexData.chunks || 0)
        } else {
          setIndexError(indexData.error || 'Failed to index codebase. Please check your OpenAI API key.')
        }
      }
    } catch (err: any) {
      console.error('Error initializing index:', err)
      setIndexError(err.message || 'Failed to initialize. Please refresh the page.')
    } finally {
      setIndexLoading(false)
    }
  }

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !indexed || loading) return

    const userMessage = { role: 'user', content: question }
    setChatHistory(prev => [...prev, userMessage])
    setQuestion('')
    setLoading(true)

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, chatHistory }),
      })
      const data = await res.json()
      
      if (data.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }])
      } else {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${data.error}` 
        }])
      }
    } catch (err: any) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${err.message}` 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      <div className="max-w-4xl mx-auto flex flex-col h-screen">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Diamond IO Codebase Expert
          </h1>
          <p className="text-gray-300 mt-2">
            {indexLoading ? 'Indexing codebase...' : indexed ? `Ready • ${chunkCount} chunks indexed` : indexError ? 'Initialization failed' : 'Initializing...'}
          </p>
          {indexError && (
            <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-200">
              <strong>Error:</strong> {indexError}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {indexError && !indexed && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold mb-4">Unable to initialize RAG agent</h2>
              <p className="text-gray-300 max-w-md mx-auto">
                Please make sure you have provided your OpenAI API key in the Secrets tab and refresh the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition"
              >
                Refresh Page
              </button>
            </div>
          )}

          {chatHistory.length === 0 && indexed && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold mb-4">Ask me anything about the Diamond IO codebase</h2>
              <div className="max-w-2xl mx-auto text-left bg-white/5 rounded-lg p-6 space-y-2">
                <p className="text-sm text-gray-400 font-semibold mb-3">Example questions:</p>
                <button 
                  onClick={() => setQuestion('What does BenchCircuit::new_add_mul do?')}
                  className="block w-full text-left text-gray-300 hover:text-white hover:bg-white/10 p-3 rounded-lg transition"
                >
                  • What does BenchCircuit::new_add_mul do?
                </button>
                <button 
                  onClick={() => setQuestion('Explain the role of switched_modulus in RunBenchConfig')}
                  className="block w-full text-left text-gray-300 hover:text-white hover:bg-white/10 p-3 rounded-lg transition"
                >
                  • Explain the role of switched_modulus in RunBenchConfig
                </button>
                <button 
                  onClick={() => setQuestion('How does BuildCircuit compute final gates?')}
                  className="block w-full text-left text-gray-300 hover:text-white hover:bg-white/10 p-3 rounded-lg transition"
                >
                  • How does BuildCircuit compute final gates?
                </button>
                <button 
                  onClick={() => setQuestion('What cryptographic primitives are used in the diamond-io system?')}
                  className="block w-full text-left text-gray-300 hover:text-white hover:bg-white/10 p-3 rounded-lg transition"
                >
                  • What cryptographic primitives are used in the diamond-io system?
                </button>
              </div>
            </div>
          )}

          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl px-6 py-4 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'bg-white/10 backdrop-blur-lg border border-white/20'
                }`}
              >
                <p className="text-xs font-semibold mb-2 opacity-70">
                  {msg.role === 'user' ? 'You' : '🤖 DIO Expert'}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-3xl rounded-2xl px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20">
                <p className="text-xs font-semibold mb-2 opacity-70">🤖 DIO Expert</p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="p-6 border-t border-white/10 bg-gray-900/50 backdrop-blur-lg">
          <form onSubmit={handleQuery} className="flex gap-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleQuery(e)
                }
              }}
              placeholder={indexed ? "Ask about the codebase... (Shift+Enter for new line)" : "Indexing codebase, please wait..."}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              rows={2}
              disabled={!indexed || loading}
            />
            <button
              type="submit"
              disabled={loading || !indexed || !question.trim()}
              className="px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:opacity-50"
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

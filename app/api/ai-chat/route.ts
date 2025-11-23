// Server-only AI chat endpoint that proxies requests to askOpenIOAssistant with RAG context.
// Call with POST { message, page?, history? } and receive { assistantMessage }.
import { NextRequest, NextResponse } from 'next/server'
import { askOpenIOAssistant, type ChatMessage } from '../../../0g/lib/assistant'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const message = typeof body?.message === 'string' ? body.message.trim() : ''

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const page = body?.page === 'builder' || body?.page === 'deploy' ? body.page : undefined

    const history: ChatMessage[] | undefined = Array.isArray(body?.history)
      ? body.history
          .filter(
            (msg: any) =>
              msg &&
              (msg.role === 'user' || msg.role === 'assistant') &&
              typeof msg.content === 'string'
          )
          .map((msg: any) => ({ role: msg.role, content: msg.content }))
      : undefined

    const assistantMessage = await askOpenIOAssistant(message, { page, history })

    return NextResponse.json({ assistantMessage })
  } catch (error) {
    console.error('ai-chat route error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

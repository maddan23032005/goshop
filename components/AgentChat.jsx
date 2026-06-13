'use client'
import { useState, useRef, useEffect } from 'react'
import { BotIcon, SendIcon, XIcon, Loader2Icon, UserIcon, ZapIcon, ShoppingBagIcon } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

const AgentChat = () => {
    const { isSignedIn } = useUser()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '⚡ Hi! I\'m GoShop Agent — powered by LangGraph AI. I can:\n\n• 🔍 Search products for you\n• 📦 Check your orders\n• 💡 Give personalized recommendations\n• 🏪 Find store information\n\nWhat can I help you with?'
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [toolsUsed, setToolsUsed] = useState([])
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const quickActions = [
        '🔍 Find headphones under $50',
        '📦 Check my orders',
        '💡 Recommend products for me',
        '🏪 Show me top stores',
    ]

    const sendMessage = async (text = input) => {
        if (!text.trim() || loading) return

        const userMessage = { role: 'user', content: text }
        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setInput('')
        setLoading(true)
        setToolsUsed([])

        try {
            const res = await fetch('/api/ai/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.slice(-6),
                    userMessage: text,
                })
            })

            const data = await res.json()

            if (data.toolsUsed?.length > 0) {
                setToolsUsed(data.toolsUsed)
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.error || data.message
            }])

        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry something went wrong. Please try again!'
            }])
        } finally {
            setLoading(false)
        }
    }

    if (!isSignedIn) return null

    return (
        <>
            {/* Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-6 z-50 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${isOpen ? 'hidden' : 'flex'}`}
            >
                <ZapIcon size={22} />
            </button>

            {/* Window */}
            {isOpen && (
                <div className='fixed bottom-6 right-24 z-50 w-[350px] sm:w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200'>

                    {/* Header */}
                    <div className='bg-purple-600 p-4 flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='w-9 h-9 bg-white/20 rounded-full flex items-center justify-center'>
                                <ZapIcon size={20} className='text-white' />
                            </div>
                            <div>
                                <p className='text-white font-medium text-sm'>GoShop Agent</p>
                                <p className='text-purple-100 text-xs'>Helping Hands</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className='text-white/80 hover:text-white'>
                            <XIcon size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-3'>
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-purple-500' : 'bg-purple-600'}`}>
                                    {msg.role === 'user'
                                        ? <UserIcon size={14} className='text-white' />
                                        : <ZapIcon size={14} className='text-white' />
                                    }
                                </div>
                                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user'
                                        ? 'bg-purple-500 text-white rounded-tr-sm'
                                        : 'bg-slate-100 text-slate-700 rounded-tl-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Tools Used Indicator */}
                        {toolsUsed.length > 0 && (
                            <div className='flex flex-wrap gap-1 px-2'>
                                {toolsUsed.map((tool, index) => (
                                    <span key={index} className='text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full'>
                                        🔧 {tool.replace('_', ' ')}
                                    </span>
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className='flex gap-2'>
                                <div className='w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0'>
                                    <ZapIcon size={14} className='text-white' />
                                </div>
                                <div className='bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2'>
                                    <Loader2Icon size={14} className='text-slate-400 animate-spin' />
                                    <span className='text-xs text-slate-400'>Thinking + Using tools...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length === 1 && (
                        <div className='px-4 pb-2 flex flex-wrap gap-2'>
                            {quickActions.map((q, index) => (
                                <button
                                    key={index}
                                    onClick={() => sendMessage(q.slice(2))}
                                    className='text-xs px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full transition'
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                        className='p-4 border-t border-slate-100 flex gap-2'
                    >
                        <input
                            type='text'
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder='Ask agent anything...'
                            className='flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400'
                            disabled={loading}
                        />
                        <button
                            type='submit'
                            disabled={loading || !input.trim()}
                            className='w-9 h-9 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition shrink-0'
                        >
                            <SendIcon size={16} />
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}

export default AgentChat

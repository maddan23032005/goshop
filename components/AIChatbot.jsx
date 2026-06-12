'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircleIcon, XIcon, SendIcon, BotIcon, UserIcon, Loader2Icon } from 'lucide-react'

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Hi! I\'m GoShop AI Assistant. I can help you find products, track orders, and answer any questions. How can I help you today?'
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage = { role: 'user', content: input }
        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setInput('')
        setLoading(true)

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.slice(-10), // Last 10 messages for context
                })
            })

            const data = await res.json()

            if (data.message) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.message
                }])
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I\'m having trouble connecting. Please try again!'
            }])
        } finally {
            setLoading(false)
        }
    }

    const quickQuestions = [
        '🛍️ Find me a gift',
        '📦 Track my order',
        '💰 Best deals today',
        '🏪 How to open a store?',
    ]

    const handleQuickQuestion = (q) => {
        const text = q.replace(/^[\p{Emoji}\s]+/u, '').trim()
        setInput(text)
    }

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${isOpen ? 'hidden' : 'flex'}`}
            >
                <MessageCircleIcon size={24} />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className='fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200'>

                    {/* Header */}
                    <div className='bg-green-600 p-4 flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='w-9 h-9 bg-white/20 rounded-full flex items-center justify-center'>
                                <BotIcon size={20} className='text-white' />
                            </div>
                            <div>
                                <p className='text-white font-medium text-sm'>GoShop AI</p>
                                <p className='text-green-100 text-xs'>Always here to help</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className='text-white/80 hover:text-white transition'
                        >
                            <XIcon size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-3'>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {/* Avatar */}
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-green-500'}`}>
                                    {msg.role === 'user'
                                        ? <UserIcon size={14} className='text-white' />
                                        : <BotIcon size={14} className='text-white' />
                                    }
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-indigo-500 text-white rounded-tr-sm'
                                        : 'bg-slate-100 text-slate-700 rounded-tl-sm'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {loading && (
                            <div className='flex gap-2'>
                                <div className='w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0'>
                                    <BotIcon size={14} className='text-white' />
                                </div>
                                <div className='bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm'>
                                    <Loader2Icon size={16} className='text-slate-400 animate-spin' />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions — only shown at start */}
                    {messages.length === 1 && (
                        <div className='px-4 pb-2 flex flex-wrap gap-2'>
                            {quickQuestions.map((q, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickQuestion(q)}
                                    className='text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition'
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={sendMessage} className='p-4 border-t border-slate-100 flex gap-2'>
                        <input
                            type='text'
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder='Ask me anything...'
                            className='flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400'
                            disabled={loading}
                        />
                        <button
                            type='submit'
                            disabled={loading || !input.trim()}
                            className='w-9 h-9 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition shrink-0'
                        >
                            <SendIcon size={16} />
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}

export default AIChatbot

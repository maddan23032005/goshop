'use client'
import { useState, useRef, useEffect } from 'react'
import { SendIcon, XIcon, Loader2Icon, UserIcon, PackageIcon } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

const OrderAssistant = () => {
    const { isSignedIn } = useUser()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '📦 Hi! I\'m your Order Assistant. I have access to your complete order history. Ask me anything like:\n\n• "Where is my last order?"\n• "What did I buy last month?"\n• "Recommend something based on my purchases"'
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const quickQuestions = [
        '📦 Where is my last order?',
        '🛍️ What did I buy recently?',
        '💡 Recommend products for me',
        '💰 How much have I spent?',
    ]

    const sendMessage = async (text = input) => {
        if (!text.trim() || loading) return

        const userMessage = { role: 'user', content: text }
        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setInput('')
        setLoading(true)

        try {
            const res = await fetch('/api/ai/order-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: text,
                    messages: newMessages.slice(-6),
                })
            })

            const data = await res.json()

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.error || data.message
            }])

        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again!'
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
                className={`fixed bottom-6 left-6 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${isOpen ? 'hidden' : 'flex'}`}
            >
                <PackageIcon size={22} />
            </button>

            {/* Window */}
            {isOpen && (
                <div className='fixed bottom-6 left-6 z-50 w-[350px] sm:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200'>

                    {/* Header */}
                    <div className='bg-indigo-600 p-4 flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='w-9 h-9 bg-white/20 rounded-full flex items-center justify-center'>
                                <PackageIcon size={20} className='text-white' />
                            </div>
                            <div>
                                <p className='text-white font-medium text-sm'>Order Assistant</p>
                                <p className='text-indigo-100 text-xs'>Powered by GoShop RAG</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className='text-white/80 hover:text-white'
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
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-indigo-600'}`}>
                                    {msg.role === 'user'
                                        ? <UserIcon size={14} className='text-white' />
                                        : <PackageIcon size={14} className='text-white' />
                                    }
                                </div>
                                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user'
                                        ? 'bg-indigo-500 text-white rounded-tr-sm'
                                        : 'bg-slate-100 text-slate-700 rounded-tl-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className='flex gap-2'>
                                <div className='w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0'>
                                    <PackageIcon size={14} className='text-white' />
                                </div>
                                <div className='bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm'>
                                    <Loader2Icon size={16} className='text-slate-400 animate-spin' />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length === 1 && (
                        <div className='px-4 pb-2 flex flex-wrap gap-2'>
                            {quickQuestions.map((q, index) => (
                                <button
                                    key={index}
                                    onClick={() => sendMessage(q.slice(2))}
                                    className='text-xs px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition'
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
                            placeholder='Ask about your orders...'
                            className='flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400'
                            disabled={loading}
                        />
                        <button
                            type='submit'
                            disabled={loading || !input.trim()}
                            className='w-9 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition shrink-0'
                        >
                            <SendIcon size={16} />
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}

export default OrderAssistant

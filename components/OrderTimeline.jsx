const steps = [
    { status: 'ORDER_PLACED', label: 'Order Placed', desc: 'Your order has been placed successfully' },
    { status: 'PROCESSING', label: 'Processing', desc: 'Seller is preparing your order' },
    { status: 'SHIPPED', label: 'Shipped', desc: 'Your order is on the way' },
    { status: 'DELIVERED', label: 'Delivered', desc: 'Order delivered successfully' },
]

const OrderTimeline = ({ status }) => {
    const currentIndex = steps.findIndex(s => s.status === status)

    return (
        <div className='mt-4'>
            <div className='flex flex-col gap-0'>
                {steps.map((step, index) => {
                    const isCompleted = index <= currentIndex
                    const isCurrent = index === currentIndex

                    return (
                        <div key={step.status} className='flex gap-4'>
                            {/* Line + Circle */}
                            <div className='flex flex-col items-center'>
                                <div className={`w-4 h-4 rounded-full border-2 mt-1 transition-all ${
                                    isCompleted
                                        ? 'bg-green-500 border-green-500'
                                        : 'bg-white border-slate-300'
                                } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                                />
                                {index < steps.length - 1 && (
                                    <div className={`w-0.5 h-10 ${
                                        index < currentIndex
                                            ? 'bg-green-500'
                                            : 'bg-slate-200'
                                    }`} />
                                )}
                            </div>

                            {/* Content */}
                            <div className='pb-6'>
                                <p className={`text-sm font-medium ${
                                    isCompleted ? 'text-slate-700' : 'text-slate-400'
                                }`}>
                                    {step.label}
                                </p>
                                <p className={`text-xs mt-0.5 ${
                                    isCurrent ? 'text-green-600' : 'text-slate-400'
                                }`}>
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default OrderTimeline

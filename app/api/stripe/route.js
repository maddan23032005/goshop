import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { items, orderId } = await request.json()

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        images: [item.image],
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?cancelled=true`,
            metadata: { orderId },
        })

        return NextResponse.json({ url: session.url })

    } catch (error) {
        console.error('Stripe error:', error)
        return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
    }
}

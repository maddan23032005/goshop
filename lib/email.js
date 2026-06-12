import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendOrderConfirmationEmail = async ({ to, orderDetails }) => {
    const { id, total, items, address } = orderDetails

    await resend.emails.send({
        from: 'GoShop <onboarding@resend.dev>',
        to,
        subject: 'GoShop — Order Confirmed! 🎉',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #16a34a; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0;">Order Confirmed! 🎉</h1>
                </div>
                
                <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="color: #64748b;">Thank you for your order!</p>
                    
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 0; color: #475569; font-size: 14px;">Order ID</p>
                        <p style="margin: 5px 0 0; color: #1e293b; font-weight: 600;">${id}</p>
                    </div>

                    <h3 style="color: #1e293b;">Items Ordered</h3>
                    ${items.map(item => `
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #475569;">${item.product.name} × ${item.quantity}</span>
                            <span style="color: #1e293b; font-weight: 600;">$${item.price}</span>
                        </div>
                    `).join('')}

                    <div style="display: flex; justify-content: space-between; padding: 15px 0; margin-top: 10px;">
                        <span style="color: #1e293b; font-weight: 700; font-size: 16px;">Total</span>
                        <span style="color: #16a34a; font-weight: 700; font-size: 16px;">$${total}</span>
                    </div>

                    <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 10px;">
                        <p style="margin: 0; color: #475569; font-size: 14px;">Delivering to</p>
                        <p style="margin: 5px 0 0; color: #1e293b;">
                            ${address.name}, ${address.street}, ${address.city}, ${address.state} ${address.zip}
                        </p>
                    </div>

                    <div style="margin-top: 20px; text-align: center;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" 
                           style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                            Track Your Order
                        </a>
                    </div>
                </div>
            </div>
        `
    })
}

export const sendStoreApprovalEmail = async ({ to, storeName }) => {
    await resend.emails.send({
        from: 'GoShop <onboarding@resend.dev>',
        to,
        subject: 'Your GoShop Store is Approved! 🎉',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #16a34a; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0;">Store Approved! 🎉</h1>
                </div>
                <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="color: #64748b;">Congratulations! Your store <strong>${storeName}</strong> has been approved.</p>
                    <p style="color: #64748b;">You can now start adding products and selling on GoShop!</p>
                    <div style="margin-top: 20px; text-align: center;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/store" 
                           style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                            Go to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        `
    })
}

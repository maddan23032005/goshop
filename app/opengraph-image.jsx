import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'GoShop — Shop Smarter'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{
                    fontSize: 80,
                    fontWeight: 700,
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                }}>
                    <span style={{ color: '#16a34a' }}>go</span>
                    <span>shop</span>
                    <span style={{ color: '#16a34a' }}>.</span>
                </div>
                <div style={{
                    fontSize: 28,
                    color: '#64748b',
                    marginTop: 20,
                }}>
                    GoShop — Shop Smarter
                </div>
                <div style={{
                    marginTop: 30,
                    padding: '12px 32px',
                    background: '#16a34a',
                    color: 'white',
                    borderRadius: 50,
                    fontSize: 20,
                }}>
                    Explore Products
                </div>
            </div>
        ),
        { ...size }
    )
}

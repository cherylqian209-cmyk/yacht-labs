import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Untitled Project'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
          padding: '60px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            ✦✦ YACHT LABS
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 30 ? 56 : 72,
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '24px',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          Built with Yacht Labs
        </div>

        {/* Pipeline badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 28px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '100px',
            fontSize: '20px',
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          Think → Build → Ship → Listen → Repeat
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

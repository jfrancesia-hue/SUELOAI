import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Suelo — Invertí en lo que pisás, potenciado por IA';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 64,
          background:
            'linear-gradient(135deg, #0A0A0A 0%, #0a2e1a 45%, #2a0f0a 100%)',
          color: 'white',
          fontFamily: 'system-ui',
          position: 'relative',
        }}
      >
        {/* Grid sutil simulado con overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Orbs */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: 9999,
            background: 'rgba(0, 200, 83, 0.25)',
            filter: 'blur(120px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: 9999,
            background: 'rgba(224, 127, 74, 0.2)',
            filter: 'blur(100px)',
          }}
        />

        {/* Logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, zIndex: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #4ade80, #00A844)',
              color: 'white',
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            S
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 32, fontWeight: 700 }}>
            <span>Suelo</span>
            <span style={{ color: '#4ade80' }}>.ai</span>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 16,
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontWeight: 600,
            color: '#4ade80',
            zIndex: 10,
            marginBottom: 20,
          }}
        >
          <span style={{ width: 10, height: 10, background: '#4ade80', borderRadius: 9999 }} />
          <span>Analista IA Personal · 100% Activos Reales</span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -3,
            zIndex: 10,
          }}
        >
          <span style={{ color: 'white' }}>Invertí en</span>
          <span
            style={{
              fontStyle: 'italic',
              fontWeight: 500,
              background: 'linear-gradient(90deg, #86efac 0%, #d0b68a 50%, #eba474 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            lo que pisás.
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            marginTop: 28,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.3,
            maxWidth: 900,
            zIndex: 10,
          }}
        >
          Plataforma LATAM de inversión inmobiliaria fraccionada. Desde USD 100.
        </div>

        {/* Footer badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 40,
            zIndex: 10,
          }}
        >
          {['PY', 'AR', 'UY', 'BO'].map((c) => (
            <div
              key={c}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: 1.5,
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}

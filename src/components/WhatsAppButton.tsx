'use client'

import { useState } from 'react'

const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/DDyMtIB3P1sImRGeliAjl4'

export function WhatsAppButton() {
  const [hovered, setHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <>
      {/* Pulse Ring Animation */}
      <style>{`
        @keyframes wa-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes wa-bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .wa-btn { animation: wa-bounce 2.5s ease-in-out infinite; }
        .wa-ring { animation: wa-pulse 2s ease-out infinite; }
        .wa-ring2 { animation: wa-pulse 2s ease-out infinite 0.6s; }
        .wa-tooltip {
          animation: fadeInUp 0.3s ease;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Floating Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px',
        }}
      >
        {/* Tooltip Bubble */}
        {(hovered || showTooltip) && (
          <div
            className="wa-tooltip"
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '12px 18px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              maxWidth: '220px',
              border: '1px solid #f0f0f0',
            }}
          >
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#1a202c', letterSpacing: '0.5px' }}>
              JOIN FURSA.LINK COMMUNITY
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#718096', lineHeight: 1.5 }}>
              Get updates, ask questions & connect with fellow students 🎓
            </p>
            {/* Arrow */}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              right: '26px',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white',
            }} />
          </div>
        )}

        {/* Button Wrapper with pulse rings */}
        <div style={{ position: 'relative', width: '60px', height: '60px' }}>
          {/* Pulse rings */}
          <div
            className="wa-ring"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: '#25D366',
              opacity: 0.3,
            }}
          />
          <div
            className="wa-ring2"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: '#25D366',
              opacity: 0.2,
            }}
          />

          {/* Main Button */}
          <a
            href={WHATSAPP_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="wa-btn"
            onMouseEnter={() => { setHovered(true); setShowTooltip(true); }}
            onMouseLeave={() => { setHovered(false); setShowTooltip(false); }}
            title="Join our WhatsApp Community"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: hovered
                ? 'linear-gradient(135deg, #20c45a, #128c47)'
                : 'linear-gradient(135deg, #25D366, #128C7E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: hovered
                ? '0 8px 30px rgba(37,211,102,0.6)'
                : '0 4px 20px rgba(37,211,102,0.4)',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            {/* WhatsApp SVG Icon */}
            <svg
              viewBox="0 0 32 32"
              width="30"
              height="30"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16.003c0 2.337.633 4.627 1.833 6.63L2.667 29.333l6.87-1.8a13.27 13.27 0 0 0 6.463 1.664h.003C23.367 29.197 29.333 23.227 29.333 16c0-7.363-5.967-13.333-13.33-13.333zm0 24.397a11.077 11.077 0 0 1-5.64-1.54l-.403-.24-4.077 1.07 1.09-3.977-.263-.41a11.063 11.063 0 0 1-1.697-5.963c0-6.11 4.97-11.077 11.08-11.077 6.107 0 11.08 4.967 11.08 11.077-.003 6.107-4.97 11.06-11.17 11.06zm6.077-8.287c-.333-.166-1.97-.97-2.277-1.08-.307-.11-.53-.166-.753.167-.223.333-.863 1.08-1.057 1.303-.193.22-.39.25-.723.083-.333-.166-1.407-.517-2.68-1.65-.99-.883-1.66-1.973-1.853-2.306-.193-.333-.02-.513.147-.68.15-.147.333-.39.5-.583.167-.193.22-.333.333-.556.113-.22.057-.417-.028-.583-.083-.167-.753-1.813-1.033-2.483-.27-.65-.547-.563-.75-.573-.193-.01-.416-.013-.64-.013-.22 0-.58.083-.887.417-.303.333-1.16 1.133-1.16 2.763s1.187 3.207 1.353 3.43c.167.22 2.34 3.57 5.667 5.007.793.343 1.41.547 1.893.7.795.253 1.52.217 2.093.133.64-.097 1.97-.807 2.247-1.587.277-.78.277-1.447.193-1.587-.08-.14-.3-.22-.633-.386z"/>
            </svg>
          </a>
        </div>
      </div>
    </>
  )
}

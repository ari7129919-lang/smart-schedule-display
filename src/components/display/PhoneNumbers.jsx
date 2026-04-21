import React from 'react';
import { Phone } from 'lucide-react';

export default function PhoneNumbers({ numbers = [], screenScale = 1 }) {
  const active = numbers
    .filter(n => n.active !== false)
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));

  if (active.length === 0) return null;

  return (
    <div
      className="bg-white/85 rounded-3xl overflow-hidden"
      style={{ boxShadow: 'var(--shadow-soft)', padding: `${20 * screenScale}px` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3" style={{ marginBottom: `${12 * screenScale}px` }}>
        <Phone size={18 * screenScale} style={{ color: '#6C7C94', flexShrink: 0 }} />
        <h3
          className="text-primary font-semibold"
          style={{ fontSize: `${24 * screenScale}px` }}
        >
          מספרים נחוצים
        </h3>
      </div>

      {/* Show ALL numbers at once in a list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${10 * screenScale}px` }}>
        {active.map((phone, idx) => (
          <div
            key={phone.id || idx}
            style={{
              padding: `${10 * screenScale}px ${14 * screenScale}px`,
              background: 'rgba(47,62,85,0.05)',
              borderRadius: `${12 * screenScale}px`,
              borderRight: `${3 * screenScale}px solid rgba(47,62,85,0.2)`,
            }}
          >
            <div
              className="text-secondary"
              style={{ fontSize: `${18 * screenScale}px`, lineHeight: 1.2, marginBottom: `${3 * screenScale}px` }}
            >
              {phone.category && (
                <span
                  style={{
                    background: 'rgba(47,62,85,0.1)',
                    borderRadius: '6px',
                    padding: `1px ${6 * screenScale}px`,
                    marginLeft: `${6 * screenScale}px`,
                    fontSize: `${12 * screenScale}px`,
                  }}
                >
                  {phone.category}
                </span>
              )}
              {phone.label}
            </div>
            <div
              className="text-primary font-bold tabular-nums"
              style={{ fontSize: `${32 * screenScale}px`, letterSpacing: '0.04em', lineHeight: 1.1 }}
              dir="ltr"
            >
              {phone.number}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
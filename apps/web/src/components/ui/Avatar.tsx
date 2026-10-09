import React from 'react';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'busy' | 'away' | 'offline';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  status,
  className = '',
}) => {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || 'U').toUpperCase();
  };

  let sizePx = 32;
  let fontSize = 'var(--text-sm)';
  if (size === 'sm') {
    sizePx = 24;
    fontSize = 'var(--text-xs)';
  } else if (size === 'lg') {
    sizePx = 40;
    fontSize = 'var(--text-md)';
  }

  let statusBg = 'var(--c-success)';
  if (status === 'busy') statusBg = 'var(--c-danger)';
  else if (status === 'away') statusBg = 'var(--c-warning)';
  else if (status === 'offline') statusBg = 'var(--c-text-3)';

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        borderRadius: '50%',
        backgroundColor: 'var(--c-navy)',
        color: '#FFFFFF',
        fontFamily: 'var(--font-display)',
        fontSize,
        fontWeight: 700,
        flexShrink: 0,
        userSelect: 'none',
      }}
      className={className}
      aria-label={name}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: '-1px',
            right: '-1px',
            width: size === 'sm' ? '6px' : '8px',
            height: size === 'sm' ? '6px' : '8px',
            borderRadius: '50%',
            backgroundColor: statusBg,
            border: '2px solid var(--c-surface)',
          }}
        />
      )}
    </div>
  );
};

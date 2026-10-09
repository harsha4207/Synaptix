import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  ariaLabel?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  size = 'md',
  children,
  ariaLabel = 'Dialog Window',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let sizeClass = '';
  if (size === 'lg') sizeClass = 'modal-lg';
  else if (size === 'xl') sizeClass = 'modal-xl';
  else if (size === 'sm') sizeClass = 'modal-sm';

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div className={`modal-content ${sizeClass}`.trim()}>
        {children}
      </div>
    </div>
  );
};

export interface DialogHeaderProps {
  title: string;
  description?: string;
  onClose?: () => void;
  badge?: React.ReactNode;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  title,
  description,
  onClose,
  badge,
}) => {
  return (
    <div className="modal-header">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <h2 className="modal-title">{title}</h2>
          {badge}
        </div>
        {description && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--c-text-2)', marginTop: 'var(--sp-1)' }}>
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="modal-close"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export const DialogBody: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <div className={`modal-body ${className}`.trim()} style={style}>
      {children}
    </div>
  );
};

export const DialogFooter: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <div className={`modal-footer ${className}`.trim()} style={style}>
      {children}
    </div>
  );
};

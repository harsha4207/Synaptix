import React, { useState, useRef, useEffect } from 'react';

export interface DropdownMenuItemProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: (
    | DropdownMenuItemProps
    | { type: 'separator' }
    | { type: 'label'; label: string }
  )[];
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className="dropdown-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            [align === 'right' ? 'right' : 'left']: 0,
            zIndex: 200,
          }}
        >
          {items.map((item, idx) => {
            if ('type' in item && item.type === 'separator') {
              return <div key={idx} className="dropdown-divider" />;
            }
            if ('type' in item && item.type === 'label') {
              return (
                <div key={idx} className="dropdown-section-label">
                  {item.label}
                </div>
              );
            }
            const menuItem = item as DropdownMenuItemProps;
            return (
              <button
                key={idx}
                type="button"
                className={`dropdown-item ${menuItem.destructive ? 'danger' : ''}`}
                disabled={menuItem.disabled}
                onClick={() => {
                  menuItem.onClick();
                  setIsOpen(false);
                }}
              >
                {menuItem.icon && <span style={{ display: 'inline-flex' }}>{menuItem.icon}</span>}
                <span>{menuItem.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

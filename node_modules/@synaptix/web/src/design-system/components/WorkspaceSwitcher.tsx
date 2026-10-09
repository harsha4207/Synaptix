import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, Loader2 } from 'lucide-react';
import { WorkspaceItem } from '../../types/workspace';

interface WorkspaceSwitcherProps {
  currentWorkspace: WorkspaceItem | null;
  workspaces: WorkspaceItem[];
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateWorkspaceClick: () => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  currentWorkspace,
  workspaces,
  onSelectWorkspace,
  onCreateWorkspaceClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchingTargetName, setSwitchingTargetName] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (ws: WorkspaceItem) => {
    if (currentWorkspace?.id === ws.id) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    setIsSwitching(true);
    setSwitchingTargetName(ws.name);

    setTimeout(() => {
      onSelectWorkspace(ws.id);
      setIsSwitching(false);
      setSwitchingTargetName(null);
    }, 280);
  };

  return (
    <div className="ds-workspace-switcher" ref={containerRef}>
      <button
        type="button"
        className={`switcher-trigger-btn ${isSwitching ? 'switching' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {isSwitching ? (
          <>
            <Loader2 size={14} className="spinner-icon animate-spin" />
            <span className="switcher-current-name">Switching to {switchingTargetName}...</span>
          </>
        ) : (
          <>
            <span
              className="domain-indicator-dot"
              style={{ backgroundColor: currentWorkspace?.colorAccent || '#1769E0' }}
            />
            <span className="switcher-current-name">
              {currentWorkspace ? currentWorkspace.name : 'Select Workspace'}
            </span>
            <ChevronDown size={14} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div className="switcher-dropdown-panel">
          <div className="switcher-header">
            <span>Authorized Domain Workspaces</span>
          </div>

          <div className="switcher-item-list">
            {workspaces.map((ws) => {
              const isSelected = currentWorkspace?.id === ws.id;
              return (
                <button
                  key={ws.id}
                  type="button"
                  className={`switcher-option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(ws)}
                >
                  <span className="option-dot" style={{ backgroundColor: ws.colorAccent }} />
                  <div className="option-text-group">
                    <span className="option-name">{ws.name}</span>
                    <span className="option-domain">{ws.domain} Context</span>
                  </div>
                  {isSelected && <Check size={14} className="check-icon" />}
                </button>
              );
            })}
          </div>

          <div className="switcher-footer">
            <button
              type="button"
              className="switcher-create-btn"
              onClick={() => {
                onCreateWorkspaceClick();
                setIsOpen(false);
              }}
            >
              <Plus size={14} />
              <span>Create New Workspace Boundary</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

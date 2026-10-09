import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  FileText,
  AlertTriangle,
  RefreshCw,
  XCircle,
  ShieldCheck,
  Check,
  CheckCheck,
  ChevronRight,
  X,
  Bell
} from 'lucide-react';
import { NotificationItem, NotificationType, NotificationGroup } from '../../types/notification';
import { WorkspaceModuleId } from '../../design-system/components/Sidebar';

interface NotificationPanelProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onOpenNotificationTarget: (workspaceId: string, targetModule: WorkspaceModuleId, title: string) => void;
}

const TYPE_ICON_MAP: Record<NotificationType, { icon: React.ReactNode; color: string; bgColor: string }> = {
  approval_required: {
    icon: <ShieldAlert size={15} />,
    color: '#EA580C',
    bgColor: '#FFEDD5'
  },
  workflow_completed: {
    icon: <CheckCircle2 size={15} />,
    color: '#16A34A',
    bgColor: '#DCFCE7'
  },
  analysis_completed: {
    icon: <Sparkles size={15} />,
    color: '#2563EB',
    bgColor: '#EFF6FF'
  },
  document_processed: {
    icon: <FileText size={15} />,
    color: '#0D9488',
    bgColor: '#CCFBF1'
  },
  problem_detected: {
    icon: <AlertTriangle size={15} />,
    color: '#DC2626',
    bgColor: '#FEE2E2'
  },
  evidence_changed: {
    icon: <RefreshCw size={15} />,
    color: '#7C3AED',
    bgColor: '#F3E8FF'
  },
  action_failed: {
    icon: <XCircle size={15} />,
    color: '#DC2626',
    bgColor: '#FEE2E2'
  },
  action_verified: {
    icon: <ShieldCheck size={15} />,
    color: '#16A34A',
    bgColor: '#DCFCE7'
  }
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenNotificationTarget
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'action'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'action') return n.actionRequired || n.type === 'approval_required';
    return true;
  });

  const groupsOrder: NotificationGroup[] = ['Today', 'Yesterday', 'Earlier'];

  const grouped = groupsOrder
    .map((grp) => ({
      group: grp,
      items: filteredNotifications.filter((n) => n.group === grp)
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="notif-dropdown-panel" role="dialog" aria-label="Notification Center">
      {/* Header */}
      <div className="notif-panel-header">
        <div className="notif-header-title-row">
          <div className="title-box">
            <Bell size={16} className="header-bell-icon" />
            <h3>Notification Center</h3>
            {unreadCount > 0 && <span className="unread-badge-count">{unreadCount} New</span>}
          </div>
          <button type="button" className="notif-close-btn" onClick={onClose} title="Close">
            <X size={14} />
          </button>
        </div>

        {/* Filter Tabs & Mark All Read */}
        <div className="notif-toolbar">
          <div className="notif-tabs">
            <button
              className={`notif-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`notif-tab ${activeTab === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`notif-tab ${activeTab === 'action' ? 'active' : ''}`}
              onClick={() => setActiveTab('action')}
            >
              Action Required
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="mark-all-btn"
              onClick={onMarkAllAsRead}
              title="Mark all notifications as read"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Body / List */}
      <div className="notif-panel-body">
        {grouped.length === 0 ? (
          <div className="notif-empty-state">
            <CheckCircle2 size={32} className="empty-check-icon" />
            <p className="empty-title">All caught up!</p>
            <p className="empty-desc">No {activeTab !== 'all' ? activeTab : ''} notifications to review.</p>
          </div>
        ) : (
          grouped.map(({ group, items }) => (
            <div key={group} className="notif-group-section">
              <div className="notif-group-label">{group}</div>
              <div className="notif-group-items">
                {items.map((item) => {
                  const typeCfg = TYPE_ICON_MAP[item.type];
                  return (
                    <div
                      key={item.id}
                      className={`notif-item-card ${!item.read ? 'unread' : 'read'}`}
                      onClick={() => {
                        if (!item.read) onMarkAsRead(item.id);
                        onOpenNotificationTarget(item.workspaceId, item.targetModule, item.title);
                        onClose();
                      }}
                    >
                      <div className="notif-card-left">
                        <div
                          className="notif-type-icon-box"
                          style={{ color: typeCfg.color, backgroundColor: typeCfg.bgColor }}
                        >
                          {typeCfg.icon}
                        </div>
                        <div className="notif-card-content">
                          <div className="notif-item-top">
                            <span className="notif-item-title">{item.title}</span>
                            {!item.read && <span className="subtle-unread-dot" title="Unread" />}
                          </div>
                          <p className="notif-item-desc">{item.description}</p>
                          <div className="notif-item-meta">
                            <span className="notif-ws-pill">{item.workspaceName}</span>
                            <span className="meta-sep">•</span>
                            <span className="notif-timestamp">{item.timestamp}</span>
                            {item.actionRequired && (
                              <span className="notif-action-tag">Action Needed</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="notif-card-actions" onClick={(e) => e.stopPropagation()}>
                        {!item.read && (
                          <button
                            type="button"
                            className="notif-action-btn"
                            onClick={() => onMarkAsRead(item.id)}
                            title="Mark as read"
                          >
                            <Check size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="notif-open-btn"
                          onClick={() => {
                            if (!item.read) onMarkAsRead(item.id);
                            onOpenNotificationTarget(item.workspaceId, item.targetModule, item.title);
                            onClose();
                          }}
                          title="Open related item"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

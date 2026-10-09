import { WorkspaceModuleId } from '../design-system/components/Sidebar';

export type NotificationType =
  | 'approval_required'
  | 'workflow_completed'
  | 'analysis_completed'
  | 'document_processed'
  | 'problem_detected'
  | 'evidence_changed'
  | 'action_failed'
  | 'action_verified';

export type NotificationGroup = 'Today' | 'Yesterday' | 'Earlier';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  workspaceId: string;
  workspaceName: string;
  timestamp: string;
  group: NotificationGroup;
  read: boolean;
  targetModule: WorkspaceModuleId;
  relatedItemId?: string;
  actionRequired?: boolean;
  severity?: 'critical' | 'warning' | 'info' | 'success';
}

export type DomainType = 'Finance' | 'Research' | 'Healthcare' | 'Education' | 'Business' | 'Custom';

export interface WorkspaceItem {
  id: string;
  name: string;
  domain: DomainType;
  description: string;
  iconName: string;
  documentCount: number;
  datasetCount: number;
  dashboardCount: number;
  pendingActionCount?: number;
  lastActivity: string;
  lastActivityTime: string;
  colorAccent: string;
  isAuthorized: boolean;
}

export interface RecentActivityItem {
  id: string;
  workspaceId: string;
  workspaceName: string;
  domain: DomainType;
  activityType: string;
  description: string;
  timestamp: string;
  status?: 'completed' | 'pending' | 'in_progress';
}

export interface UserProfileInfo {
  name: string;
  email: string;
  role: string;
  organization: string;
  avatarUrl?: string;
  displayName?: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  bio?: string;
}

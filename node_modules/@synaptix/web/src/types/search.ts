import { WorkspaceModuleId } from '../design-system/components/Sidebar';

export type SearchResultType =
  | 'document'
  | 'dataset'
  | 'entity'
  | 'knowledge'
  | 'dashboard'
  | 'problem'
  | 'workflow'
  | 'action'
  | 'audit';

export type EvidenceGradeFilter = 'all' | 'G0' | 'G1' | 'G2' | 'Contradicted';

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  workspaceId: string;
  workspaceName: string;
  workspaceDomain: string;
  date: string;
  owner: string;
  ownerAvatar?: string;
  evidenceGrade?: 'G0' | 'G1' | 'G2' | 'Contradicted';
  confidenceScore?: number;
  isAuthorized: boolean;
  targetModule: WorkspaceModuleId;
  metadata?: Record<string, string>;
  tags?: string[];
}

export interface SearchFilters {
  query: string;
  workspaceId: string; // 'all' or specific workspace id
  type: SearchResultType | 'all';
  dateRange: 'all' | '7d' | '30d' | '90d' | '1y';
  evidenceGrade: EvidenceGradeFilter;
  owner: string; // 'all' or specific owner name
}

export interface SearchTypeGroup {
  type: SearchResultType;
  label: string;
  iconName: string;
  items: SearchResultItem[];
}

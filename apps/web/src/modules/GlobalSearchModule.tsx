import React, { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  Database,
  Users,
  Brain,
  LayoutDashboard,
  AlertTriangle,
  GitPullRequest,
  CheckSquare,
  Shield,
  ChevronRight,
  Lock,
  RotateCcw
} from 'lucide-react';
import { SearchResultItem, SearchResultType, EvidenceGradeFilter } from '../types/search';
import { MOCK_SEARCH_ITEMS } from '../data/mockSearchData';
import { WorkspaceItem } from '../types/workspace';
import { WorkspaceModuleId } from '../design-system/components/Sidebar';
import { PageContainer, PageContent } from '../components/layout';

interface GlobalSearchModuleProps {
  workspace: WorkspaceItem;
  allWorkspaces: WorkspaceItem[];
  onAddToast: (msg: string) => void;
  onNavigateToResult: (workspaceId: string, moduleId: WorkspaceModuleId, itemTitle: string) => void;
}

const TYPE_CONFIG: Record<
  SearchResultType,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  document: { label: 'Documents', icon: <FileText size={16} />, color: '#2563EB', bgColor: '#EFF6FF' },
  dataset: { label: 'Datasets', icon: <Database size={16} />, color: '#0D9488', bgColor: '#CCFBF1' },
  entity: { label: 'Entities', icon: <Users size={16} />, color: '#7C3AED', bgColor: '#F3E8FF' },
  knowledge: { label: 'Knowledge', icon: <Brain size={16} />, color: '#D97706', bgColor: '#FEF3C7' },
  dashboard: { label: 'Dashboards', icon: <LayoutDashboard size={16} />, color: '#059669', bgColor: '#D1FAE5' },
  problem: { label: 'Problems', icon: <AlertTriangle size={16} />, color: '#DC2626', bgColor: '#FEE2E2' },
  workflow: { label: 'Workflows', icon: <GitPullRequest size={16} />, color: '#4F46E5', bgColor: '#EEF2FF' },
  action: { label: 'Actions', icon: <CheckSquare size={16} />, color: '#EA580C', bgColor: '#FFEDD5' },
  audit: { label: 'Audit Events', icon: <Shield size={16} />, color: '#475569', bgColor: '#F1F5F9' }
};

export const GlobalSearchModule: React.FC<GlobalSearchModuleProps> = ({
  workspace,
  allWorkspaces,
  onAddToast,
  onNavigateToResult
}) => {
  const [query, setQuery] = useState('');
  const [selectedWorkspaceFilter, setSelectedWorkspaceFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<SearchResultType | 'all'>('all');
  const [selectedEvidenceFilter, setSelectedEvidenceFilter] = useState<EvidenceGradeFilter>('all');
  const [selectedOwnerFilter, setSelectedOwnerFilter] = useState<string>('all');

  // Enforce security permissions: strictly filter out unauthorized items
  const authorizedItems = useMemo(() => {
    return MOCK_SEARCH_ITEMS.filter((item) => item.isAuthorized);
  }, []);

  const totalRestrictedCount = useMemo(() => {
    return MOCK_SEARCH_ITEMS.filter((item) => !item.isAuthorized).length;
  }, []);

  const filteredItems = useMemo(() => {
    return authorizedItems.filter((item) => {
      if (selectedWorkspaceFilter !== 'all' && item.workspaceId !== selectedWorkspaceFilter) return false;
      if (selectedTypeFilter !== 'all' && item.type !== selectedTypeFilter) return false;
      if (selectedEvidenceFilter !== 'all') {
        if (selectedEvidenceFilter === 'G1' || selectedEvidenceFilter === 'G2') {
          if (item.evidenceGrade !== selectedEvidenceFilter) return false;
        } else if (selectedEvidenceFilter === 'G0') {
          if (item.evidenceGrade && item.evidenceGrade !== 'G0') return false;
        } else if (selectedEvidenceFilter === 'Contradicted') {
          if (item.evidenceGrade !== 'Contradicted') return false;
        }
      }
      if (selectedOwnerFilter !== 'all' && item.owner !== selectedOwnerFilter) return false;

      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.owner.toLowerCase().includes(q) ||
        item.workspaceName.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [authorizedItems, query, selectedWorkspaceFilter, selectedTypeFilter, selectedEvidenceFilter, selectedOwnerFilter]);

  // Group by type for display
  const groupedResults = useMemo(() => {
    const groups: { [key in SearchResultType]?: SearchResultItem[] } = {};
    filteredItems.forEach((item) => {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type]!.push(item);
    });

    const orderedTypes: SearchResultType[] = [
      'document',
      'dataset',
      'entity',
      'knowledge',
      'dashboard',
      'problem',
      'workflow',
      'action',
      'audit'
    ];

    return orderedTypes
      .filter((t) => groups[t] && groups[t]!.length > 0)
      .map((t) => ({ type: t, items: groups[t]! }));
  }, [filteredItems]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedWorkspaceFilter('all');
    setSelectedTypeFilter('all');
    setSelectedEvidenceFilter('all');
    setSelectedOwnerFilter('all');
    onAddToast('Search filters reset to default');
  };

  const handleOpenResult = (item: SearchResultItem) => {
    onNavigateToResult(item.workspaceId, item.targetModule, item.title);
    onAddToast(`Navigating to ${item.title} in ${item.workspaceName} workspace`);
  };

  return (
    <PageContainer>
      <PageContent>
      <div className="search-page-container">
      {/* Top Header */}
      <div className="search-top-header">
        <div className="search-breadcrumb">SYNAPTIX COMMAND / {workspace.name.toUpperCase()} / GLOBAL SEARCH</div>
        <div className="header-title-row">
          <h1 className="search-main-title">Cross-Workspace Intelligence Search</h1>
          <div className="security-pill-badge">
            <Lock size={13} />
            <span>Scope: {allWorkspaces.length} Authorized Workspaces</span>
            {totalRestrictedCount > 0 && (
              <span className="restricted-badge">({totalRestrictedCount} restricted omitted)</span>
            )}
          </div>
        </div>
        <p className="search-main-subtitle">
          Federated index across documents, datasets, entities, claims, dashboards, problems, workflows, actions, and audit logs.
        </p>
      </div>

      {/* Main Search Input Card */}
      <div className="search-input-card">
        <div className="search-big-input-box">
          <Search size={22} className="search-big-icon" />
          <input
            type="text"
            className="search-big-input"
            placeholder="Search Synaptix across all organizational data, insights, workflows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="big-kbd-badge">⌘K</kbd>
        </div>

        {/* Filter Toolbar */}
        <div className="search-page-filters-row">
          <div className="filter-item-wrap">
            <label className="filter-label">Workspace Boundary</label>
            <select
              className="search-page-select"
              value={selectedWorkspaceFilter}
              onChange={(e) => setSelectedWorkspaceFilter(e.target.value)}
            >
              <option value="all">All Workspaces ({allWorkspaces.length})</option>
              {allWorkspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name} ({ws.domain})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item-wrap">
            <label className="filter-label">Data Category</label>
            <select
              className="search-page-select"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as SearchResultType | 'all')}
            >
              <option value="all">All Types (9 Categories)</option>
              <option value="document">Documents</option>
              <option value="dataset">Datasets</option>
              <option value="entity">Entities</option>
              <option value="knowledge">Knowledge Claims</option>
              <option value="dashboard">Dashboards</option>
              <option value="problem">Problems & Insights</option>
              <option value="workflow">Workflows</option>
              <option value="action">Governed Actions</option>
              <option value="audit">Audit Timeline Events</option>
            </select>
          </div>

          <div className="filter-item-wrap">
            <label className="filter-label">Evidence Verification</label>
            <select
              className="search-page-select"
              value={selectedEvidenceFilter}
              onChange={(e) => setSelectedEvidenceFilter(e.target.value as EvidenceGradeFilter)}
            >
              <option value="all">All Grades</option>
              <option value="G1">G1 Verified</option>
              <option value="G2">G2 Action-Proven</option>
              <option value="G0">G0 Extracted</option>
              <option value="Contradicted">Contradicted</option>
            </select>
          </div>

          <div className="filter-item-wrap">
            <label className="filter-label">Owner / Creator</label>
            <select
              className="search-page-select"
              value={selectedOwnerFilter}
              onChange={(e) => setSelectedOwnerFilter(e.target.value)}
            >
              <option value="all">All Owners</option>
              <option value="Alex Vance">Alex Vance</option>
              <option value="Dr. Sarah Chen">Dr. Sarah Chen</option>
              <option value="Marcus Brody">Marcus Brody</option>
              <option value="Elena Rostova">Elena Rostova</option>
            </select>
          </div>

          <div className="filter-item-wrap reset-btn-wrap">
            <button type="button" className="reset-filter-btn" onClick={handleResetFilters}>
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="category-pills-bar">
        <button
          className={`type-pill ${selectedTypeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedTypeFilter('all')}
        >
          All ({filteredItems.length})
        </button>
        {(Object.keys(TYPE_CONFIG) as SearchResultType[]).map((t) => {
          const cfg = TYPE_CONFIG[t];
          const count = authorizedItems.filter((i) => i.type === t).length;
          return (
            <button
              key={t}
              className={`type-pill ${selectedTypeFilter === t ? 'active' : ''}`}
              onClick={() => setSelectedTypeFilter(t)}
            >
              <span className="pill-icon" style={{ color: cfg.color }}>
                {cfg.icon}
              </span>
              <span>{cfg.label}</span>
              <span className="pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Results Content View */}
      <div className="search-results-content">
        {groupedResults.length === 0 ? (
          <div className="search-no-results-card">
            <Search size={40} className="no-res-icon" />
            <h3>No results matching search parameters</h3>
            <p>
              Check your spelling, reset applied filters, or broaden your search terms across workspaces.
            </p>
            <button type="button" className="search-reset-btn-large" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="search-groups-stack">
            {groupedResults.map((group) => {
              const cfg = TYPE_CONFIG[group.type];
              return (
                <div key={group.type} className="page-result-group-card">
                  <div className="page-group-header">
                    <div className="page-group-title">
                      <span className="page-group-icon" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
                        {cfg.icon}
                      </span>
                      <h2>{cfg.label}</h2>
                    </div>
                    <span className="page-group-badge">{group.items.length} items</span>
                  </div>

                  <div className="page-group-items">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="page-result-item-card"
                        onClick={() => handleOpenResult(item)}
                      >
                        <div className="page-item-main">
                          <div className="page-item-header">
                            <h3 className="page-item-title">{item.title}</h3>
                            <div className="page-item-badges">
                              <span className="ws-tag">{item.workspaceName}</span>
                              {item.evidenceGrade && (
                                <span
                                  className={`evidence-tag ${
                                    item.evidenceGrade === 'G2'
                                      ? 'g2'
                                      : item.evidenceGrade === 'G1'
                                      ? 'g1'
                                      : 'g0'
                                  }`}
                                >
                                  {item.evidenceGrade}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="page-item-desc">{item.description}</p>

                          <div className="page-item-footer">
                            <span className="item-owner">Owner: {item.owner}</span>
                            <span className="item-sep">•</span>
                            <span className="item-date">Updated {item.date}</span>
                            {item.metadata &&
                              Object.entries(item.metadata).map(([k, v]) => (
                                <React.Fragment key={k}>
                                  <span className="item-sep">•</span>
                                  <span className="item-kv">
                                    {k}: <strong>{v}</strong>
                                  </span>
                                </React.Fragment>
                              ))}
                          </div>
                        </div>

                        <div className="page-item-action">
                          <button type="button" className="open-result-btn">
                            Open Context <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
      </PageContent>
    </PageContainer>
  );
};

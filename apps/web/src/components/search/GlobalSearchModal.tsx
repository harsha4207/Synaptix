import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  FileText,
  Database,
  Users,
  Brain,
  LayoutDashboard,
  AlertTriangle,
  GitPullRequest,
  CheckSquare,
  Shield,
  Filter,
  Lock,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { SearchResultItem, SearchResultType, EvidenceGradeFilter } from '../../types/search';
import { MOCK_SEARCH_ITEMS } from '../../data/mockSearchData';
import { WorkspaceItem } from '../../types/workspace';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: WorkspaceItem[];
  onSelectResult: (item: SearchResultItem) => void;
  initialQuery?: string;
}

const TYPE_CONFIG: Record<
  SearchResultType,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  document: {
    label: 'Documents',
    icon: <FileText size={15} />,
    color: '#2563EB',
    bgColor: '#EFF6FF'
  },
  dataset: {
    label: 'Datasets',
    icon: <Database size={15} />,
    color: '#0D9488',
    bgColor: '#CCFBF1'
  },
  entity: {
    label: 'Entities',
    icon: <Users size={15} />,
    color: '#7C3AED',
    bgColor: '#F3E8FF'
  },
  knowledge: {
    label: 'Knowledge',
    icon: <Brain size={15} />,
    color: '#D97706',
    bgColor: '#FEF3C7'
  },
  dashboard: {
    label: 'Dashboards',
    icon: <LayoutDashboard size={15} />,
    color: '#059669',
    bgColor: '#D1FAE5'
  },
  problem: {
    label: 'Problems',
    icon: <AlertTriangle size={15} />,
    color: '#DC2626',
    bgColor: '#FEE2E2'
  },
  workflow: {
    label: 'Workflows',
    icon: <GitPullRequest size={15} />,
    color: '#4F46E5',
    bgColor: '#EEF2FF'
  },
  action: {
    label: 'Actions',
    icon: <CheckSquare size={15} />,
    color: '#EA580C',
    bgColor: '#FFEDD5'
  },
  audit: {
    label: 'Audit Events',
    icon: <Shield size={15} />,
    color: '#475569',
    bgColor: '#F1F5F9'
  }
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  workspaces,
  onSelectResult,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedWorkspaceFilter, setSelectedWorkspaceFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<SearchResultType | 'all'>('all');
  const [selectedEvidenceFilter, setSelectedEvidenceFilter] = useState<EvidenceGradeFilter>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [selectedOwnerFilter, setSelectedOwnerFilter] = useState<string>('all');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setHighlightedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  // Strict permission filter: ONLY include items where isAuthorized is true
  const authorizedItems = useMemo(() => {
    return MOCK_SEARCH_ITEMS.filter((item) => item.isAuthorized);
  }, []);

  const totalRestrictedCount = useMemo(() => {
    return MOCK_SEARCH_ITEMS.filter((item) => !item.isAuthorized).length;
  }, []);

  // Filter items based on user inputs
  const filteredItems = useMemo(() => {
    return authorizedItems.filter((item) => {
      // 1. Workspace filter
      if (selectedWorkspaceFilter !== 'all' && item.workspaceId !== selectedWorkspaceFilter) {
        return false;
      }
      // 2. Type filter
      if (selectedTypeFilter !== 'all' && item.type !== selectedTypeFilter) {
        return false;
      }
      // 3. Evidence filter
      if (selectedEvidenceFilter !== 'all') {
        if (selectedEvidenceFilter === 'G1' || selectedEvidenceFilter === 'G2') {
          if (item.evidenceGrade !== selectedEvidenceFilter) return false;
        } else if (selectedEvidenceFilter === 'G0') {
          if (item.evidenceGrade && item.evidenceGrade !== 'G0') return false;
        } else if (selectedEvidenceFilter === 'Contradicted') {
          if (item.evidenceGrade !== 'Contradicted') return false;
        }
      }
      // 4. Owner filter
      if (selectedOwnerFilter !== 'all' && item.owner !== selectedOwnerFilter) {
        return false;
      }

      // 5. Query text match
      if (!query.trim()) return true;

      const q = query.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchOwner = item.owner.toLowerCase().includes(q);
      const matchWs = item.workspaceName.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchDesc || matchOwner || matchWs || matchTags;
    });
  }, [
    authorizedItems,
    query,
    selectedWorkspaceFilter,
    selectedTypeFilter,
    selectedEvidenceFilter,
    selectedDateFilter,
    selectedOwnerFilter
  ]);

  // Group filtered results by type
  const groupedResults = useMemo(() => {
    const groups: { [key in SearchResultType]?: SearchResultItem[] } = {};

    filteredItems.forEach((item) => {
      if (!groups[item.type]) {
        groups[item.type] = [];
      }
      groups[item.type]!.push(item);
    });

    const groupList: { type: SearchResultType; items: SearchResultItem[] }[] = [];
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

    orderedTypes.forEach((t) => {
      if (groups[t] && groups[t]!.length > 0) {
        groupList.push({ type: t, items: groups[t]! });
      }
    });

    return groupList;
  }, [filteredItems]);

  // Flatten items for keyboard arrow navigation
  const flatItemsList = useMemo(() => {
    const flat: SearchResultItem[] = [];
    groupedResults.forEach((grp) => {
      flat.push(...grp.items);
    });
    return flat;
  }, [groupedResults]);

  // Keyboard navigation handler inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < flatItemsList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : flatItemsList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItemsList.length > 0 && flatItemsList[highlightedIndex]) {
        onSelectResult(flatItemsList[highlightedIndex]);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="search-modal-container"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        ref={containerRef}
      >
        {/* Top Input Bar */}
        <div className="search-modal-header">
          <Search className="search-input-icon" size={18} />
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Search Synaptix... (documents, datasets, entities, knowledge, dashboards, problems...)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightedIndex(0);
            }}
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setQuery('');
                setHighlightedIndex(0);
              }}
              title="Clear query"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="modal-esc-kbd">ESC</kbd>
        </div>

        {/* Filters Toolbar */}
        <div className="search-filters-bar">
          <div className="filter-group-item">
            <Layers size={13} className="filter-icon" />
            <select
              className="search-filter-select"
              value={selectedWorkspaceFilter}
              onChange={(e) => setSelectedWorkspaceFilter(e.target.value)}
            >
              <option value="all">All Workspaces</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name} ({ws.domain})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group-item">
            <Filter size={13} className="filter-icon" />
            <select
              className="search-filter-select"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as SearchResultType | 'all')}
            >
              <option value="all">All Types</option>
              <option value="document">Documents</option>
              <option value="dataset">Datasets</option>
              <option value="entity">Entities</option>
              <option value="knowledge">Knowledge</option>
              <option value="dashboard">Dashboards</option>
              <option value="problem">Problems</option>
              <option value="workflow">Workflows</option>
              <option value="action">Actions</option>
              <option value="audit">Audit Events</option>
            </select>
          </div>

          <div className="filter-group-item">
            <CheckCircle2 size={13} className="filter-icon" />
            <select
              className="search-filter-select"
              value={selectedEvidenceFilter}
              onChange={(e) => setSelectedEvidenceFilter(e.target.value as EvidenceGradeFilter)}
            >
              <option value="all">All Evidence Grades</option>
              <option value="G1">G1 Verified</option>
              <option value="G2">G2 Action-Proven</option>
              <option value="G0">G0 Extracted</option>
              <option value="Contradicted">Contradicted</option>
            </select>
          </div>

          <div className="filter-group-item">
            <Calendar size={13} className="filter-icon" />
            <select
              className="search-filter-select"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
            >
              <option value="all">Anytime</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">Last 1 Year</option>
            </select>
          </div>

          <div className="filter-group-item">
            <UserCheck size={13} className="filter-icon" />
            <select
              className="search-filter-select"
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
        </div>

        {/* Results Body */}
        <div className="search-modal-body">
          {flatItemsList.length === 0 ? (
            <div className="search-empty-state">
              <Search size={32} className="empty-search-icon" />
              <h4>No matching search results found</h4>
              <p>
                Try adjusting your search terms or filters. Search is strictly scoped to authorized workspace boundaries.
              </p>
            </div>
          ) : (
            <div className="search-grouped-results">
              {groupedResults.map((group) => {
                const cfg = TYPE_CONFIG[group.type];
                return (
                  <div key={group.type} className="search-result-group">
                    <div className="group-header">
                      <span className="group-header-icon" style={{ color: cfg.color }}>
                        {cfg.icon}
                      </span>
                      <span className="group-header-title">{cfg.label}</span>
                      <span className="group-header-count">{group.items.length}</span>
                    </div>

                    <div className="group-items-list">
                      {group.items.map((item) => {
                        const itemFlatIdx = flatItemsList.findIndex((fi) => fi.id === item.id);
                        const isSelected = itemFlatIdx === highlightedIndex;

                        return (
                          <div
                            key={item.id}
                            className={`search-result-item-card ${isSelected ? 'highlighted' : ''}`}
                            onClick={() => {
                              onSelectResult(item);
                              onClose();
                            }}
                            onMouseEnter={() => setHighlightedIndex(itemFlatIdx)}
                          >
                            <div className="item-card-left">
                              <div
                                className="item-type-badge"
                                style={{ color: cfg.color, backgroundColor: cfg.bgColor }}
                              >
                                {cfg.icon}
                              </div>
                              <div className="item-details-col">
                                <div className="item-title-row">
                                  <span className="item-title">{item.title}</span>
                                  <span className="item-ws-pill">{item.workspaceName}</span>
                                  {item.evidenceGrade && (
                                    <span
                                      className={`item-evidence-pill ${
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
                                <p className="item-description-text">{item.description}</p>

                                <div className="item-meta-row">
                                  <span className="meta-owner">By {item.owner}</span>
                                  <span className="meta-dot">•</span>
                                  <span className="meta-date">{item.date}</span>
                                  {item.metadata && Object.entries(item.metadata).map(([k, v]) => (
                                    <React.Fragment key={k}>
                                      <span className="meta-dot">•</span>
                                      <span className="meta-kv">
                                        {k}: <strong>{v}</strong>
                                      </span>
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="item-card-right">
                              <span className="navigate-arrow">
                                Open <ChevronRight size={13} />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer with Security Scope Notification */}
        <div className="search-modal-footer">
          <div className="security-scope-notice">
            <Lock size={12} className="security-icon" />
            <span>
              <strong>Governance Enforcement:</strong> Search scoped to {workspaces.length} authorized workspaces.
              {totalRestrictedCount > 0 && (
                <span className="restricted-badge">
                  {totalRestrictedCount} restricted workspace item omitted
                </span>
              )}
            </span>
          </div>

          <div className="keyboard-shortcuts-hints">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

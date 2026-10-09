import React from 'react';
import { X, Tag, FileText, ShieldCheck, Layers, Download } from 'lucide-react';
import { GraphNode, GraphEdge } from './KnowledgeGraph';
import { WorkspaceItem } from '../../types/workspace';

interface EntityDetailDrawerProps {
  workspace: WorkspaceItem;
  node: GraphNode | null;
  allNodes: GraphNode[];
  allEdges: GraphEdge[];
  onClose: () => void;
  onAddToast: (msg: string) => void;
}

export const EntityDetailDrawer: React.FC<EntityDetailDrawerProps> = ({
  workspace,
  node,
  allNodes,
  allEdges,
  onClose,
  onAddToast,
}) => {
  if (!node) return null;

  // Find relationships for this node
  const connectedEdges = allEdges.filter((e) => e.source === node.id || e.target === node.id);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="entity-detail-drawer slide-in-right" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="entity-icon-circle" style={{ backgroundColor: `${node.color}15`, color: node.color }}>
              <Tag size={20} />
            </div>
            <div>
              <div className="entity-meta-tags">
                <span className="type-tag">{node.type}</span>
                <span className="grade-tag">{node.evidenceGrade}</span>
              </div>
              <h3 className="entity-drawer-name">{node.label}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="drawer-close-btn" aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="drawer-body-scroll">
          {/* Description Box */}
          <div className="entity-pane-section">
            <h4 className="section-title">Entity Scope & Overview</h4>
            <p className="entity-desc-narrative">{node.description}</p>
          </div>

          {/* Connected Relationships */}
          <div className="entity-pane-section">
            <h4 className="section-title">Graph Relationships ({connectedEdges.length})</h4>
            <div className="relationships-list">
              {connectedEdges.map((edge) => {
                const targetNode = allNodes.find((n) => n.id === (edge.source === node.id ? edge.target : edge.source));
                return (
                  <div key={edge.id} className="rel-card-item">
                    <div className="rel-edge-badge">
                      <span>{edge.label}</span>
                    </div>
                    <div className="rel-target-name">
                      <Tag size={13} style={{ color: targetNode?.color }} />
                      <span>{targetNode?.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Related Documents */}
          <div className="entity-pane-section">
            <h4 className="section-title">Related Documents ({node.documentCount})</h4>
            <div className="related-docs-list">
              <div className="related-doc-item">
                <FileText size={14} className="doc-blue-icon" />
                <div className="doc-item-text">
                  <span className="doc-name">{workspace.name.toLowerCase()}_annual_forecast_FY26.pdf</span>
                  <span className="doc-sub">Ingested 2 hours ago • Verified Citation</span>
                </div>
              </div>
              <div className="related-doc-item">
                <FileText size={14} className="doc-blue-icon" />
                <div className="doc-item-text">
                  <span className="doc-name">{workspace.name.toLowerCase()}_operational_audit_v2.csv</span>
                  <span className="doc-sub">42,800 Rows Indexed • S3 Source</span>
                </div>
              </div>
            </div>
          </div>

          {/* Claims Referencing Entity */}
          <div className="entity-pane-section">
            <h4 className="section-title">Synthesized Claims</h4>
            <div className="entity-claim-box">
              <span className="claim-verified-pill">G1 Verified</span>
              <p className="claim-text-sm">
                "{node.label} maintains +4.2% variance acceleration across {workspace.name} reasoning models."
              </p>
            </div>
          </div>

          {/* Evidence Certificate */}
          <div className="entity-pane-section">
            <h4 className="section-title">Cryptographic Evidence</h4>
            <div className="evidence-cert-mini">
              <div className="cert-row">
                <ShieldCheck size={16} className="shield-green" />
                <span>SHA-256 Manifest: <code>sha256-7f9a2b1c4e7d...</code></span>
              </div>
              <div className="cert-row">
                <Layers size={14} className="layers-icon" />
                <span>Scope Boundary: {workspace.name} Context</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={() => {
              onAddToast(`Exported ${node.label} entity knowledge package`);
              onClose();
            }}
          >
            <Download size={14} /> Export Entity Knowledge Package
          </button>
        </div>
      </div>
    </div>
  );
};

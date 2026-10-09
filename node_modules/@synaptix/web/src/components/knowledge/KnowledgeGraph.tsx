import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Search, BrainCircuit, Sparkles } from 'lucide-react';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  color: string;
  description: string;
  documentCount: number;
  evidenceGrade: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (node: GraphNode) => void;
  selectedNodeId?: string | null;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [graphSearch, setGraphSearch] = useState('');

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

  // Filter nodes matching graph search
  const matchingNodeIds = nodes
    .filter((n) => graphSearch.trim() === '' || n.label.toLowerCase().includes(graphSearch.toLowerCase()))
    .map((n) => n.id);

  // Determine connected nodes for hover highlighting
  const connectedNodeIds = new Set<string>();
  if (hoveredNodeId) {
    connectedNodeIds.add(hoveredNodeId);
    edges.forEach((edge) => {
      if (edge.source === hoveredNodeId) connectedNodeIds.add(edge.target);
      if (edge.target === hoveredNodeId) connectedNodeIds.add(edge.source);
    });
  }

  return (
    <div className="knowledge-graph-card" aria-label="Interactive Knowledge Graph Visualization">
      {/* Graph Top Control Bar */}
      <div className="graph-control-bar">
        <div className="bar-left-group">
          <BrainCircuit size={18} className="brain-purple-icon" />
          <span className="graph-title">Semantic Entity & Relationship Graph</span>
          <span className="node-count-badge">{nodes.length} Entities • {edges.length} Relations</span>
        </div>

        <div className="bar-right-controls">
          {/* Graph Search */}
          <div className="graph-search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              value={graphSearch}
              onChange={(e) => setGraphSearch(e.target.value)}
              placeholder="Search nodes..."
              className="graph-search-input"
            />
          </div>

          {/* Zoom Buttons */}
          <div className="zoom-btn-group">
            <button type="button" onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">
              <ZoomOut size={14} />
            </button>
            <span className="zoom-value-text">{Math.round(zoomLevel * 100)}%</span>
            <button type="button" onClick={handleZoomIn} className="zoom-btn" title="Zoom In">
              <ZoomIn size={14} />
            </button>
            <button type="button" onClick={handleResetZoom} className="zoom-btn" title="Center View">
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="svg-canvas-wrapper">
        <svg
          viewBox="0 0 800 420"
          className="knowledge-svg-canvas"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* Defs for Arrow Markers */}
          <defs>
            <marker
              id="edge-arrow"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
            </marker>
            <marker
              id="edge-arrow-active"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#1769E0" />
            </marker>
          </defs>

          {/* Render Edges */}
          <g className="graph-edges-layer">
            {edges.map((edge) => {
              const srcNode = nodes.find((n) => n.id === edge.source);
              const tgtNode = nodes.find((n) => n.id === edge.target);

              if (!srcNode || !tgtNode) return null;

              const isHighlighted =
                hoveredNodeId === edge.source || hoveredNodeId === edge.target ||
                selectedNodeId === edge.source || selectedNodeId === edge.target;

              const midX = (srcNode.x + tgtNode.x) / 2;
              const midY = (srcNode.y + tgtNode.y) / 2;

              return (
                <g key={edge.id} className={`edge-group ${isHighlighted ? 'highlighted' : ''}`}>
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={isHighlighted ? '#1769E0' : '#CBD5E1'}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    strokeDasharray={isHighlighted ? 'none' : '4 3'}
                    markerEnd={isHighlighted ? 'url(#edge-arrow-active)' : 'url(#edge-arrow)'}
                    opacity={hoveredNodeId && !isHighlighted ? 0.25 : 0.85}
                  />
                  {/* Relationship Label Pill */}
                  {(() => {
                    const edgeLabelWidth = Math.max(76, edge.label.length * 6.5 + 18);
                    return (
                      <>
                        <rect
                          x={midX - edgeLabelWidth / 2}
                          y={midY - 10}
                          width={edgeLabelWidth}
                          height={20}
                          rx={5}
                          fill="#FFFFFF"
                          stroke={isHighlighted ? '#1769E0' : '#E2E8F0'}
                          strokeWidth={isHighlighted ? 1.5 : 1}
                          opacity={hoveredNodeId && !isHighlighted ? 0.3 : 0.96}
                        />
                        <text
                          x={midX}
                          y={midY + 4}
                          textAnchor="middle"
                          fontSize="9.5"
                          fontWeight="600"
                          fill={isHighlighted ? '#1769E0' : '#64748B'}
                          opacity={hoveredNodeId && !isHighlighted ? 0.3 : 1}
                        >
                          {edge.label}
                        </text>
                      </>
                    );
                  })()}
                </g>
              );
            })}
          </g>

          {/* Render Nodes */}
          <g className="graph-nodes-layer">
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isConnected = hoveredNodeId ? connectedNodeIds.has(node.id) : true;
              const isSearchMatch = matchingNodeIds.includes(node.id);

              const opacity = (hoveredNodeId && !isConnected) || (!isSearchMatch) ? 0.25 : 1;
              const labelWidth = Math.max(120, node.label.length * 7 + 22);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => onSelectNode(node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className={`node-group ${isSelected ? 'selected' : ''}`}
                  opacity={opacity}
                  style={{ cursor: 'pointer', transition: 'all 200ms ease' }}
                >
                  {/* Glowing Ring on Hover/Select */}
                  {(isSelected || isHovered) && (
                    <circle r="26" fill={node.color} opacity="0.2" className="animate-pulse" />
                  )}

                  {/* Main Circle Node */}
                  <circle
                    r="18"
                    fill="#FFFFFF"
                    stroke={isSelected ? '#1769E0' : node.color}
                    strokeWidth={isSelected ? 3.5 : 2.5}
                    className="node-circle"
                  />

                  {/* Inner Accent Dot */}
                  <circle r="6" fill={node.color} />

                  {/* Node Label Card below */}
                  <rect
                    x={-labelWidth / 2}
                    y="25"
                    width={labelWidth}
                    height="23"
                    rx="5"
                    fill="#FFFFFF"
                    stroke={isSelected ? '#1769E0' : '#E2E8F0'}
                    strokeWidth={isSelected ? 1.5 : 1}
                    className="node-label-bg"
                  />
                  <text
                    x="0"
                    y="40"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#0B1F3A"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Graph Footer Hint */}
      <div className="graph-footer-hint">
        <Sparkles size={12} className="sparkle-blue" />
        <span>Click any node to inspect extracted claims, citations, and cryptographic evidence.</span>
      </div>
    </div>
  );
};

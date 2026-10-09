import React, { useState } from 'react';
import {
  ShieldCheck,
  Info,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ZoomIn
} from 'lucide-react';

export interface ChartBaseProps {
  title: string;
  description: string;
  metric: string;
  period: string;
  source: string;
  evidenceGrade?: string;
  onDrillDown?: (periodOrCategory: string) => void;
}

// 1. TIME SERIES LINE CHART
export interface TimeSeriesPoint {
  year: number;
  value: number;
  label: string;
  isAnomaly?: boolean;
  anomalyNote?: string;
}

export interface TimeSeriesLineChartProps extends ChartBaseProps {
  data: TimeSeriesPoint[];
  unit?: string;
}

export const TimeSeriesLineChart: React.FC<TimeSeriesLineChartProps> = ({
  title,
  description,
  metric,
  period,
  source,
  evidenceGrade = 'G1 Verified',
  data,
  unit = '%',
  onDrillDown,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);

  const width = 720;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const minVal = Math.min(...data.map((d) => d.value)) * 0.85;
  const maxVal = Math.max(...data.map((d) => d.value)) * 1.1;

  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPoints = `${getX(0)},${paddingTop + chartHeight} ` + points + ` ${getX(data.length - 1)},${paddingTop + chartHeight}`;

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <div>
          <div className="analytics-chart-title-row">
            <h3 className="analytics-chart-title">{title}</h3>
            <span className="analytics-evidence-badge">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
              {evidenceGrade}
            </span>
          </div>
          <p className="analytics-chart-desc">{description}</p>
        </div>
        <div className="analytics-chart-meta-tags">
          <span className="meta-tag font-mono">{metric}</span>
          <span className="meta-tag">{period}</span>
        </div>
      </div>

      <div className="analytics-svg-container relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1769E0" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1769E0" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * ratio;
            const valLabel = (maxVal - ratio * (maxVal - minVal)).toFixed(1);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="svg-axis-text"
                >
                  {valLabel}{unit}
                </text>
              </g>
            );
          })}

          <polygon points={areaPoints} fill="url(#lineGrad)" />

          <polyline
            fill="none"
            stroke="#1769E0"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.value);
            const isSelected = hoveredPoint?.year === d.year;

            return (
              <g key={d.year} className="cursor-pointer" onClick={() => onDrillDown?.(d.year.toString())}>
                <text
                  x={cx}
                  y={height - 12}
                  textAnchor="middle"
                  className={`svg-axis-text ${d.isAnomaly ? 'font-semibold fill-amber-700' : ''}`}
                >
                  {d.year}
                </text>

                {d.isAnomaly && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    className="animate-ping opacity-75"
                    fill="#DC2626"
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 7 : d.isAnomaly ? 6 : 4}
                  fill={d.isAnomaly ? '#DC2626' : '#1769E0'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredPoint(d)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div
            className="analytics-tooltip shadow-lg"
            style={{
              left: `${((data.findIndex((d) => d.year === hoveredPoint.year) / (data.length - 1)) * 80 + 10)}%`,
              top: '20%',
            }}
          >
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span>{hoveredPoint.year} Data Point</span>
              {hoveredPoint.isAnomaly && (
                <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded font-bold">
                  Anomaly
                </span>
              )}
            </div>
            <div className="text-sm font-mono text-blue-700 mt-1">
              {metric}: <strong>{hoveredPoint.value}{unit}</strong>
            </div>
            {hoveredPoint.anomalyNote && (
              <p className="text-xs text-slate-600 mt-1 italic border-t pt-1 border-slate-200">
                "{hoveredPoint.anomalyNote}"
              </p>
            )}
            <button
              onClick={() => onDrillDown?.(hoveredPoint.year.toString())}
              className="mt-2 text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              <ZoomIn className="w-3 h-3" /> Drill into underlying rows
            </button>
          </div>
        )}
      </div>

      <div className="analytics-chart-footer">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Source: <strong className="text-slate-700">{source}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDrillDown?.(period)}
            className="analytics-action-btn"
          >
            <ZoomIn className="w-3.5 h-3.5 mr-1" />
            Inspect Rows
          </button>
        </div>
      </div>
    </div>
  );
};


// 2. CATEGORY COMPARISON BAR CHART
export interface CategoryComparisonItem {
  category: string;
  valCurrent: number;
  valBaseline: number;
  unit?: string;
  deltaPercent: number;
}

export interface CategoryBarChartProps extends ChartBaseProps {
  data: CategoryComparisonItem[];
  baselineLabel: string;
  currentLabel: string;
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  title,
  description,
  metric,
  period,
  source,
  evidenceGrade = 'G1 Verified',
  data,
  baselineLabel,
  currentLabel,
  onDrillDown,
}) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.valCurrent, d.valBaseline])) * 1.15;

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <div>
          <div className="analytics-chart-title-row">
            <h3 className="analytics-chart-title">{title}</h3>
            <span className="analytics-evidence-badge">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
              {evidenceGrade}
            </span>
          </div>
          <p className="analytics-chart-desc">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-3 h-3 rounded bg-slate-300 inline-block"></span>
            <span>{baselineLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block"></span>
            <span>{currentLabel}</span>
          </div>
        </div>
      </div>

      <div className="py-4 space-y-4">
        {data.map((item) => {
          const baselinePct = (item.valBaseline / maxVal) * 100;
          const currentPct = (item.valCurrent / maxVal) * 100;
          const isNegative = item.deltaPercent < 0;

          return (
            <div key={item.category} className="group cursor-pointer" onClick={() => onDrillDown?.(item.category)}>
              <div className="flex justify-between items-center text-sm font-medium mb-1">
                <span className="text-slate-800 font-semibold group-hover:text-blue-600 transition-colors">
                  {item.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">
                    {item.valBaseline} vs {item.valCurrent}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold font-mono ${
                      isNegative
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isNegative ? <TrendingDown className="w-3 h-3 mr-0.5 inline" /> : <TrendingUp className="w-3 h-3 mr-0.5 inline" />}
                    {item.deltaPercent > 0 ? '+' : ''}{item.deltaPercent}%
                  </span>
                </div>
              </div>

              <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100 group-hover:border-blue-200 transition-all">
                <div className="w-full bg-slate-200 rounded h-3 overflow-hidden">
                  <div
                    className="bg-slate-400 h-full rounded transition-all duration-700"
                    style={{ width: `${baselinePct}%` }}
                  />
                </div>
                <div className="w-full bg-slate-200 rounded h-3.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded transition-all duration-700"
                    style={{ width: `${currentPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="analytics-chart-footer">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Source: <strong className="text-slate-700">{source}</strong> | Metric: <strong>{metric}</strong> | Period: <strong>{period}</strong></span>
        </div>
        <button onClick={() => onDrillDown?.(period)} className="analytics-action-btn">
          <ZoomIn className="w-3.5 h-3.5 mr-1" />
          Inspect Category Data
        </button>
      </div>
    </div>
  );
};


// 3. RELATIONSHIPS SCATTER PLOT
export interface ScatterPoint {
  id: string;
  xLabel: string;
  xValue: number;
  yValue: number;
  label: string;
  category: string;
}

export interface RelationshipScatterPlotProps extends ChartBaseProps {
  data: ScatterPoint[];
  xTitle: string;
  yTitle: string;
  correlationCoeff: number;
}

export const RelationshipScatterPlot: React.FC<RelationshipScatterPlotProps> = ({
  title,
  description,
  metric,
  period,
  source,
  evidenceGrade = 'G1 Verified',
  data,
  xTitle,
  yTitle,
  correlationCoeff,
  onDrillDown,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);

  const width = 720;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const xVals = data.map((d) => d.xValue);
  const yVals = data.map((d) => d.yValue);

  const minX = Math.min(...xVals) * 0.9;
  const maxX = Math.max(...xVals) * 1.1;
  const minY = Math.min(...yVals) * 0.9;
  const maxY = Math.max(...yVals) * 1.1;

  const getX = (val: number) => paddingLeft + ((val - minX) / (maxX - minX)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;

  const n = data.length;
  const sumX = xVals.reduce((a, b) => a + b, 0);
  const sumY = yVals.reduce((a, b) => a + b, 0);
  const sumXY = data.reduce((a, b) => a + b.xValue * b.yValue, 0);
  const sumXX = xVals.reduce((a, b) => a + b * b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const lineStartX = minX;
  const lineStartY = slope * lineStartX + intercept;
  const lineEndX = maxX;
  const lineEndY = slope * lineEndX + intercept;

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <div>
          <div className="analytics-chart-title-row">
            <h3 className="analytics-chart-title">{title}</h3>
            <span className="analytics-evidence-badge">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
              {evidenceGrade}
            </span>
          </div>
          <p className="analytics-chart-desc">{description}</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="text-slate-500">Pearson Correlation (r):</span>
          <strong className={correlationCoeff < 0 ? 'text-amber-700' : 'text-blue-700'}>
            {correlationCoeff > 0 ? '+' : ''}{correlationCoeff.toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="analytics-svg-container relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <text x={width / 2} y={height - 8} textAnchor="middle" className="svg-axis-title">
            {xTitle}
          </text>
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 15 ${height / 2})`}
            className="svg-axis-title"
          >
            {yTitle}
          </text>

          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * ratio;
            return (
              <line
                key={idx}
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth="1"
              />
            );
          })}

          <line
            x1={getX(lineStartX)}
            y1={getY(lineStartY)}
            x2={getX(lineEndX)}
            y2={getY(lineEndY)}
            stroke="#D97706"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {data.map((point) => {
            const cx = getX(point.xValue);
            const cy = getY(point.yValue);
            const isSelected = hoveredPoint?.id === point.id;

            return (
              <g key={point.id} className="cursor-pointer" onClick={() => onDrillDown?.(point.label)}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 8 : 5}
                  fill="#1769E0"
                  fillOpacity="0.75"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div
            className="analytics-tooltip shadow-lg"
            style={{
              left: `${((hoveredPoint.xValue - minX) / (maxX - minX)) * 75 + 12}%`,
              top: '15%',
            }}
          >
            <div className="font-semibold text-slate-900">{hoveredPoint.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{hoveredPoint.category}</div>
            <div className="text-xs font-mono text-slate-700 mt-1">
              {xTitle}: <strong>{hoveredPoint.xValue}</strong>
            </div>
            <div className="text-xs font-mono text-blue-700">
              {yTitle}: <strong>{hoveredPoint.yValue}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="analytics-chart-footer">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span className="italic">Source: {source} | Metric: {metric} | Correlation indicates co-variance, not verified causation.</span>
        </div>
        <button onClick={() => onDrillDown?.(period)} className="analytics-action-btn">
          <ZoomIn className="w-3.5 h-3.5 mr-1" />
          Inspect Scatter Data
        </button>
      </div>
    </div>
  );
};


// 4. COMPOSITION STACKED BAR CHART
export interface CompositionYearData {
  period: string;
  segments: {
    name: string;
    value: number;
    color: string;
  }[];
}

export interface CompositionStackedBarProps extends ChartBaseProps {
  data: CompositionYearData[];
}

export const CompositionStackedBar: React.FC<CompositionStackedBarProps> = ({
  title,
  description,
  metric,
  period,
  source,
  evidenceGrade = 'G1 Verified',
  data,
  onDrillDown,
}) => {
  const segmentLegend = data[0]?.segments.map((s) => ({ name: s.name, color: s.color })) || [];

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <div>
          <div className="analytics-chart-title-row">
            <h3 className="analytics-chart-title">{title}</h3>
            <span className="analytics-evidence-badge">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
              {evidenceGrade}
            </span>
          </div>
          <p className="analytics-chart-desc">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {segmentLegend.map((seg) => (
            <div key={seg.name} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: seg.color }} />
              <span>{seg.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="py-4 space-y-3">
        {data.map((item) => {
          const totalVal = item.segments.reduce((acc, s) => acc + s.value, 0);

          return (
            <div key={item.period} className="group cursor-pointer" onClick={() => onDrillDown?.(item.period)}>
              <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1">
                <span className="font-semibold text-slate-800">{item.period}</span>
                <span className="font-mono text-slate-500">Total: ${totalVal.toFixed(1)}M</span>
              </div>
              <div className="flex h-5 w-full bg-slate-100 rounded overflow-hidden shadow-inner border border-slate-200">
                {item.segments.map((seg) => {
                  const pct = (seg.value / totalVal) * 100;
                  return (
                    <div
                      key={seg.name}
                      style={{ width: `${pct}%`, backgroundColor: seg.color }}
                      className="h-full transition-all duration-500 hover:brightness-110 relative group/seg"
                      title={`${seg.name}: $${seg.value}M (${pct.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="analytics-chart-footer">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Source: <strong className="text-slate-700">{source}</strong> | Metric: <strong>{metric}</strong></span>
        </div>
        <button onClick={() => onDrillDown?.(period)} className="analytics-action-btn">
          <ZoomIn className="w-3.5 h-3.5 mr-1" />
          Drill into Composition
        </button>
      </div>
    </div>
  );
};

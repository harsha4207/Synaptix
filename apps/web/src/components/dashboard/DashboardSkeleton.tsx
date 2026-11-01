import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        padding: '28px 32px',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
      aria-busy="true"
      aria-label="Loading dashboard telemetry"
    >
      {/* 1. HEADER SKELETON */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ width: '140px', height: '14px', background: '#F1F5F9', borderRadius: '4px' }} />
          <div style={{ width: '280px', height: '24px', background: '#E2E8F0', borderRadius: '6px' }} />
          <div style={{ width: '380px', height: '14px', background: '#F1F5F9', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ width: '160px', height: '36px', background: '#F1F5F9', borderRadius: '8px' }} />
          <div style={{ width: '90px', height: '36px', background: '#F1F5F9', borderRadius: '8px' }} />
        </div>
      </div>

      {/* 2. KPI GRID SKELETON (6 cards) */}
      <div className="dash-kpi-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '12px', background: '#F1F5F9', borderRadius: '4px' }} />
              <div style={{ width: '28px', height: '28px', background: '#F1F5F9', borderRadius: '6px' }} />
            </div>
            <div style={{ width: '90px', height: '28px', background: '#E2E8F0', borderRadius: '6px' }} />
            <div style={{ width: '110px', height: '12px', background: '#F8FAFC', borderRadius: '4px' }} />
          </div>
        ))}
      </div>

      {/* 3. CHARTS SKELETON */}
      <div className="dash-two-col">
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '24px',
            height: '340px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ width: '180px', height: '18px', background: '#E2E8F0', borderRadius: '4px' }} />
          <div style={{ width: '240px', height: '12px', background: '#F1F5F9', borderRadius: '4px' }} />
          <div style={{ flex: 1, background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #E2E8F0' }} />
        </div>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '24px',
            height: '340px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ width: '180px', height: '18px', background: '#E2E8F0', borderRadius: '4px' }} />
          <div style={{ width: '240px', height: '12px', background: '#F1F5F9', borderRadius: '4px' }} />
          <div style={{ flex: 1, background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #E2E8F0' }} />
        </div>
      </div>

      {/* 4. LOWER SECTIONS SKELETON */}
      <div className="dash-two-col">
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '24px',
            height: '280px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ width: '160px', height: '16px', background: '#E2E8F0', borderRadius: '4px' }} />
          <div style={{ flex: 1, background: '#F8FAFC', borderRadius: '8px' }} />
        </div>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '24px',
            height: '280px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ width: '160px', height: '16px', background: '#E2E8F0', borderRadius: '4px' }} />
          <div style={{ flex: 1, background: '#F8FAFC', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );
};


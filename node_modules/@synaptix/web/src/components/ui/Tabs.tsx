import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils';

const TabsRoot = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: 'underline' | 'segmented';
  }
>(({ className, variant = 'underline', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      variant === 'segmented'
        ? 'inline-flex h-10 items-center justify-center rounded-[var(--r-lg)] bg-[var(--c-page)] p-1 text-[var(--c-text-2)] border border-[var(--c-border)]'
        : 'inline-flex items-center gap-6 border-b border-[var(--c-border)] w-full',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: 'underline' | 'segmented';
  }
>(({ className, variant = 'underline', ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-blue)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      variant === 'segmented'
        ? 'rounded-[var(--r-md)] px-3 py-1.5 text-[var(--c-text-2)] data-[state=active]:bg-[var(--c-surface)] data-[state=active]:text-[var(--c-text-1)] data-[state=active]:shadow-xs'
        : 'py-3 text-[var(--c-text-2)] hover:text-[var(--c-text-1)] border-b-2 border-transparent data-[state=active]:border-[var(--c-blue)] data-[state=active]:text-[var(--c-blue)] data-[state=active]:font-bold',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-blue)] focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs?: TabItem[];
  activeTab?: string;
  onChange?: (id: string) => void;
  variant?: 'underline' | 'segmented';
  className?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
  defaultValue,
  value,
  onValueChange,
  children,
}) => {
  if (tabs && activeTab !== undefined && onChange) {
    if (variant === 'segmented') {
      return (
        <div className={cn('segmented-control', className)} role="tablist">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                className={cn('segmented-btn', isActive && 'active')}
                onClick={() => onChange(tab.id)}
              >
                {tab.icon && <span style={{ display: 'inline-flex' }}>{tab.icon}</span>}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className="count-pill">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className={cn('tabs-bar', className)} role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              className={cn('tab-btn', isActive && 'active')}
              onClick={() => onChange(tab.id)}
            >
              {tab.icon && <span style={{ display: 'inline-flex' }}>{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="tab-badge">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <TabsRoot
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      {children}
    </TabsRoot>
  );
};

export { TabsRoot, TabsList, TabsTrigger, TabsContent };

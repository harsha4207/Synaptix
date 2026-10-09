import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    style={{ zIndex: 1100 }}
    className={cn(
      'z-50 overflow-hidden rounded-[var(--r-sm)] bg-[#0B1F3A] px-2.5 py-1 text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export interface TooltipProps {
  content?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  delayDuration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  delayDuration = 200,
  open,
  onOpenChange,
}) => {
  if (content !== undefined) {
    return (
      <TooltipProvider delayDuration={delayDuration}>
        <TooltipRoot open={open} onOpenChange={onOpenChange}>
          <TooltipTrigger asChild>
            <span style={{ display: 'inline-flex' }}>{children}</span>
          </TooltipTrigger>
          <TooltipContent side={position}>
            {content}
          </TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot open={open} onOpenChange={onOpenChange}>{children}</TooltipRoot>
    </TooltipProvider>
  );
};

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };

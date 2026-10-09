import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const DialogRoot = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[#0B1F3A]/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    style={{ zIndex: 1000 }}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: string;
  hideClose?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size = 'md', maxWidth, hideClose = false, style, ...props }, ref) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        style={{
          zIndex: 1001,
          maxWidth: maxWidth || undefined,
          ...style,
        }}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 flex flex-col w-full translate-x-[-50%] translate-y-[-50%] border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-xl duration-200 rounded-[var(--r-xl)] sm:rounded-[var(--r-2xl)] max-h-[90vh] overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--c-blue)] focus:ring-offset-2 disabled:pointer-events-none p-1.5 text-[var(--c-text-2)] hover:text-[var(--c-text-1)] cursor-pointer">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  title,
  description,
  onClose,
  badge,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  onClose?: () => void;
  badge?: React.ReactNode;
}) => {
  if (title || description || onClose || badge) {
    return (
      <div
        className={cn(
          'flex items-start justify-between border-b border-[var(--c-border)] pb-4 text-left shrink-0',
          className
        )}
        {...props}
      >
        <div className="flex flex-col space-y-1.5 min-w-0 pr-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold leading-tight tracking-tight font-display text-[var(--c-text-1)] m-0">
              {title}
            </h2>
            {badge}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-[var(--c-text-2)] mt-1 m-0 leading-relaxed">{description}</p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg opacity-70 hover:opacity-100 text-[var(--c-text-2)] p-1.5 hover:bg-[var(--c-page)] transition-colors shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left shrink-0', className)}
      {...props}
    >
      {children}
    </div>
  );
};
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3 border-t border-[var(--c-border)] pt-4 mt-2 shrink-0',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-bold leading-none tracking-tight font-display text-[var(--c-text-1)]',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-[var(--c-text-2)]', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogBody = ({
  className,
  style,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('py-2 text-[var(--c-text-1)]', className)} style={style} {...props}>
    {children}
  </div>
);
DialogBody.displayName = 'DialogBody';

export interface DialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  open,
  onClose,
  onOpenChange,
  size = 'md',
  maxWidth,
  children,
  ariaLabel = 'Dialog Window',
  className,
}) => {
  if (isOpen !== undefined) {
    const handleOpenChange = (nextOpen: boolean) => {
      if (!nextOpen && onClose) onClose();
      if (onOpenChange) onOpenChange(nextOpen);
    };

    return (
      <DialogRoot open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          size={size}
          maxWidth={maxWidth}
          className={className}
          aria-label={ariaLabel}
          hideClose={true}
        >
          {children}
        </DialogContent>
      </DialogRoot>
    );
  }

  return <DialogRoot open={open} onOpenChange={onOpenChange}>{children}</DialogRoot>;
};

export {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
};

// InfoDrawer - Responsive overlay component
// Desktop (>=1024px): Right-side slide-over drawer (420-520px)
// Mobile: Bottom sheet with drag handle
// Uses portal to render at document.body level, prevents layout reflow

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';

interface InfoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function InfoDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: InfoDrawerProps) {
  const isMobile = useIsMobile();

  // Mobile: Bottom sheet with drag handle
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
          <div className={cn('px-4 pb-6 overflow-y-auto', className)}>
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Right-side slide-over drawer
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'w-[420px] sm:w-[480px] sm:max-w-[520px] overflow-y-auto',
          'flex flex-col'
        )}
      >
        <SheetHeader className="shrink-0">
          <SheetTitle>{title}</SheetTitle>
          {description && (
            <SheetDescription>{description}</SheetDescription>
          )}
        </SheetHeader>
        <div className={cn('flex-1 overflow-y-auto py-4', className)}>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Re-export for convenience
export { useIsMobile };

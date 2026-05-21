'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface SessionWarningDialogProps {
  open: boolean;
  secondsRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionWarningDialog({
  open,
  secondsRemaining,
  onExtend,
  onLogout,
}: SessionWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Tu sesión está por expirar</DialogTitle>
          </DialogHeader>
          <DialogPrimitive.Description className="mt-2 text-sm text-[var(--text-muted)]">
            Tu sesión se cerrará en{' '}
            <span className="font-semibold tabular-nums">{secondsRemaining}</span>{' '}
            segundo{secondsRemaining !== 1 ? 's' : ''}.
          </DialogPrimitive.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onLogout}>
              Cerrar sesión
            </Button>
            <Button onClick={onExtend}>Extender sesión</Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}

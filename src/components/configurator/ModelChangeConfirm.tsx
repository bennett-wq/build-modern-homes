// Model Change Confirmation - Subtle inline confirmation when changing preselected model
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelChangeConfirmProps {
  isOpen: boolean;
  previousModelName: string;
  newModelName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ModelChangeConfirm({
  isOpen,
  previousModelName,
  newModelName,
  onConfirm,
  onCancel,
}: ModelChangeConfirmProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Changing models will update your price
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Switch from <span className="font-medium">{previousModelName}</span> to{' '}
                  <span className="font-medium">{newModelName}</span>?
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={onConfirm}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Change Model
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancel}
                    className="border-amber-300 dark:border-amber-700"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Keep {previousModelName}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
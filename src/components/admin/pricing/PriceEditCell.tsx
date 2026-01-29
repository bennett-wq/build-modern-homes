import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Check, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceEditCellProps {
  value: number;
  onSave: (value: number) => Promise<void>;
  format?: 'currency' | 'percent' | 'number';
  className?: string;
  disabled?: boolean;
}

export function PriceEditCell({ 
  value, 
  onSave, 
  format = 'currency',
  className,
  disabled = false 
}: PriceEditCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const formatDisplay = (val: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val);
    }
    if (format === 'percent') {
      return `${(val * 100).toFixed(1)}%`;
    }
    return val.toLocaleString();
  };

  const parseInput = (input: string): number | null => {
    // Remove currency symbols, commas, and percent signs
    const cleaned = input.replace(/[$,%\s]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return null;
    
    // Convert percent to decimal if needed
    if (format === 'percent') {
      return num / 100;
    }
    return num;
  };

  const handleStartEdit = () => {
    if (disabled) return;
    if (format === 'percent') {
      setEditValue((value * 100).toString());
    } else {
      setEditValue(value.toString());
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    const parsed = parseInput(editValue);
    if (parsed === null) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(parsed);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="h-8 w-28 text-right"
          disabled={isSaving}
        />
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-50 rounded"
          disabled={isSaving}
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
          disabled={isSaving}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleStartEdit}
      disabled={disabled}
      className={cn(
        "group flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/50 transition-colors text-right font-medium",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <span>{formatDisplay(value)}</span>
      {!disabled && (
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

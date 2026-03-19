import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LogHoursModalProps {
  open: boolean;
  onClose: () => void;
  taskName: string;
  currentHours: number;
  targetHours: number;
  onSubmit: (hours: number) => void;
}

export default function LogHoursModal({ open, onClose, taskName, currentHours, targetHours, onSubmit }: LogHoursModalProps) {
  const [hours, setHours] = useState(String(currentHours || ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parseFloat(hours) || 0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">Log Hours</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-2">{taskName}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1">
              Hours worked (target: {targetHours}h)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="24"
              value={hours}
              onChange={e => setHours(e.target.value)}
              className="bg-secondary border-border text-foreground"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border text-foreground">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: string[];
}

export function EmailDialog({ open, onOpenChange, recipients }: EmailDialogProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    // In production, this would integrate with an email service
    // For now, we'll show a success message
    toast.success(`Email sent to ${recipients.length} recipient(s)!`, {
      description: 'Your email has been queued for delivery.',
    });
    setSubject('');
    setBody('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Recipients ({recipients.length})</Label>
            <div className="p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
              <p className="text-sm">{recipients.join(', ')}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter your message..."
              rows={10}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!subject || !body}>
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

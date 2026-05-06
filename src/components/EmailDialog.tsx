import { useMemo, useState } from 'react';
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

function cleanEmails(emails: Array<string | null | undefined>) {
  return [
    ...new Set(
      emails
        .map((email) => email?.trim())
        .filter((email): email is string => Boolean(email))
    ),
  ];
}

export function EmailDialog({ open, onOpenChange, recipients }: EmailDialogProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const cleanRecipients = useMemo(
    () => cleanEmails(recipients),
    [recipients]
  );


  const handleSend = () => {
    if (cleanRecipients.length === 0) {
      toast.error('No email recipients found.');
      return;
    }

    const params = new URLSearchParams();

    params.set('bcc', cleanRecipients.join(','));

    if (subject.trim()) {
      params.set('subject', subject.trim());
    }

    if (body.trim()) {
      params.set('body', body.trim());
    }

    window.location.href = `mailto:?${params.toString()}`;

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
            <Label>BCC recipients ({cleanRecipients.length})</Label>
            <div className="p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
              {cleanRecipients.length > 0 ? (
                <p className="text-sm break-words">{cleanRecipients.join(', ')}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No email recipients found.</p>
              )}
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
            <Button onClick={handleSend} disabled={cleanRecipients.length === 0}>
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

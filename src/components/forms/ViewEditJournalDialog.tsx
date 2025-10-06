import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { JournalEntry } from "@/hooks/useJournalEntries";
import { format } from "date-fns";
import { Edit, Trash2, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ViewEditJournalDialogProps {
  entry: JournalEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

export function ViewEditJournalDialog({ entry, open, onOpenChange, onUpdate, onDelete }: ViewEditJournalDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    title: entry.title,
    entry_type: entry.entry_type,
    who: entry.who,
    entry_date: entry.entry_date,
    content: entry.content || "",
    tags: entry.tags,
  });

  const availableTags = ["Medication", "Symptom", "Feeding", "Mood", "Monitoring", "Daily Story"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.entry_type || !formData.who || !formData.entry_date) {
      return;
    }

    setLoading(true);
    try {
      await onUpdate(entry.id, formData);
      setIsEditing(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(entry.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{isEditing ? "Edit Entry" : "View Entry"}</DialogTitle>
              <div className="flex gap-2">
                {!isEditing && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <DialogDescription>
              {isEditing ? "Make changes to your journal entry" : "View your journal entry details"}
            </DialogDescription>
          </DialogHeader>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entry_type">Type</Label>
                  <Select
                    value={formData.entry_type}
                    onValueChange={(value) => setFormData({ ...formData, entry_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Note">Note</SelectItem>
                      <SelectItem value="Daily Note">Daily Note</SelectItem>
                      <SelectItem value="Medication">Medication</SelectItem>
                      <SelectItem value="Symptom">Symptom</SelectItem>
                      <SelectItem value="Feeding">Feeding</SelectItem>
                      <SelectItem value="Mood">Mood</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="who">Who</Label>
                  <Select
                    value={formData.who}
                    onValueChange={(value) => setFormData({ ...formData, who: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Infant">Infant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry_date">Date & Time</Label>
                <Input
                  id="entry_date"
                  type="datetime-local"
                  value={format(new Date(formData.entry_date), "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setFormData({ ...formData, entry_date: new Date(e.target.value).toISOString() })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={formData.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      title: entry.title,
                      entry_type: entry.entry_type,
                      who: entry.who,
                      entry_date: entry.entry_date,
                      content: entry.content || "",
                      tags: entry.tags,
                    });
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{entry.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {entry.who} • {entry.entry_type} • {format(new Date(entry.entry_date), 'MMM d, yyyy • h:mm a')}
                </p>
              </div>

              {entry.content && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                </div>
              )}

              {entry.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-4 border-t">
                <p>Created: {format(new Date(entry.created_at), 'PPpp')}</p>
                {entry.updated_at !== entry.created_at && (
                  <p>Updated: {format(new Date(entry.updated_at), 'PPpp')}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
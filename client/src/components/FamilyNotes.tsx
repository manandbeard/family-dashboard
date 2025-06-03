import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Note, InsertNote } from '@shared/schema';
import { COLORS, getTextColor } from '@/lib/utils/color';
import { format } from 'date-fns';

interface ToDoListProps {
  notes: Note[];
  color: string;
  onAddNote: (note: InsertNote) => Promise<boolean>;
  onDeleteNote: (id: number) => Promise<boolean>;
}

export function ToDoList({ notes, color, onAddNote, onDeleteNote }: ToDoListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState<{ title: string; content: string; author: string; }>({
    title: '',
    content: '',
    author: ''
  });
  const textColor = getTextColor(color);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || !newNote.author) return;
    
    const success = await onAddNote(newNote);
    if (success) {
      setNewNote({ title: '', content: '', author: '' });
      setIsOpen(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    await onDeleteNote(id);
  };
  
  return (
    <div className="h-full rounded-xl bg-white shadow-soft flex flex-col overflow-hidden">
      <div className="px-4 py-2 text-white flex justify-between items-center" style={{ backgroundColor: color }}>
        <h2 className="font-bold" style={{ color: textColor }}>To Do List</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white h-7 w-7 rounded-full hover:bg-white hover:bg-opacity-30"
              style={{ color: textColor }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <Input 
                  placeholder="Task description" 
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Textarea 
                  placeholder="Additional details (optional)" 
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <Input 
                  placeholder="Assigned to" 
                  value={newNote.author}
                  onChange={(e) => setNewNote({...newNote, author: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Add Task</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto" id="tasks-container">
        {notes.length === 0 ? (
          <p className="text-sm text-[#7A7A7A] text-center italic">No tasks yet</p>
        ) : (
          notes.map(note => (
            <div 
              key={note.id} 
              className={`mb-3 pb-3 border-b border-[${COLORS.DIVIDER_GRAY}] last:border-b-0 last:pb-0 flex items-start gap-2`}
            >
              <Button
                variant="outline"
                size="icon"
                className="h-5 w-5 rounded-full border-[#7A7A7A] flex-shrink-0 mt-0.5"
                onClick={() => handleDelete(note.id)}
              >
                <Check className="h-3 w-3 text-[#7A7A7A]" />
              </Button>
              <div className="flex-grow">
                <h4 className="font-bold text-sm">{note.title}</h4>
                {note.content && <p className="text-sm text-[#7A7A7A]">{note.content}</p>}
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-[#7A7A7A]">
                    Assigned to {note.author} • {note.createdAt ? format(new Date(note.createdAt), 'MMM d') : ''}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-[#7A7A7A] hover:text-red-500"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

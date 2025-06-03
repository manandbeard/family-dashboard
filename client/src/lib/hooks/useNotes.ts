import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Note, InsertNote } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/notes'],
  });

  useEffect(() => {
    if (data) {
      // Sort notes by creation date, newest first
      const sortedNotes = [...data].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setNotes(sortedNotes);
    }
  }, [data]);

  const addNote = async (note: InsertNote) => {
    try {
      await apiRequest('POST', '/api/notes', note);
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: "Note Added",
        description: "Your note has been added successfully",
      });
      return true;
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/notes/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: "Note Deleted",
        description: "Your note has been deleted",
      });
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    notes,
    isLoading,
    error,
    addNote,
    deleteNote
  };
}

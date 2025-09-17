import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotes } from "../endpoints/notes_GET.schema";
import { postNotes, type InputType as CreateNoteInput } from "../endpoints/notes_POST.schema";
import { postNotesUpdate, type InputType as UpdateNoteInput } from "../endpoints/notes/update_POST.schema";
import { postNotesDelete, type InputType as DeleteNoteInput } from "../endpoints/notes/delete_POST.schema";
import { postNotesSearch, type InputType as SearchNoteInput } from "../endpoints/notes/search_POST.schema";
import { type Note } from "../endpoints/notes_GET.schema";

const notesQueryKey = ["notes"];

export const useGetNotes = () => {
  return useQuery({
    queryKey: notesQueryKey,
    queryFn: () => getNotes(),
    select: (data) => data.notes,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newNote: CreateNoteInput) => postNotes(newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteToUpdate: UpdateNoteInput) => postNotesUpdate(noteToUpdate),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
      // Optionally, update the specific note in the cache for a more optimistic UI
      queryClient.setQueryData(notesQueryKey, (oldData: { notes: Note[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          notes: oldData.notes.map((note) =>
            note.id === data.note.id ? data.note : note
          ),
        };
      });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteToDelete: DeleteNoteInput) => postNotesDelete(noteToDelete),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
       // Optimistically remove the note from the cache
       queryClient.setQueryData(notesQueryKey, (oldData: { notes: Note[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          notes: oldData.notes.filter((note) => note.id !== data.id),
        };
      });
    },
  });
};

export const useSearchNotes = () => {
    // Using a mutation for search as it's a POST request triggered by user action, not on component mount.
    // For a GET-based search, useQuery would be more appropriate.
    return useMutation({
        mutationFn: (searchInput: SearchNoteInput) => postNotesSearch(searchInput),
        // No invalidation needed as search is a separate data slice
    });
};
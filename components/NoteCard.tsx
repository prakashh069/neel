import React, { useState, useEffect, useRef } from "react";
import * as z from "zod";
import { type Note } from "../endpoints/notes_GET.schema";
import styles from "./NoteCard.module.css";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { useUpdateNote, useDeleteNote } from "../helpers/useNotesQueries";
import { schema as updateNoteSchema } from "../endpoints/notes/update_POST.schema";
import {
  Form,
  FormControl,
  FormItem,
  FormMessage,
  useForm,
} from "./Form";
import { MoreVertical, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

interface NoteCardProps {
  note: Note;
  className?: string;
}

export const NoteCard = ({ note, className }: NoteCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const form = useForm({
    schema: updateNoteSchema.omit({ id: true }),
    defaultValues: {
      title: note.title,
      content: note.content,
      tags: note.tags || [],
    },
  });

  useEffect(() => {
    form.setValues({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
    });
  }, [note, form.setValues]);

    const handleSave = (values: Omit<z.infer<typeof updateNoteSchema>, 'id'>) => {
    updateNoteMutation.mutate(
      { id: note.id, ...values },
      {
        onSuccess: () => setIsEditing(false),
        onError: (err) => console.error("Failed to update note:", err),
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate({ id: note.id });
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing) return;
    // Don't trigger edit mode if a button or badge was clicked
    if ((e.target as HTMLElement).closest('button, [role="button"], [data-badge]')) {
      return;
    }
    setIsEditing(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        if (isEditing) {
          // Check for changes before auto-saving
          const hasChanged = form.values.title !== note.title ||
                             form.values.content !== note.content ||
                             JSON.stringify(form.values.tags) !== JSON.stringify(note.tags);
          if (hasChanged) {
            form.handleSubmit(handleSave)({ preventDefault: () => {} } as React.FormEvent);
          } else {
            setIsEditing(false);
          }
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, note, form]);

  if (isEditing) {
    return (
      <div ref={cardRef} className={`${styles.card} ${styles.editing} ${className || ""}`}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className={styles.form}>
            <FormItem name="title" className={styles.formItem}>
              <FormControl>
                <Input
                  value={form.values.title}
                  onChange={(e) => form.setValues((prev) => ({ ...prev, title: e.target.value }))}
                  className={styles.titleInput}
                  placeholder="Title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem name="content" className={styles.formItem}>
              <FormControl>
                <Textarea
                  value={form.values.content}
                  onChange={(e) => form.setValues((prev) => ({ ...prev, content: e.target.value }))}
                  className={styles.contentInput}
                  placeholder="Content"
                  rows={6}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem name="tags" className={styles.formItem}>
              <FormControl>
                <Input
                  value={(form.values.tags || []).join(", ")}
                  onChange={(e) => {
                    const tags = e.target.value.split(",").map(tag => tag.trim()).filter(Boolean);
                    form.setValues((prev) => ({ ...prev, tags }));
                  }}
                  className={styles.tagsInput}
                  placeholder="Tags, comma-separated"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <div className={styles.actions}>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={updateNoteMutation.isPending}>
                {updateNoteMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div ref={cardRef} className={`${styles.card} ${className || ""}`} onClick={handleCardClick} role="button" tabIndex={0}>
      <div className={styles.header}>
        <h3 className={styles.title}>{note.title}</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" className={styles.menuButton} onClick={(e) => e.stopPropagation()}>
              <MoreVertical size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={styles.popoverContent}>
            <Button variant="ghost" className={styles.popoverButton} onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
              <Trash2 size={14} /> Delete Note
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <p className={styles.content}>
        {note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content}
      </p>
      <div className={styles.footer}>
        <div className={styles.tags}>
          {(note.tags || []).map((tag) => (
            <Badge key={tag} variant="secondary" data-badge>{tag}</Badge>
          ))}
        </div>
        <span className={styles.date}>
          {new Date(note.createdAt!).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
import React from "react";
import { type Note } from "../endpoints/notes_GET.schema";
import { NoteCard } from "./NoteCard";
import { Skeleton } from "./Skeleton";
import styles from "./NoteGrid.module.css";
import { FileText } from "lucide-react";

interface NoteGridProps {
  notes: Note[] | undefined;
  isLoading: boolean;
  isSearchActive: boolean;
  className?: string;
}

const NoteGridSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className={styles.skeletonCard}>
        <Skeleton style={{ height: '1.5rem', width: '70%' }} />
        <Skeleton style={{ height: '1rem', width: '100%', marginTop: 'var(--spacing-4)' }} />
        <Skeleton style={{ height: '1rem', width: '90%' }} />
        <Skeleton style={{ height: '1rem', width: '50%' }} />
        <div className={styles.skeletonFooter}>
          <Skeleton style={{ height: '1.25rem', width: '4rem' }} />
          <Skeleton style={{ height: '1.25rem', width: '6rem' }} />
        </div>
      </div>
    ))}
  </>
);

export const NoteGrid = ({ notes, isLoading, isSearchActive, className }: NoteGridProps) => {
  if (isLoading) {
    return (
      <div className={`${styles.grid} ${className || ""}`}>
        <NoteGridSkeleton />
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FileText size={48} className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>
          {isSearchActive ? "No Results Found" : "No Notes Yet"}
        </h2>
        <p className={styles.emptyText}>
          {isSearchActive
            ? "Try a different search term."
            : "Click 'Add Note' to create your first note."}
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles.grid} ${className || ""}`}>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
};
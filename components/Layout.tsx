import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Layout.module.css";
import { CreateNoteSheet } from "./CreateNoteSheet";
import { Button } from "./Button";
import { Plus } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export const Layout = ({ children, className }: LayoutProps) => {
  return (
    <div className={`${styles.layout} ${className || ""}`}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logoLink}>
            <h1 className={styles.title}>AI Second Brain</h1>
          </Link>
          <CreateNoteSheet>
            <Button>
              <Plus size={16} />
              Add Note
            </Button>
          </CreateNoteSheet>
        </div>
      </header>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
};
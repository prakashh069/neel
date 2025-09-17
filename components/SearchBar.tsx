import React, { useState, useEffect } from "react";
import { Input } from "./Input";
import { Search, X } from "lucide-react";
import styles from "./SearchBar.module.css";
import { useDebounce } from "../helpers/useDebounce";
import { Button } from "./Button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  className?: string;
}

export const SearchBar = ({ onSearch, isSearching, className }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className={`${styles.searchContainer} ${className || ""}`}>
      <Search size={20} className={styles.searchIcon} />
      <Input
        type="search"
        placeholder="Search notes by title, content, or tags..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.searchInput}
      />
      {query && (
        <Button variant="ghost" size="icon-sm" onClick={handleClear} className={styles.clearButton}>
          <X size={16} />
        </Button>
      )}
      {isSearching && <div className={styles.spinner}></div>}
    </div>
  );
};
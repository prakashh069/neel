import React, { useState } from "react";
import { Helmet } from "react-helmet";
import styles from "./_index.module.css";
import { useGetNotes, useSearchNotes } from "../helpers/useNotesQueries";
import { NoteGrid } from "../components/NoteGrid";
import { SearchBar } from "../components/SearchBar";
import { type Note } from "../endpoints/notes_GET.schema";

const IndexPage = () => {
  const { data: allNotes, isFetching: isFetchingNotes } = useGetNotes();
  const { mutate: searchNotes, data: searchResults, isPending: isSearching } = useSearchNotes();
  
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setIsSearchActive(true);
      searchNotes({ query });
    } else {
      setIsSearchActive(false);
    }
  };

  const notesToDisplay: Note[] | undefined = isSearchActive ? searchResults?.notes : allNotes;
  const isLoading = isSearchActive ? isSearching : isFetchingNotes;

  return (
    <>
      <Helmet>
        <title>Dashboard | AI Second Brain</title>
        <meta name="description" content="Your personal AI-powered knowledge base." />
      </Helmet>
      <div className={styles.container}>
        <SearchBar onSearch={handleSearch} isSearching={isSearching} />
        <NoteGrid 
          notes={notesToDisplay} 
          isLoading={isLoading} 
          isSearchActive={isSearchActive}
        />
      </div>
    </>
  );
};

export default IndexPage;
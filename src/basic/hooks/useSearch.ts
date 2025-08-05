import { useState } from "react";
import { useDebounce } from "./useDebounce";


export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  return {
    searchTerm, setSearchTerm,
    debouncedSearchTerm,
  };
};
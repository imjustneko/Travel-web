import { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

function Search({ onSearch }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const debouncedQuery = useDebounce(query, 500);
  
  useEffect(() => {
    onSearch(debouncedQuery, filters);
  }, [debouncedQuery, filters]);
  
  return (
    <div className="search-container">
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {/* Filters */}
    </div>
  );
}
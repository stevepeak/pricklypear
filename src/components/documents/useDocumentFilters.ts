import { useState, useEffect, useMemo } from 'react';
import {
  DOCUMENT_LABEL_INFO,
  type Document,
  type DocumentLabel,
} from '@/types/document';
import { z } from 'zod';

const documentLabelSchema = z.enum(
  Object.keys(DOCUMENT_LABEL_INFO) as [string, ...string[]]
);

const filtersSchema = z.object({
  search: z.string().optional().default(''),
  filterLabels: z.array(documentLabelSchema).optional().default([]),
});

export function useDocumentFilters(args: { documents: Document[] }) {
  const { documents } = args;
  const [search, setSearch] = useState(() => {
    const storedFilters = localStorage.getItem('documents.filters');
    if (storedFilters) {
      const parsed = filtersSchema.safeParse(JSON.parse(storedFilters));
      if (parsed.success) {
        return parsed.data.search;
      }
      localStorage.removeItem('documents.filters');
    }
    return '';
  });
  const [filterLabels, setFilterLabels] = useState<DocumentLabel[]>(() => {
    const storedFilters = localStorage.getItem('documents.filters');
    if (storedFilters) {
      const parsed = filtersSchema.safeParse(JSON.parse(storedFilters));
      if (parsed.success) {
        return parsed.data.filterLabels as DocumentLabel[];
      }
      localStorage.removeItem('documents.filters');
    }
    return [];
  });

  // Persist filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      ...(search.trim() && { search }),
      ...(filterLabels.length > 0 && { filterLabels }),
    };
    if (Object.keys(filters).length > 0) {
      localStorage.setItem('documents.filters', JSON.stringify(filters));
    } else {
      localStorage.removeItem('documents.filters');
    }
  }, [search, filterLabels]);

  const isFiltering = search.trim() !== '' || filterLabels.length > 0;

  const filtered = useMemo(
    () =>
      documents.filter((doc) => {
        const matchesSearch = doc.filename
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesLabels =
          filterLabels.length === 0 ||
          (doc.labels ?? []).some((l) => filterLabels.includes(l));
        return matchesSearch && matchesLabels;
      }),
    [documents, search, filterLabels]
  );

  const toggleFilterLabel = (label: DocumentLabel) => {
    setFilterLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setFilterLabels([]);
  };

  return {
    search,
    setSearch,
    filterLabels,
    setFilterLabels,
    isFiltering,
    filtered,
    toggleFilterLabel,
    clearFilters,
  };
}

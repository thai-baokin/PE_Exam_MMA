import { useMemo, useState } from 'react';
import { Book, Genre, Status } from '@/types';

export interface FilterState {
  genre: Genre | 'All';
  status: Status | 'All';
  favoritesOnly: boolean;
  search: string;
}

const DEFAULT_FILTER: FilterState = {
  genre: 'All',
  status: 'All',
  favoritesOnly: false,
  search: '',
};

export function useBookFilter(books: Book[]) {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  const filtered = useMemo(() => {
    let result = [...books];
    const search = filter.search.trim().toLowerCase();

    if (filter.genre !== 'All') result = result.filter((b) => b.genre === filter.genre);
    if (filter.status !== 'All') result = result.filter((b) => b.status === filter.status);
    if (filter.favoritesOnly) result = result.filter((b) => b.favorite);
    if (search) {
      result = result.filter(
        (b) => b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search)
      );
    }

    // Sort: alphabetical by title (case-insensitive), then by author
    result.sort((a, b) => {
      const titleCmp = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      if (titleCmp !== 0) return titleCmp;
      return a.author.toLowerCase().localeCompare(b.author.toLowerCase());
    });

    return result;
  }, [books, filter]);

  const summary = useMemo(() => {
    const totalFavorites = filtered.filter((b) => b.favorite).length;
    const statusCounts: Record<string, number> = {};
    for (const b of filtered) {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    }

    const statusOrder: Status[] = ['To Read', 'Reading', 'Finished'];
    const breakdown = Object.entries(statusCounts).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return statusOrder.indexOf(a[0] as Status) - statusOrder.indexOf(b[0] as Status);
    });

    return { total: filtered.length, favorites: totalFavorites, breakdown };
  }, [filtered]);

  const clearFilter = () => setFilter(DEFAULT_FILTER);

  return { filter, setFilter, filtered, summary, clearFilter };
}

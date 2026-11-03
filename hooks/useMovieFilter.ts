import { useMemo, useState } from 'react';
import { Movie, Genre, Status } from '@/types';

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

export function useMovieFilter(movies: Movie[]) {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  const filtered = useMemo(() => {
    let result = [...movies];
    const search = filter.search.trim().toLowerCase();

    if (filter.genre !== 'All') result = result.filter((m) => m.genre === filter.genre);
    if (filter.status !== 'All') result = result.filter((m) => m.status === filter.status);
    if (filter.favoritesOnly) result = result.filter((m) => m.favorite);
    if (search) {
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(search) ||
          m.director.toLowerCase().includes(search)
      );
    }

    // Sort: alphabetical by title (not case-sensitive; equal titles ordered by director)
    result.sort((a, b) => {
      const titleCmp = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      if (titleCmp !== 0) return titleCmp;
      return a.director.toLowerCase().localeCompare(b.director.toLowerCase());
    });

    return result;
  }, [movies, filter]);

  const summary = useMemo(() => {
    const totalFavorites = filtered.filter((m) => m.favorite).length;
    const statusCounts: Record<string, number> = {};
    for (const m of filtered) {
      statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
    }

    // equal counts tie breaker: Plan to Watch, then Watching, then Watched
    const statusOrder: Status[] = ['Plan to Watch', 'Watching', 'Watched'];
    const breakdown = Object.entries(statusCounts).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return statusOrder.indexOf(a[0] as Status) - statusOrder.indexOf(b[0] as Status);
    });

    return { total: filtered.length, favorites: totalFavorites, breakdown };
  }, [filtered]);

  const clearFilter = () => setFilter(DEFAULT_FILTER);

  return { filter, setFilter, filtered, summary, clearFilter };
}

export const useBookFilter = useMovieFilter;


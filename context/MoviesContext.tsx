import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './AuthContext';
import { Movie, MovieFormData, Genre, Status } from '@/types';

interface MoviesContextType {
  movies: Movie[];
  loading: boolean;
  addMovie: (data: MovieFormData) => Promise<void>;
  updateMovie: (id: string, data: Partial<MovieFormData>) => Promise<void>;
  toggleFavorite: (id: string, current: boolean) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;
  // aliases
  books: Movie[];
  addBook: (data: MovieFormData) => Promise<void>;
  updateBook: (id: string, data: Partial<MovieFormData>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
}

const MoviesContext = createContext<MoviesContextType>({
  movies: [],
  loading: true,
  addMovie: async () => {},
  updateMovie: async () => {},
  toggleFavorite: async () => {},
  deleteMovie: async () => {},
  books: [],
  addBook: async () => {},
  updateBook: async () => {},
  deleteBook: async () => {},
});

export function MoviesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMovies([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'movies'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Movie));
        setMovies(data);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore snapshot error:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const addMovie = useCallback(async (formData: MovieFormData) => {
    if (!user) throw new Error('Not authenticated');

    const titleTrimmed = formData.title.trim();
    const directorTrimmed = formData.director.trim();
    const titleLower = titleTrimmed.toLowerCase();
    const directorLower = directorTrimmed.toLowerCase();

    // Check duplicate in memory first
    const hasLocalDuplicate = movies.some(
      (m) =>
        m.title.trim().toLowerCase() === titleLower &&
        m.director.trim().toLowerCase() === directorLower
    );
    if (hasLocalDuplicate) {
      throw new Error('A movie with this title and director already exists.');
    }

    // Also check Firestore in case of race/concurrency
    const checkQuery = query(
      collection(db, 'movies'),
      where('userId', '==', user.uid)
    );
    const existingSnap = await getDocs(checkQuery);
    const hasRemoteDuplicate = existingSnap.docs.some((d) => {
      const data = d.data();
      return (
        data.title?.trim().toLowerCase() === titleLower &&
        data.director?.trim().toLowerCase() === directorLower
      );
    });
    if (hasRemoteDuplicate) {
      throw new Error('A movie with this title and director already exists.');
    }

    const ratingVal =
      formData.rating && formData.rating.trim() !== ''
        ? parseInt(formData.rating.trim(), 10)
        : null;

    await addDoc(collection(db, 'movies'), {
      userId: user.uid,
      title: titleTrimmed,
      director: directorTrimmed,
      genre: formData.genre as Genre,
      status: formData.status as Status,
      rating: ratingVal,
      favorite: false,
      notes: formData.notes?.trim() || null,
      createdAt: serverTimestamp(),
    });
  }, [user, movies]);

  const updateMovie = useCallback(
    async (id: string, formData: Partial<MovieFormData>) => {
      if (!user) throw new Error('Not authenticated');

      const existing = movies.find((m) => m.id === id);
      const newTitle = formData.title !== undefined ? formData.title.trim() : existing?.title;
      const newDirector = formData.director !== undefined ? formData.director.trim() : existing?.director;

      if (newTitle && newDirector) {
        const titleLower = newTitle.toLowerCase();
        const directorLower = newDirector.toLowerCase();
        const hasDuplicate = movies.some(
          (m) =>
            m.id !== id &&
            m.title.trim().toLowerCase() === titleLower &&
            m.director.trim().toLowerCase() === directorLower
        );
        if (hasDuplicate) {
          throw new Error('A movie with this title and director already exists.');
        }
      }

      const updateData: any = {};
      if (formData.title !== undefined) updateData.title = formData.title.trim();
      if (formData.director !== undefined) updateData.director = formData.director.trim();
      if (formData.genre !== undefined) updateData.genre = formData.genre;
      if (formData.status !== undefined) updateData.status = formData.status;
      if (formData.rating !== undefined) {
        updateData.rating =
          formData.rating.trim() !== '' ? parseInt(formData.rating.trim(), 10) : null;
      }
      if (formData.notes !== undefined) {
        updateData.notes = formData.notes.trim() || null;
      }

      await updateDoc(doc(db, 'movies', id), updateData);
    },
    [user, movies]
  );

  const toggleFavorite = useCallback(
    async (id: string, current: boolean) => {
      if (!user) throw new Error('Not authenticated');
      await updateDoc(doc(db, 'movies', id), {
        favorite: !current,
      });
    },
    [user]
  );

  const deleteMovie = useCallback(
    async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      await deleteDoc(doc(db, 'movies', id));
    },
    [user]
  );

  return (
    <MoviesContext.Provider
      value={{
        movies,
        loading,
        addMovie,
        updateMovie,
        toggleFavorite,
        deleteMovie,
        // compatibility aliases
        books: movies,
        addBook: addMovie,
        updateBook: updateMovie,
        deleteBook: deleteMovie,
      }}
    >
      {children}
    </MoviesContext.Provider>
  );
}

export function useMovies() {
  return useContext(MoviesContext);
}

// Aliases for compatibility
export const useBooks = useMovies;
export const BooksProvider = MoviesProvider;
export const BooksContext = MoviesContext;


import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './AuthContext';
import { Book, BookFormData, Genre, Status } from '@/types';

interface BooksContextType {
  books: Book[];
  loading: boolean;
  addBook: (data: BookFormData) => Promise<void>;
  updateBook: (id: string, data: Partial<BookFormData>) => Promise<void>;
  toggleFavorite: (id: string, current: boolean) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
}

const BooksContext = createContext<BooksContextType>({
  books: [],
  loading: true,
  addBook: async () => {},
  updateBook: async () => {},
  toggleFavorite: async () => {},
  deleteBook: async () => {},
});

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBooks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'books'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
      setBooks(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addBook = useCallback(async (formData: BookFormData) => {
    if (!user) throw new Error('Not authenticated');

    const titleTrimmed = formData.title.trim();
    const authorTrimmed = formData.author.trim();
    const titleLower = titleTrimmed.toLowerCase();
    const authorLower = authorTrimmed.toLowerCase();

    // Check duplicate in memory first
    const hasLocalDuplicate = books.some(
      (b) =>
        b.title.trim().toLowerCase() === titleLower &&
        b.author.trim().toLowerCase() === authorLower
    );
    if (hasLocalDuplicate) {
      throw new Error('You already have a book with this title and author.');
    }

    // Also check Firestore in case of concurrency
    const checkQuery = query(
      collection(db, 'books'),
      where('userId', '==', user.uid)
    );
    const existingSnap = await getDocs(checkQuery);
    const hasRemoteDuplicate = existingSnap.docs.some((d) => {
      const data = d.data();
      return (
        data.title?.trim().toLowerCase() === titleLower &&
        data.author?.trim().toLowerCase() === authorLower
      );
    });
    if (hasRemoteDuplicate) {
      throw new Error('You already have a book with this title and author.');
    }

    const ratingVal = formData.rating.trim() !== '' ? parseInt(formData.rating, 10) : null;
    await addDoc(collection(db, 'books'), {
      userId: user.uid,
      title: titleTrimmed,
      author: authorTrimmed,
      genre: formData.genre as Genre,
      status: formData.status as Status,
      rating: ratingVal,
      favorite: false,
      notes: formData.notes.trim() || null,
      createdAt: serverTimestamp(),
    });
  }, [user, books]);

  const updateBook = useCallback(async (id: string, formData: Partial<BookFormData>) => {
    const currentBook = books.find((b) => b.id === id);
    const targetTitle = (formData.title !== undefined ? formData.title.trim() : (currentBook?.title || '')).toLowerCase();
    const targetAuthor = (formData.author !== undefined ? formData.author.trim() : (currentBook?.author || '')).toLowerCase();

    const isDuplicate = books.some(
      (b) =>
        b.id !== id &&
        b.title.trim().toLowerCase() === targetTitle &&
        b.author.trim().toLowerCase() === targetAuthor
    );
    if (isDuplicate) {
      throw new Error('Another book with this title and author already exists.');
    }

    const ref = doc(db, 'books', id);
    const updateData: Record<string, any> = {};
    if (formData.title !== undefined) updateData.title = formData.title.trim();
    if (formData.author !== undefined) updateData.author = formData.author.trim();
    if (formData.genre !== undefined) updateData.genre = formData.genre;
    if (formData.status !== undefined) updateData.status = formData.status;
    if (formData.notes !== undefined) updateData.notes = formData.notes.trim() || null;
    if (formData.rating !== undefined) {
      updateData.rating = formData.rating.trim() !== '' ? parseInt(formData.rating, 10) : null;
    }
    await updateDoc(ref, updateData);
  }, [books]);

  const toggleFavorite = useCallback(async (id: string, current: boolean) => {
    const ref = doc(db, 'books', id);
    await updateDoc(ref, { favorite: !current });
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'books', id));
  }, []);

  return (
    <BooksContext.Provider value={{ books, loading, addBook, updateBook, toggleFavorite, deleteBook }}>
      {children}
    </BooksContext.Provider>
  );
}

export const useBooks = () => useContext(BooksContext);

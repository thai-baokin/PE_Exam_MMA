export type Genre = 'Action' | 'Comedy' | 'Drama' | 'Horror';
export type Status = 'Plan to Watch' | 'Watching' | 'Watched';

export interface Movie {
  id: string;
  userId: string;
  title: string;
  director: string;
  genre: Genre;
  status: Status;
  rating?: number | null;
  favorite: boolean;
  notes?: string | null;
  createdAt: any;
}

export interface MovieFormData {
  title: string;
  director: string;
  genre: Genre | '';
  status: Status | '';
  rating: string;
  notes: string;
}

export interface MovieFormErrors {
  title?: string;
  director?: string;
  genre?: string;
  status?: string;
  rating?: string;
  notes?: string;
}

// Backward compatibility aliases if needed
export type Book = Movie;
export type BookFormData = MovieFormData;
export type BookFormErrors = MovieFormErrors;

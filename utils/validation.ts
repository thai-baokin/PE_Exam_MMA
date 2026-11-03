import { MovieFormData, MovieFormErrors } from '@/types';

export interface AuthErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateLoginForm(email: string, password: string): AuthErrors {
  const errors: AuthErrors = {};
  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }
  if (!password) {
    errors.password = 'Password is required';
  }
  return errors;
}

export function validateRegisterForm(
  email: string,
  password: string,
  confirmPassword: string
): AuthErrors {
  const errors: AuthErrors = {};
  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
}

export function validateMovieForm(data: MovieFormData): MovieFormErrors {
  const errors: MovieFormErrors = {};

  if (!data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length > 100) {
    errors.title = 'Title must be at most 100 characters';
  }

  if (!data.director.trim()) {
    errors.director = 'Director is required';
  } else if (data.director.length > 60) {
    errors.director = 'Director must be at most 60 characters';
  }

  if (!data.genre) {
    errors.genre = 'Please choose a genre';
  }

  if (!data.status) {
    errors.status = 'Please choose a status';
  }

  if (data.rating !== undefined && data.rating !== null && data.rating.trim() !== '') {
    const r = Number(data.rating.trim());
    if (!Number.isInteger(r) || r < 0 || r > 5) {
      errors.rating = 'Rating must be a whole number from 0 to 5';
    }
  }

  if (data.notes && data.notes.length > 300) {
    errors.notes = 'Notes must be at most 300 characters';
  }

  return errors;
}

export const validateBookForm = validateMovieForm;

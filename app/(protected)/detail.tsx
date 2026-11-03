import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBooks } from '@/context/BooksContext';
import { validateBookForm } from '@/utils/validation';
import { AppInput } from '@/components/ui/AppInput';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/Colors';
import { BookFormData, BookFormErrors, Genre, Status } from '@/types';

const GENRE_OPTIONS = [
  { label: 'Choose genre', value: '' },
  { label: 'Fiction', value: 'Fiction' },
  { label: 'Non-Fiction', value: 'Non-Fiction' },
  { label: 'Academic', value: 'Academic' },
  { label: 'Other', value: 'Other' },
];

const STATUS_OPTIONS = [
  { label: 'Choose status', value: '' },
  { label: 'To Read', value: 'To Read' },
  { label: 'Reading', value: 'Reading' },
  { label: 'Finished', value: 'Finished' },
];

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { books, updateBook, deleteBook, toggleFavorite } = useBooks();
  const book = books.find((b) => b.id === id);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<BookFormData>({
    title: '',
    author: '',
    genre: '',
    status: '',
    rating: '',
    notes: '',
  });
  const [errors, setErrors] = useState<BookFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        author: book.author,
        genre: book.genre,
        status: book.status,
        rating: book.rating != null ? String(book.rating) : '',
        notes: book.notes || '',
      });
    }
  }, [book]);

  if (!book) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Book not found.</Text>
          <AppButton
            title="← Back to List"
            onPress={() => router.replace('/(protected)/list')}
            variant="outline"
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleFormChange = (field: keyof BookFormData, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    if (submitted) {
      setErrors(validateBookForm(updated));
    }
  };

  const handleSave = async () => {
    setSubmitted(true);
    const e = validateBookForm(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      await updateBook(book.id, form);
      setEditing(false);
      setSubmitted(false);
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(err.message || 'Failed to update book');
      } else {
        Alert.alert('Error', err.message || 'Failed to update book');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      status: book.status,
      rating: book.rating != null ? String(book.rating) : '',
      notes: book.notes || '',
    });
    setErrors({});
    setSubmitted(false);
    setEditing(false);
  };

  const executeDelete = async () => {
    try {
      await deleteBook(book.id);
      router.replace('/(protected)/list');
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(err.message || 'Failed to delete book');
      } else {
        Alert.alert('Error', err.message || 'Failed to delete book');
      }
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Delete Book',
        `Are you sure you want to delete "${book.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: executeDelete,
          },
        ]
      );
    }
  };

  const stars = Array.from({ length: 5 }, (_, i) => (
    <Text
      key={i}
      style={[
        styles.star,
        i < (book.rating ?? 0) ? styles.starFilled : styles.starEmpty,
      ]}
    >
      ★
    </Text>
  ));

  return (
    <SafeAreaView style={styles.safe} testID="detail-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {editing ? 'Edit Book' : 'Book Details'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!editing ? (
          /* ── View Mode ── */
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <Text testID="detail-title" style={styles.bookTitle}>
                {book.title}
              </Text>
              <TouchableOpacity
                onPress={() => toggleFavorite(book.id, book.favorite)}
                style={styles.starBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID="btn-favorite-toggle"
              >
                <Text style={[styles.favStar, book.favorite && styles.favStarActive]}>
                  ★
                </Text>
              </TouchableOpacity>
            </View>
            <Text testID="detail-author" style={styles.bookAuthor}>
              by {book.author}
            </Text>

            <View style={styles.divider} />

            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Genre</Text>
                <Text style={styles.metaValue}>{book.genre}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Status</Text>
                <Text style={styles.metaValue}>{book.status}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Rating</Text>
                <Text style={styles.metaValue}>
                  {book.rating != null ? `${book.rating} / 5` : 'Not rated'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Favorite</Text>
                <Text style={styles.metaValue}>
                  {book.favorite ? '⭐ Yes' : 'No'}
                </Text>
              </View>
            </View>

            {book.rating != null && (
              <View style={styles.ratingBox}>
                <Text style={styles.metaLabel}>Rating Stars</Text>
                <View style={styles.starsRow}>{stars}</View>
              </View>
            )}

            {book.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.metaLabel}>Notes</Text>
                <Text testID="detail-notes" style={styles.notesText}>
                  {book.notes}
                </Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              <AppButton
                title="✏️ Edit"
                onPress={() => setEditing(true)}
                style={{ flex: 1 }}
                testID="btn-edit"
              />
              <AppButton
                title="🗑️ Delete"
                onPress={handleDelete}
                variant="danger"
                style={{ flex: 1 }}
                testID="btn-delete"
              />
            </View>
          </View>
        ) : (
          /* ── Edit Mode ── */
          <View style={styles.card}>
            <Text style={styles.editTitle}>Edit Book</Text>
            <AppInput
              label="Title"
              value={form.title}
              onChangeText={(v) => handleFormChange('title', v)}
              error={submitted ? errors.title : undefined}
              placeholder="Book title"
              testID="input-title"
            />
            <AppInput
              label="Author"
              value={form.author}
              onChangeText={(v) => handleFormChange('author', v)}
              error={submitted ? errors.author : undefined}
              placeholder="Author name"
              testID="input-author"
            />
            <AppPicker
              label="Genre"
              options={GENRE_OPTIONS}
              value={form.genre}
              onChange={(v) => handleFormChange('genre', v)}
              error={submitted ? errors.genre : undefined}
              testID="picker-genre"
            />
            <AppPicker
              label="Status"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={(v) => handleFormChange('status', v)}
              error={submitted ? errors.status : undefined}
              testID="picker-status"
            />
            <AppInput
              label="Rating (0–5, optional)"
              value={form.rating}
              onChangeText={(v) => handleFormChange('rating', v)}
              error={submitted ? errors.rating : undefined}
              keyboardType="numeric"
              placeholder="Leave blank if none"
              testID="input-rating"
            />
            <AppInput
              label="Notes (optional)"
              value={form.notes}
              onChangeText={(v) => handleFormChange('notes', v)}
              error={submitted ? errors.notes : undefined}
              multiline
              numberOfLines={3}
              placeholder="Any notes..."
              testID="input-notes"
              style={{ textAlignVertical: 'top', minHeight: 80 }}
            />

            <View style={styles.actions}>
              <AppButton
                title="Save"
                onPress={handleSave}
                loading={saving}
                style={{ flex: 1 }}
                testID="btn-save"
              />
              <AppButton
                title="Cancel"
                onPress={handleCancelEdit}
                variant="outline"
                style={{ flex: 1 }}
                testID="btn-cancel"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 15, color: Colors.primary, fontWeight: '600' },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  bookAuthor: { fontSize: 15, color: Colors.textMuted, marginBottom: 16 },
  starBtn: { padding: 4 },
  favStar: { fontSize: 28, color: Colors.border },
  favStarActive: { color: Colors.star },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: { minWidth: '45%', flex: 1 },
  metaLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  metaValue: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  ratingBox: { marginBottom: 16 },
  starsRow: { flexDirection: 'row', marginTop: 4 },
  star: { fontSize: 24, marginRight: 2 },
  starFilled: { color: Colors.star },
  starEmpty: { color: Colors.border },
  notesBox: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 14,
    marginBottom: 16,
  },
  notesText: { fontSize: 14, color: Colors.text, lineHeight: 22, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: { fontSize: 16, color: Colors.textMuted, marginBottom: 16 },
});

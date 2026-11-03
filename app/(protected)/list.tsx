import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Switch, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useBooks } from '@/context/BooksContext';
import { useBookFilter } from '@/hooks/useBookFilter';
import { validateBookForm } from '@/utils/validation';
import { AppInput } from '@/components/ui/AppInput';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/Colors';
import { Book, BookFormData } from '@/types';

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

const FILTER_GENRES = [{ label: 'All', value: 'All' }, ...GENRE_OPTIONS.slice(1)];
const FILTER_STATUSES = [{ label: 'All', value: 'All' }, ...STATUS_OPTIONS.slice(1)];

const EMPTY_FORM: BookFormData = {
  title: '', author: '', genre: '', status: '', rating: '', notes: '',
};

export default function ListScreen() {
  const { user, logout } = useAuth();
  const { books, addBook, toggleFavorite } = useBooks();
  const { filter, setFilter, filtered, summary, clearFilter } = useBookFilter(books);

  const [form, setForm] = useState<BookFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof BookFormData, string>>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [bookError, setBookError] = useState('');
  const [adding, setAdding] = useState(false);

  const handleFormChange = (field: keyof BookFormData, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    if (formSubmitted) {
      const e = validateBookForm(updated);
      setErrors(e);
    }
  };

  const handleAddBook = async () => {
    setFormSubmitted(true);
    setBookSuccess(false);
    setBookError('');
    const e = validateBookForm(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setAdding(true);
    try {
      await addBook(form);
      setForm(EMPTY_FORM);
      setErrors({});
      setFormSubmitted(false);
      setBookSuccess(true);
      setTimeout(() => setBookSuccess(false), 3000);
    } catch (err: any) {
      setBookError(err.message || 'Failed to add book');
    } finally {
      setAdding(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(public)/home');
  };

  const renderBookItem = (item: Book) => (
    <TouchableOpacity
      key={item.id}
      testID="book-item"
      style={styles.bookCard}
      onPress={() => router.push({ pathname: '/(protected)/detail', params: { id: item.id } })}
      activeOpacity={0.8}
    >
      <View style={styles.bookMain}>
        <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
        <View style={styles.bookMeta}>
          <View style={[styles.badge, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[styles.badgeText, { color: Colors.primary }]}>{item.genre}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[styles.badgeText, { color: Colors.secondary }]}>{item.status}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => toggleFavorite(item.id, item.favorite)} style={styles.starBtn}>
        <Text style={[styles.star, item.favorite && styles.starActive]}>★</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} testID="list-screen">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
        <AppButton
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutBtn}
          testID="btn-logout"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Add Book Form */}
        <View testID="book-form" style={styles.section}>
          <Text style={styles.sectionTitle}>Add a Book</Text>

          {bookSuccess && (
            <View testID="book-success" style={styles.successBox}>
              <Text style={styles.successText}>Book added</Text>
            </View>
          )}
          {bookError ? (
            <View testID="error-book" style={styles.errorBox}>
              <Text style={styles.errorText}>{bookError}</Text>
            </View>
          ) : null}

          <AppInput
            label="Title"
            value={form.title}
            onChangeText={(v) => handleFormChange('title', v)}
            error={formSubmitted ? errors.title : undefined}
            placeholder="Book title"
            testID="input-title"
          />
          <AppInput
            label="Author"
            value={form.author}
            onChangeText={(v) => handleFormChange('author', v)}
            error={formSubmitted ? errors.author : undefined}
            placeholder="Author name"
            testID="input-author"
          />
          <AppPicker
            label="Genre"
            options={GENRE_OPTIONS}
            value={form.genre}
            onChange={(v) => handleFormChange('genre', v)}
            error={formSubmitted ? errors.genre : undefined}
            placeholder="Choose genre"
            testID="picker-genre"
          />
          <AppPicker
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(v) => handleFormChange('status', v)}
            error={formSubmitted ? errors.status : undefined}
            placeholder="Choose status"
            testID="picker-status"
          />
          <AppInput
            label="Rating (0–5, optional)"
            value={form.rating}
            onChangeText={(v) => handleFormChange('rating', v)}
            error={formSubmitted ? errors.rating : undefined}
            keyboardType="numeric"
            placeholder="Leave blank if none"
            testID="input-rating"
          />
          <AppInput
            label="Notes (optional)"
            value={form.notes}
            onChangeText={(v) => handleFormChange('notes', v)}
            error={formSubmitted ? errors.notes : undefined}
            multiline
            numberOfLines={3}
            placeholder="Any notes about this book..."
            testID="input-notes"
          />

          <AppButton title="Add Book" onPress={handleAddBook} loading={adding} testID="btn-add-book" />
        </View>

        {/* Filters */}
        <View style={styles.section}>
          <View style={styles.filterHeader}>
            <Text style={styles.sectionTitle}>Filters</Text>
            <AppButton
              title="Clear"
              onPress={clearFilter}
              variant="outline"
              style={styles.clearBtn}
              testID="btn-clear-filter"
            />
          </View>

          <TextInput
            testID="input-search"
            style={styles.searchInput}
            placeholder="Search by title or author..."
            placeholderTextColor={Colors.placeholder}
            value={filter.search}
            onChangeText={(v) => setFilter({ ...filter, search: v })}
          />

          <AppPicker
            label="Genre"
            options={FILTER_GENRES}
            value={filter.genre}
            onChange={(v) => setFilter({ ...filter, genre: v as any })}
            testID="filter-genre"
          />
          <AppPicker
            label="Status"
            options={FILTER_STATUSES}
            value={filter.status}
            onChange={(v) => setFilter({ ...filter, status: v as any })}
            testID="filter-status"
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Favorites only</Text>
            <Switch
              testID="switch-favorites"
              value={filter.favoritesOnly}
              onValueChange={(v) => setFilter({ ...filter, favoritesOnly: v })}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Books shown:</Text>
            <Text testID="book-count" style={styles.summaryValue}>{summary.total}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Favorites:</Text>
            <Text testID="favorite-count" style={styles.summaryValue}>{summary.favorites}</Text>
          </View>
          {summary.breakdown.map(([status, count]) => (
            <View key={status} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{status}:</Text>
              <Text style={styles.summaryValue}>{count}</Text>
            </View>
          ))}
        </View>

        {/* Book List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Books ({summary.total})</Text>
          {filtered.length === 0 ? (
            <View testID="books-empty" style={styles.emptyBox}>
              <Text style={styles.emptyText}>No books found</Text>
            </View>
          ) : (
            filtered.map((book) => renderBookItem(book))
          )}
        </View>
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
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userEmail: { flex: 1, fontSize: 13, color: Colors.textMuted, marginRight: 8 },
  logoutBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  successBox: { backgroundColor: '#DCFCE7', borderRadius: 8, padding: 12, marginBottom: 12 },
  successText: { color: '#16A34A', fontWeight: '600', textAlign: 'center' },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: Colors.danger, fontWeight: '500' },
  filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  clearBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: '#fff',
    marginBottom: 14,
    minHeight: 44,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  switchLabel: { fontSize: 14, fontWeight: '500', color: Colors.text },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontSize: 14, color: Colors.textMuted },
  summaryValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  emptyBox: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookMain: { flex: 1, marginRight: 8 },
  bookTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  bookAuthor: { fontSize: 13, color: Colors.textMuted, marginBottom: 6 },
  bookMeta: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  starBtn: { padding: 6 },
  star: { fontSize: 24, color: Colors.border },
  starActive: { color: Colors.star },
});

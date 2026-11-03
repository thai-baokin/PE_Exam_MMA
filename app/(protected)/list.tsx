import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Switch, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useMovies } from '@/context/MoviesContext';
import { useMovieFilter } from '@/hooks/useMovieFilter';
import { validateMovieForm } from '@/utils/validation';
import { AppInput } from '@/components/ui/AppInput';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Shadows3D } from '@/constants/Colors';
import { Movie, MovieFormData, Genre, Status } from '@/types';

const GENRE_OPTIONS = [
  { label: 'Choose genre', value: '' },
  { label: 'Action', value: 'Action' },
  { label: 'Comedy', value: 'Comedy' },
  { label: 'Drama', value: 'Drama' },
  { label: 'Horror', value: 'Horror' },
];

const STATUS_OPTIONS = [
  { label: 'Choose status', value: '' },
  { label: 'Plan to Watch', value: 'Plan to Watch' },
  { label: 'Watching', value: 'Watching' },
  { label: 'Watched', value: 'Watched' },
];

const FILTER_GENRES = [{ label: 'All', value: 'All' }, ...GENRE_OPTIONS.slice(1)];
const FILTER_STATUSES = [{ label: 'All', value: 'All' }, ...STATUS_OPTIONS.slice(1)];

const EMPTY_FORM: MovieFormData = {
  title: '', director: '', genre: '', status: '', rating: '', notes: '',
};

export default function ListScreen() {
  const { user, logout } = useAuth();
  const { movies, addMovie, toggleFavorite } = useMovies();
  const { filter, setFilter, filtered, summary, clearFilter } = useMovieFilter(movies);

  const [form, setForm] = useState<MovieFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof MovieFormData, string>>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [movieSuccess, setMovieSuccess] = useState(false);
  const [movieError, setMovieError] = useState('');
  const [adding, setAdding] = useState(false);

  const handleFormChange = (field: keyof MovieFormData, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    if (formSubmitted) {
      const e = validateMovieForm(updated);
      setErrors(e);
    }
  };

  const handleAddMovie = async () => {
    setFormSubmitted(true);
    setMovieSuccess(false);
    setMovieError('');
    const e = validateMovieForm(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setAdding(true);
    try {
      await addMovie(form);
      setForm(EMPTY_FORM);
      setErrors({});
      setFormSubmitted(false);
      setMovieSuccess(true);
      setTimeout(() => setMovieSuccess(false), 3000);
    } catch (err: any) {
      setMovieError(err.message || 'Failed to add movie');
    } finally {
      setAdding(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(public)/home');
  };

  const getStatusColor = (st: Status) => {
    switch (st) {
      case 'Plan to Watch': return { bg: '#FEF3C7', text: '#D97706' };
      case 'Watching': return { bg: '#DBEAFE', text: '#2563EB' };
      case 'Watched': return { bg: '#D1FAE5', text: '#059669' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const renderMovieItem = (item: Movie) => {
    const stCol = getStatusColor(item.status);
    return (
      <TouchableOpacity
        key={item.id}
        testID="movie-item"
        style={[styles.movieCard, Shadows3D.inner]}
        onPress={() => router.push({ pathname: '/(protected)/detail', params: { id: item.id } })}
        activeOpacity={0.85}
      >
        <View style={styles.movieMain}>
          <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.movieDirector} numberOfLines={1}>🎬 {item.director}</Text>
          <View style={styles.movieMeta}>
            <View style={[styles.badge, { backgroundColor: Colors.primaryLight }]}>
              <Text style={[styles.badgeText, { color: Colors.primary }]}>{item.genre}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: stCol.bg }]}>
              <Text style={[styles.badgeText, { color: stCol.text }]}>{item.status}</Text>
            </View>
            {item.rating !== null && item.rating !== undefined && (
              <View style={[styles.badge, { backgroundColor: '#FFFBEB' }]}>
                <Text style={[styles.badgeText, { color: '#B45309' }]}>★ {item.rating}/5</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id, item.favorite)}
          style={styles.starBtn}
          activeOpacity={0.7}
        >
          <Text style={[styles.star, item.favorite && styles.starActive]}>
            {item.favorite ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} testID="list-screen">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>🎬 CineList</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
        </View>
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
        {/* Add Movie Form */}
        <View testID="movie-form" style={[styles.section, Shadows3D.card]}>
          <View style={styles.sectionHeaderLine}>
            <View style={styles.indicatorBar} />
            <Text style={styles.sectionTitle}>Add a Movie</Text>
          </View>

          {movieSuccess && (
            <View testID="movie-success" style={styles.successBox}>
              <Text style={styles.successText}>Movie added</Text>
            </View>
          )}
          {movieError ? (
            <View testID="error-movie" style={styles.errorBox}>
              <Text style={styles.errorText}>{movieError}</Text>
            </View>
          ) : null}

          <AppInput
            label="Title"
            value={form.title}
            onChangeText={(v) => handleFormChange('title', v)}
            error={formSubmitted ? errors.title : undefined}
            placeholder="Movie title"
            testID="input-title"
          />
          <AppInput
            label="Director"
            value={form.director}
            onChangeText={(v) => handleFormChange('director', v)}
            error={formSubmitted ? errors.director : undefined}
            placeholder="Director name"
            testID="input-director"
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
            placeholder="Any notes about this movie..."
            testID="input-notes"
          />

          <AppButton
            title="Add Movie"
            onPress={handleAddMovie}
            loading={adding}
            testID="btn-add-movie"
          />
        </View>

        {/* Filters */}
        <View style={[styles.section, Shadows3D.card]}>
          <View style={styles.filterHeader}>
            <View style={styles.sectionHeaderLine}>
              <View style={[styles.indicatorBar, { backgroundColor: Colors.accent }]} />
              <Text style={styles.sectionTitle}>Filters & Search</Text>
            </View>
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
            placeholder="Search by title or director..."
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>⭐</Text>
              <Text style={styles.switchLabel}>Favorites only</Text>
            </View>
            <Switch
              testID="switch-favorites"
              value={filter.favoritesOnly}
              onValueChange={(v) => setFilter({ ...filter, favoritesOnly: v })}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.section, Shadows3D.card]}>
          <View style={styles.sectionHeaderLine}>
            <View style={[styles.indicatorBar, { backgroundColor: '#10B981' }]} />
            <Text style={styles.sectionTitle}>Summary</Text>
          </View>
          <View style={styles.summaryStatsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNum} testID="movie-count">{summary.total}</Text>
              <Text style={styles.statLabel}>Movies shown</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: Colors.star }]} testID="favorite-count">{summary.favorites}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>

          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>Status Breakdown</Text>
            {summary.breakdown.length === 0 ? (
              <Text style={styles.breakdownEmpty}>No items to categorize</Text>
            ) : (
              summary.breakdown.map(([status, count]) => {
                const stCol = getStatusColor(status as Status);
                return (
                  <View key={status} style={styles.breakdownRow}>
                    <View style={styles.breakdownLeft}>
                      <View style={[styles.statusDot, { backgroundColor: stCol.text }]} />
                      <Text style={styles.breakdownLabel}>{status}</Text>
                    </View>
                    <View style={[styles.countPill, { backgroundColor: stCol.bg }]}>
                      <Text style={[styles.countPillText, { color: stCol.text }]}>{count}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Movie List */}
        <View style={[styles.section, Shadows3D.card]}>
          <View style={styles.sectionHeaderLine}>
            <View style={[styles.indicatorBar, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.sectionTitle}>My Movies ({summary.total})</Text>
          </View>
          {filtered.length === 0 ? (
            <View testID="movies-empty" style={styles.emptyBox}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>🎞️</Text>
              <Text style={styles.emptyText}>No movies found</Text>
            </View>
          ) : (
            filtered.map((movie) => renderMovieItem(movie))
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flex: 1, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  userEmail: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  logoutBtn: { paddingVertical: 8, paddingHorizontal: 14, minHeight: 38, borderRadius: 10 },
  content: { padding: 16, paddingBottom: 48 },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  indicatorBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  successBox: { backgroundColor: '#DCFCE7', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#86EFAC' },
  successText: { color: '#16A34A', fontWeight: '700', textAlign: 'center' },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#FCA5A5' },
  errorText: { color: Colors.danger, fontWeight: '600' },
  filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  clearBtn: { paddingVertical: 6, paddingHorizontal: 14, minHeight: 34, borderRadius: 8 },
  searchInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
    minHeight: 46,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 4,
  },
  switchLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  summaryStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNum: { fontSize: 24, fontWeight: '900', color: Colors.text, marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  breakdownContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  countPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  countPillText: { fontSize: 12, fontWeight: '700' },
  breakdownEmpty: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic', paddingVertical: 4 },
  emptyBox: { paddingVertical: 36, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 16, fontWeight: '600' },
  movieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  movieMain: { flex: 1, marginRight: 10 },
  movieTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 3 },
  movieDirector: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8, fontWeight: '500' },
  movieMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  starBtn: { padding: 8, borderRadius: 20 },
  star: { fontSize: 26, color: '#CBD5E1' },
  starActive: { color: Colors.star },
});

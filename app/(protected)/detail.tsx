import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMovies } from '@/context/MoviesContext';
import { validateMovieForm } from '@/utils/validation';
import { AppInput } from '@/components/ui/AppInput';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Shadows3D } from '@/constants/Colors';
import { MovieFormData, MovieFormErrors, Genre, Status } from '@/types';

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

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { movies, updateMovie, deleteMovie, toggleFavorite } = useMovies();
  const movie = movies.find((m) => m.id === id);

  const [editing, setEditing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [form, setForm] = useState<MovieFormData>({
    title: '',
    director: '',
    genre: '',
    status: '',
    rating: '',
    notes: '',
  });
  const [errors, setErrors] = useState<MovieFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (movie) {
      setForm({
        title: movie.title,
        director: movie.director,
        genre: movie.genre,
        status: movie.status,
        rating: movie.rating != null ? String(movie.rating) : '',
        notes: movie.notes || '',
      });
    }
  }, [movie]);

  if (!movie) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🎞️</Text>
          <Text style={styles.notFoundText}>Movie not found.</Text>
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

  const handleFormChange = (field: keyof MovieFormData, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    if (submitted) {
      setErrors(validateMovieForm(updated));
    }
  };

  const handleSave = async () => {
    setSubmitted(true);
    setDetailError('');
    const e = validateMovieForm(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      await updateMovie(movie.id, form);
      setEditing(false);
      setSubmitted(false);
    } catch (err: any) {
      setDetailError(err.message || 'Failed to update movie');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      title: movie.title,
      director: movie.director,
      genre: movie.genre,
      status: movie.status,
      rating: movie.rating != null ? String(movie.rating) : '',
      notes: movie.notes || '',
    });
    setErrors({});
    setSubmitted(false);
    setDetailError('');
    setEditing(false);
  };

  const executeDelete = async () => {
    setDeleting(true);
    try {
      await deleteMovie(movie.id);
      setDeleteModalVisible(false);
      router.replace('/(protected)/list');
    } catch (err: any) {
      setDetailError(err.message || 'Failed to delete movie');
      setDeleteModalVisible(false);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (st: Status) => {
    switch (st) {
      case 'Plan to Watch': return { bg: '#FEF3C7', text: '#D97706' };
      case 'Watching': return { bg: '#DBEAFE', text: '#2563EB' };
      case 'Watched': return { bg: '#D1FAE5', text: '#059669' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const stCol = getStatusColor(movie.status);

  return (
    <SafeAreaView style={styles.safe} testID="detail-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {editing ? 'Edit Movie' : 'Movie Details'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {detailError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{detailError}</Text>
          </View>
        ) : null}

        {!editing ? (
          /* ── View Mode ── */
          <View style={[styles.card, Shadows3D.card]}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text testID="detail-title" style={styles.movieTitle}>
                  {movie.title}
                </Text>
                <Text style={styles.movieDirector}>🎬 Directed by {movie.director}</Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleFavorite(movie.id, movie.favorite)}
                style={styles.starBtn}
                activeOpacity={0.7}
              >
                <Text style={[styles.star, movie.favorite && styles.starActive]}>
                  {movie.favorite ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: Colors.primaryLight }]}>
                <Text style={[styles.badgeText, { color: Colors.primary }]}>
                  {movie.genre}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: stCol.bg }]}>
                <Text style={[styles.badgeText, { color: stCol.text }]}>
                  {movie.status}
                </Text>
              </View>
            </View>

            {/* Info Grid */}
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Rating</Text>
                <Text style={styles.infoValue}>
                  {movie.rating != null ? `★ ${movie.rating} / 5` : 'Not rated'}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Favorite</Text>
                <Text style={[styles.infoValue, { color: movie.favorite ? Colors.star : Colors.textMuted }]}>
                  {movie.favorite ? '★ In Favorites' : 'No'}
                </Text>
              </View>

              <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={[styles.infoValue, !movie.notes && styles.italic]}>
                  {movie.notes || 'No notes added'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <AppButton
                title="✏️ Edit Movie"
                onPress={() => setEditing(true)}
                variant="primary"
                testID="btn-edit"
              />
              <AppButton
                title="🗑️ Delete Movie"
                onPress={() => setDeleteModalVisible(true)}
                variant="danger"
                style={{ marginTop: 10 }}
                testID="btn-delete"
              />
            </View>
          </View>
        ) : (
          /* ── Edit Mode ── */
          <View style={[styles.card, Shadows3D.card]}>
            <View style={styles.sectionHeaderLine}>
              <View style={styles.indicatorBar} />
              <Text style={styles.editCardTitle}>Edit Movie Details</Text>
            </View>

            <AppInput
              label="Title"
              value={form.title}
              onChangeText={(v) => handleFormChange('title', v)}
              error={submitted ? errors.title : undefined}
              placeholder="Movie title"
              testID="input-title"
            />
            <AppInput
              label="Director"
              value={form.director}
              onChangeText={(v) => handleFormChange('director', v)}
              error={submitted ? errors.director : undefined}
              placeholder="Director name"
              testID="input-director"
            />
            <AppPicker
              label="Genre"
              options={GENRE_OPTIONS}
              value={form.genre}
              onChange={(v) => handleFormChange('genre', v)}
              error={submitted ? errors.genre : undefined}
              placeholder="Choose genre"
              testID="picker-genre"
            />
            <AppPicker
              label="Status"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={(v) => handleFormChange('status', v)}
              error={submitted ? errors.status : undefined}
              placeholder="Choose status"
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
              placeholder="Any notes about this movie..."
              testID="input-notes"
            />

            <View style={styles.editActions}>
              <AppButton
                title="💾 Save Changes"
                onPress={handleSave}
                loading={saving}
                testID="btn-save"
              />
              <AppButton
                title="Cancel"
                onPress={handleCancelEdit}
                variant="outline"
                style={{ marginTop: 10 }}
                testID="btn-cancel"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── In-App 3D Confirmation Modal for Screenshot 15 ── */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogCard, Shadows3D.card]}>
            <View style={styles.deleteIconBadge}>
              <Text style={{ fontSize: 28 }}>🗑️</Text>
            </View>
            <Text style={styles.dialogTitle}>Delete Movie?</Text>
            <Text style={styles.dialogMessage}>
              Are you sure you want to delete "{movie.title}"? This film will be permanently removed from your watchlist.
            </Text>
            <View style={styles.dialogActions}>
              <AppButton
                title="Cancel"
                onPress={() => setDeleteModalVisible(false)}
                variant="outline"
                style={styles.dialogBtn}
              />
              <AppButton
                title="Delete"
                onPress={executeDelete}
                loading={deleting}
                variant="danger"
                style={styles.dialogBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  backBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  content: { padding: 18, paddingBottom: 48 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#FCA5A5' },
  errorText: { color: Colors.danger, fontWeight: '600', textAlign: 'center' },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  movieTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, marginBottom: 4, letterSpacing: -0.5 },
  movieDirector: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  starBtn: { padding: 6 },
  star: { fontSize: 32, color: '#CBD5E1' },
  starActive: { color: Colors.star },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  infoSection: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: { fontSize: 11, fontWeight: '800', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  infoValue: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  italic: { fontStyle: 'italic', color: Colors.textMuted, fontWeight: 'normal' },
  actions: { gap: 4 },
  sectionHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
  },
  indicatorBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  editCardTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  editActions: { marginTop: 12 },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  notFoundText: { fontSize: 18, color: Colors.textMuted, fontWeight: '600' },

  /* In-app Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  deleteIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  dialogBtn: {
    flex: 1,
  },
});

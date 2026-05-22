import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { bookService } from '../../services/bookService';
import api from '../../services/api';

export default function AdminManageBooksScreen({ navigation }) {
  const { colors } = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Add/Edit modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fetchingCovers, setFetchingCovers] = useState(false);
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    isbn: '',
    genre: '',
    coverUrl: '',
    available: true,
  });

  useEffect(() => {
    loadBooks(1, true);
  }, []);

  const loadBooks = async (pageNum = 1, reset = false) => {
    try {
      const response = await bookService.getAllBooks(pageNum, 20);
      const newBooks = response?.data?.books ?? [];
      const pagination = response?.data?.pagination ?? {};
      setBooks(reset ? newBooks : (prev) => [...prev, ...newBooks]);
      setPage(pageNum);
      setTotalPages(pagination.pages ?? 1);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    setLoading(true);
    setPage(1);
    try {
      if (!query) {
        await loadBooks(1, true);
        return;
      }
      const response = await bookService.searchBooks(query, 1, 20);
      const results = response?.data?.books ?? [];
      const pagination = response?.data?.pagination ?? {};
      setBooks(results);
      setTotalPages(pagination.pages ?? 1);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    setSearchQuery('');
    await loadBooks(1, true);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    await loadBooks(page + 1, false);
  };

  const openAddModal = () => {
    setEditingBook(null);
    setForm({ title: '', author: '', description: '', isbn: '', genre: '', coverUrl: '', available: true });
    setModalVisible(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title ?? '',
      author: book.author ?? '',
      description: book.description ?? '',
      isbn: book.isbn ?? '',
      genre: book.genre ?? '',
      coverUrl: book.coverUrl ?? '',
      available: book.available ?? true,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.author.trim()) {
      Alert.alert('Validation', 'Title and Author are required.');
      return;
    }
    setSaving(true);
    try {
      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, form);
        Alert.alert('Success', 'Book updated successfully.');
      } else {
        await api.post('/books', form);
        Alert.alert('Success', 'Book added successfully.');
      }
      setModalVisible(false);
      await loadBooks(1, true);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save book.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (book) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/books/${book.id}`);
              setBooks((prev) => prev.filter((b) => b.id !== book.id));
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete book.');
            }
          },
        },
      ]
    );
  };

  const handleFetchAllCovers = () => {
    Alert.alert(
      'Fetch Book Covers',
      'This will fetch cover images from Google Books for all books without covers. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Fetch',
          onPress: async () => {
            setFetchingCovers(true);
            try {
              const response = await api.post('/books/fetch-all-covers');
              Alert.alert('Success', response.data?.data?.message || 'Covers updated successfully.');
              await loadBooks(1, true);
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to fetch covers.');
            } finally {
              setFetchingCovers(false);
            }
          },
        },
      ]
    );
  };

  const renderBookItem = (book) => {
    // Generate a placeholder cover if coverUrl is missing
    const coverUrl = book.coverUrl || `https://via.placeholder.com/140x200/800000/FFFFFF?text=${encodeURIComponent(book.title.substring(0, 20))}`;
    
    return (
    <View key={book.id} style={[styles.bookItem, { backgroundColor: colors.card }]}>
      {/* Cover */}
      <View style={[styles.coverContainer, { backgroundColor: colors.surface }]}>
        <Image
          source={{ uri: coverUrl }}
          style={styles.coverImage}
          resizeMode="cover"
          onError={() => console.log('Failed to load cover for book:', book.id)}
        />
      </View>

      {/* Info */}
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.bookMeta}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Total: 1{'  '}
          </Text>
          <Text style={[styles.metaAvail, { color: book.available ? colors.success : colors.error }]}>
            Avail: {book.available ? '1' : '0'}
          </Text>
        </View>
        {book.genre ? (
          <Text style={[styles.genreTag, { color: colors.primary }]}>{book.genre}</Text>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => openEditModal(book)}
        >
          <Ionicons name="pencil" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(book)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name="school" size={24} color="#FFFFFF" />
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Books</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search books..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); loadBooks(1, true); }}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.utilityButton, { backgroundColor: colors.primary }]}
          onPress={handleFetchAllCovers}
          disabled={fetchingCovers}
        >
          {fetchingCovers ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="cloud-download-outline" size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Book List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 80) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : books.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No books found</Text>
            <TouchableOpacity
              style={[styles.addFirstButton, { backgroundColor: colors.primary }]}
              onPress={openAddModal}
            >
              <Text style={styles.addFirstButtonText}>Add First Book</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {books.map(renderBookItem)}
            {loadingMore && (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
            )}
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingBook ? 'Edit Book' : 'Add Book'}
              </Text>
              <TouchableOpacity onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Cover URL preview */}
              {form.coverUrl ? (
                <View style={styles.coverPreviewContainer}>
                  <Image
                    source={{ uri: form.coverUrl }}
                    style={styles.coverPreview}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View style={[styles.coverPreviewContainer, { backgroundColor: colors.surface }]}>
                  <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
                  <Text style={[styles.coverPreviewHint, { color: colors.textSecondary }]}>
                    Enter a cover URL below to preview
                  </Text>
                </View>
              )}

              <FormField label="Cover Image URL" colors={colors}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={form.coverUrl}
                  onChangeText={(v) => setForm((f) => ({ ...f, coverUrl: v }))}
                  placeholder="https://example.com/cover.jpg"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </FormField>

              <FormField label="Title *" colors={colors}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={form.title}
                  onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
                  placeholder="Book title"
                  placeholderTextColor={colors.textSecondary}
                />
              </FormField>

              <FormField label="Author *" colors={colors}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={form.author}
                  onChangeText={(v) => setForm((f) => ({ ...f, author: v }))}
                  placeholder="Author name"
                  placeholderTextColor={colors.textSecondary}
                />
              </FormField>

              <FormField label="Genre" colors={colors}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={form.genre}
                  onChangeText={(v) => setForm((f) => ({ ...f, genre: v }))}
                  placeholder="e.g. Fiction, Educational"
                  placeholderTextColor={colors.textSecondary}
                />
              </FormField>

              <FormField label="ISBN" colors={colors}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={form.isbn}
                  onChangeText={(v) => setForm((f) => ({ ...f, isbn: v }))}
                  placeholder="ISBN number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </FormField>

              <FormField label="Description" colors={colors}>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
                  value={form.description}
                  onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                  placeholder="Book description..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </FormField>

              {/* Available toggle */}
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>Available for borrowing</Text>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    { backgroundColor: form.available ? colors.success : colors.surface },
                  ]}
                  onPress={() => setForm((f) => ({ ...f, available: !f.available }))}
                >
                  <Text style={[styles.toggleText, { color: form.available ? '#FFF' : colors.textSecondary }]}>
                    {form.available ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function FormField({ label, colors, children }) {
  return (
    <View style={styles.formField}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 8,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  utilityButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  coverContainer: {
    width: 72,
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 14,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 13,
    marginBottom: 6,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
  },
  metaAvail: {
    fontSize: 12,
    fontWeight: '700',
  },
  genreTag: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  actions: {
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
  },
  actionBtn: {
    padding: 6,
  },
  loader: { marginVertical: 40 },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addFirstButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 8,
  },
  addFirstButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  coverPreviewContainer: {
    height: 180,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    gap: 8,
  },
  coverPreview: {
    width: '100%',
    height: '100%',
  },
  coverPreviewHint: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    height: 100,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggle: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

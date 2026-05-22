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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { bookService } from '../../services/bookService';
import BookDetailsModal from '../../components/BookDetailsModal';

const getCoverUrl = (book) => {
  if (book?.coverUrl) return book.coverUrl;
  const isbn = String(book?.isbn || '').replace(/[^0-9Xx]/g, '');
  return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null;
};

export default function BrowseScreen({ navigation }) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadBooks(1, true);
  }, []);

  const loadBooks = async (pageNum = 1, reset = false) => {
    try {
      // Backend returns { data: { books: [...], pagination: { page, limit, total, pages } } }
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
      // searchBooks uses GET /books?search=query
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name="school" size={24} color="#FFFFFF" />
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Browse</Text>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Menu')}
        >
          <Ionicons name="person" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search books, author..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                loadBooks(1, true);
              }}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Books Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isNearBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;
          if (isNearBottom) loadMore();
        }}
        scrollEventThrottle={400}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : books.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No books found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery ? `No results for "${searchQuery}"` : 'The library is empty'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.booksGrid}>
              {books.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.bookCard}
                  onPress={() => setSelectedBook(book)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.bookCover, { backgroundColor: colors.surface }]}>
                    {getCoverUrl(book) ? (
                      <Image source={{ uri: getCoverUrl(book) }} style={styles.bookImage} />
                    ) : (
                      <Ionicons name="book" size={48} color={colors.textSecondary} />
                    )}
                    {/* Available / Unavailable badge */}
                    {!book.available && (
                      <View style={styles.unavailableBadge}>
                        <Text style={styles.unavailableText}>Unavailable</Text>
                      </View>
                    )}
                    {book.available && (
                      <View style={styles.availableBadge}>
                        <Text style={styles.availableText}>Available</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
                    {book.title}
                  </Text>
                  <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                    {book.author}
                  </Text>
                  {book.genre ? (
                    <Text style={[styles.bookGenre, { color: colors.primary }]} numberOfLines={1}>
                      {book.genre}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
            {loadingMore && (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loadMoreIndicator} />
            )}
          </>
        )}
      </ScrollView>
      <BookDetailsModal
        visible={Boolean(selectedBook)}
        book={selectedBook}
        colors={colors}
        onClose={() => setSelectedBook(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
  },
  searchButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  bookCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 20,
  },
  bookCover: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  bookImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E53935',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  unavailableText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  availableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#43A047',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  availableText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 11,
    marginBottom: 2,
  },
  bookGenre: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loader: {
    marginVertical: 40,
  },
  loadMoreIndicator: {
    marginVertical: 16,
  },
});

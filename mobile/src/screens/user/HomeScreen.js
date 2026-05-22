import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { bookService } from '../../services/bookService';
import BookDetailsModal from '../../components/BookDetailsModal';

const CATEGORIES = ['All', 'Fiction', 'Educational', 'Sci-Fi', 'Mystery', 'Romance'];
const getCoverUrl = (book) => {
  if (book?.coverUrl) return book.coverUrl;
  const isbn = String(book?.isbn || '').replace(/[^0-9Xx]/g, '');
  return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null;
};

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeaturedBooks();
  }, []);

  const loadFeaturedBooks = async () => {
    try {
      // /books/featured returns the array directly inside response.data.data
      const response = await bookService.getFeaturedBooks();
      const books = response?.data ?? [];
      setFeaturedBooks(Array.isArray(books) ? books : []);
    } catch (error) {
      console.error('Error loading featured books:', error);
      setFeaturedBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeaturedBooks();
    setRefreshing(false);
  };

  // Filter featured books by selected category (genre field)
  const filteredBooks =
    selectedCategory === 'All'
      ? featuredBooks
      : featuredBooks.filter(
          (b) => b.genre?.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="school" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>HOME</Text>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Menu')}
          >
            <Ionicons name="person" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Browse')}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
            Search books, author...
          </Text>
        </TouchableOpacity>

        {/* Banner Placeholders */}
        <View style={styles.bannerContainer}>
          <View style={[styles.banner, { backgroundColor: colors.surface }]}>
            <Ionicons name="library-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.bannerText, { color: colors.textSecondary }]}>Explore Library</Text>
          </View>
          <View style={[styles.banner, { backgroundColor: colors.surface }]}>
            <Ionicons name="bookmark-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.bannerText, { color: colors.textSecondary }]}>My Reading List</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.surface },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === category ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Books */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : filteredBooks.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
              <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {selectedCategory === 'All'
                  ? 'No featured books available'
                  : `No ${selectedCategory} books found`}
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredBooks.map((book) => (
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
                    {/* Availability badge */}
                    {!book.available && (
                      <View style={styles.unavailableBadge}>
                        <Text style={styles.unavailableBadgeText}>Unavailable</Text>
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
            </ScrollView>
          )}
        </View>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 15,
  },
  bannerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  banner: {
    flex: 1,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  categories: {
    paddingLeft: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    marginHorizontal: 20,
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bookCard: {
    width: 140,
    marginRight: 16,
    marginLeft: 20,
  },
  bookCover: {
    width: 140,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
  unavailableBadgeText: {
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
  loader: {
    marginVertical: 40,
  },
});

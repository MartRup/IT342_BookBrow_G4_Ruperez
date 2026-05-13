import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { bookService } from '../../services/bookService';
import { borrowService } from '../../services/borrowService';

export default function BookDetailScreen({ route, navigation }) {
  const { bookId } = route.params;
  const { colors } = useTheme();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    loadBookDetails();
  }, [bookId]);

  const loadBookDetails = async () => {
    try {
      const response = await bookService.getBookById(bookId);
      setBook(response.data);
    } catch (error) {
      console.error('Error loading book details:', error);
      Alert.alert('Error', 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (book.availableCopies === 0) {
      Alert.alert('Unavailable', 'This book is currently unavailable');
      return;
    }

    Alert.alert(
      'Borrow Book',
      `Do you want to borrow "${book.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Borrow',
          onPress: async () => {
            setBorrowing(true);
            try {
              await borrowService.borrowBook(book.id);
              Alert.alert(
                'Success',
                'Borrow request submitted! Wait for librarian approval.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to borrow book'
              );
            } finally {
              setBorrowing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Book not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Book Details</Text>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Book Cover */}
        <View style={styles.coverContainer}>
          <View style={[styles.cover, { backgroundColor: colors.surface }]}>
            {book.coverImage ? (
              <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
            ) : (
              <Ionicons name="book" size={80} color={colors.textSecondary} />
            )}
          </View>
        </View>

        {/* Book Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
          <Text style={[styles.author, { color: colors.textSecondary }]}>{book.author}</Text>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={20} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.text }]}>
                {book.availableCopies} / {book.totalCopies}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Available</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.text }]}>
                {new Date(book.publicationYear).getFullYear()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Published</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.text }]}>{book.genre || 'N/A'}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Genre</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {book.description || 'No description available for this book.'}
            </Text>
          </View>

          {/* Additional Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>ISBN:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {book.isbn || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Publisher:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {book.publisher || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Language:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {book.language || 'English'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Borrow Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.borrowButton,
            {
              backgroundColor: book.availableCopies > 0 ? colors.primary : colors.textSecondary,
            },
          ]}
          onPress={handleBorrow}
          disabled={borrowing || book.availableCopies === 0}
        >
          {borrowing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              <Text style={styles.borrowButtonText}>
                {book.availableCopies > 0 ? 'Borrow Book' : 'Unavailable'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  coverContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  cover: {
    width: 200,
    height: 280,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    marginBottom: 24,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  borrowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  borrowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loader: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

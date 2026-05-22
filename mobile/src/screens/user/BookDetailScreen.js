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

const getCoverUrl = (book) => {
  if (book?.coverUrl) return book.coverUrl;
  const isbn = String(book?.isbn || '').replace(/[^0-9Xx]/g, '');
  return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null;
};

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
      // Backend returns { data: { book: {...} } }
      const response = await bookService.getBookById(bookId);
      setBook(response?.data?.book ?? null);
    } catch (error) {
      console.error('Error loading book details:', error);
      Alert.alert('Error', 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!book.available) {
      Alert.alert('Unavailable', 'This book is currently unavailable for borrowing.');
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
                error.response?.data?.message || 'Failed to submit borrow request.'
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
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
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Book Cover */}
        <View style={styles.coverContainer}>
          <View style={[styles.cover, { backgroundColor: colors.surface }]}>
            {getCoverUrl(book) ? (
              <Image source={{ uri: getCoverUrl(book) }} style={styles.coverImage} />
            ) : (
              <Ionicons name="book" size={80} color={colors.textSecondary} />
            )}
          </View>
          {/* Availability pill */}
          <View
            style={[
              styles.availabilityPill,
              { backgroundColor: book.available ? '#43A047' : '#E53935' },
            ]}
          >
            <Ionicons
              name={book.available ? 'checkmark-circle' : 'close-circle'}
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.availabilityPillText}>
              {book.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>

        {/* Book Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
          <Text style={[styles.author, { color: colors.textSecondary }]}>by {book.author}</Text>

          {/* Genre & ISBN row */}
          <View style={styles.tagsRow}>
            {book.genre ? (
              <View style={[styles.tag, { backgroundColor: colors.primary + '22' }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{book.genre}</Text>
              </View>
            ) : null}
            {book.isbn ? (
              <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                  ISBN: {book.isbn}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {book.description || 'No description available for this book.'}
            </Text>
          </View>

          {/* Details */}
          <View style={[styles.section, styles.detailsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
            <DetailRow label="Author" value={book.author} colors={colors} />
            <DetailRow label="Genre" value={book.genre || 'N/A'} colors={colors} />
            <DetailRow label="ISBN" value={book.isbn || 'N/A'} colors={colors} />
            <DetailRow
              label="Status"
              value={book.available ? 'Available' : 'Unavailable'}
              colors={colors}
              valueColor={book.available ? '#43A047' : '#E53935'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Borrow Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.borrowButton,
            { backgroundColor: book.available ? colors.primary : colors.textSecondary },
          ]}
          onPress={handleBorrow}
          disabled={borrowing || !book.available}
        >
          {borrowing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              <Text style={styles.borrowButtonText}>
                {book.available ? 'Borrow Book' : 'Currently Unavailable'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, colors, valueColor }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: valueColor ?? colors.text }]}>{value}</Text>
    </View>
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
    gap: 12,
  },
  cover: {
    width: 200,
    height: 280,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  availabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  availabilityPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  author: {
    fontSize: 16,
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
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
  detailsCard: {
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
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
    gap: 8,
  },
  borrowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

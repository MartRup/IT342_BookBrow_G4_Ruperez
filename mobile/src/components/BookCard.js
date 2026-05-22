import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

/**
 * BookCard — displays a single book.
 *
 * Props:
 *   book            — book object from the backend (uses coverUrl, available, genre)
 *   onPress         — called when the card is tapped (navigate to detail)
 *   onBorrow        — called when the borrow button is tapped
 *   showBorrowButton — whether to show the borrow (+) button (default true)
 */
export default function BookCard({ book, onPress, onBorrow, showBorrowButton = true }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.cover, { backgroundColor: colors.surface }]}>
        {/* Cover image — backend field is coverUrl */}
        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={styles.image} />
        ) : (
          <Ionicons name="book" size={48} color={colors.textSecondary} />
        )}

        {/* Borrow button — only shown when book is available */}
        {showBorrowButton && book.available && (
          <TouchableOpacity
            style={[styles.borrowButton, { backgroundColor: '#4CAF50' }]}
            onPress={(e) => {
              e.stopPropagation();
              onBorrow?.(book);
            }}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Unavailable badge */}
        {!book.available && (
          <View style={[styles.unavailableBadge, { backgroundColor: '#E53935' }]}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
        {book.author}
      </Text>
      {book.genre ? (
        <Text style={[styles.genre, { color: colors.primary }]} numberOfLines={1}>
          {book.genre}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  cover: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  borrowButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unavailableText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    marginBottom: 2,
  },
  genre: {
    fontSize: 11,
    fontWeight: '600',
  },
});

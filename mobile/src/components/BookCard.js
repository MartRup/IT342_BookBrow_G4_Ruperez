import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function BookCard({ book, onPress, onBorrow, showBorrowButton = true }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.cover, { backgroundColor: colors.surface }]}>
        {book.coverImage ? (
          <Image source={{ uri: book.coverImage }} style={styles.image} />
        ) : (
          <Ionicons name="book" size={48} color={colors.textSecondary} />
        )}
        {showBorrowButton && book.availableCopies > 0 && (
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
        {book.availableCopies === 0 && (
          <View style={[styles.unavailableBadge, { backgroundColor: colors.error }]}>
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
      {book.availableCopies !== undefined && (
        <Text style={[styles.availability, { color: colors.textSecondary }]}>
          {book.availableCopies} available
        </Text>
      )}
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
    fontWeight: '600',
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
  availability: {
    fontSize: 11,
  },
});

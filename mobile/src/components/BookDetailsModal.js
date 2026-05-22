import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borrowService } from '../services/borrowService';

const getCoverUrl = (book) => {
  if (book?.coverUrl) return book.coverUrl;
  const isbn = String(book?.isbn || '').replace(/[^0-9Xx]/g, '');
  return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null;
};

export default function BookDetailsModal({ visible, book, colors, onClose }) {
  const [borrowing, setBorrowing] = useState(false);
  const [message, setMessage] = useState('');

  const handleBorrow = async () => {
    if (!book?.available || borrowing) return;
    setBorrowing(true);
    setMessage('');
    try {
      await borrowService.borrowBook(book.id);
      setMessage('Borrow request submitted. Wait for librarian approval.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to submit borrow request.');
    } finally {
      setBorrowing(false);
    }
  };

  if (!book) return null;

  const coverUrl = getCoverUrl(book);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.cover, { backgroundColor: colors.surface }]}>
              {coverUrl ? (
                <Image source={{ uri: coverUrl }} style={styles.coverImage} />
              ) : (
                <Ionicons name="book" size={72} color={colors.textSecondary} />
              )}
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
            <Text style={[styles.author, { color: colors.textSecondary }]}>by {book.author}</Text>

            <View style={styles.meta}>
              {book.genre ? (
                <Text style={[styles.metaText, { color: colors.primary }]}>Genre: {book.genre}</Text>
              ) : null}
              {book.isbn ? (
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>ISBN: {book.isbn}</Text>
              ) : null}
              <Text style={[styles.metaText, { color: book.available ? '#43A047' : '#E53935' }]}>
                {book.available ? 'Available' : 'Unavailable'}
              </Text>
            </View>

            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {book.description || 'No description available for this book.'}
            </Text>

            {message ? (
              <Text style={[styles.message, { color: message.startsWith('Borrow') ? '#43A047' : '#E53935' }]}>
                {message}
              </Text>
            ) : null}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.borrowButton,
              { backgroundColor: book.available ? colors.primary : colors.textSecondary },
            ]}
            disabled={!book.available || borrowing}
            onPress={handleBorrow}
          >
            {borrowing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
                <Text style={styles.borrowText}>
                  {book.available ? 'Request Borrowing' : 'Currently Unavailable'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    maxHeight: '88%',
    borderRadius: 14,
    padding: 18,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  cover: {
    width: 170,
    height: 240,
    borderRadius: 12,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 14,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  author: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 4,
  },
  meta: {
    marginTop: 14,
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  borrowButton: {
    height: 50,
    borderRadius: 10,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  borrowText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

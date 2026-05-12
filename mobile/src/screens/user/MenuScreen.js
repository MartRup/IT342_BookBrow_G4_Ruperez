import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

export default function MenuScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editMode, setEditMode] = useState('personal'); // 'personal' or 'password'

  // Personal Info State
  const [firstName, setFirstName] = useState(user?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.fullName?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [about, setAbout] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleSavePersonalInfo = async () => {
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await userService.updateProfile({ fullName, email });
      await updateUser({ fullName, email });
      Alert.alert('Success', 'Profile updated successfully');
      setShowEditProfile(false);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await userService.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    }
  };

  const getInitials = () => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderEditProfileModal = () => (
    <Modal
      visible={showEditProfile}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditProfile(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalTabs}>
            <TouchableOpacity
              style={[
                styles.modalTab,
                editMode === 'personal' && { backgroundColor: colors.surface },
              ]}
              onPress={() => setEditMode('personal')}
            >
              <Text
                style={[
                  styles.modalTabText,
                  { color: editMode === 'personal' ? colors.text : colors.textSecondary },
                ]}
              >
                Personal Information
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalTab,
                editMode === 'password' && { backgroundColor: colors.surface },
              ]}
              onPress={() => setEditMode('password')}
            >
              <Text
                style={[
                  styles.modalTabText,
                  { color: editMode === 'password' ? colors.text : colors.textSecondary },
                ]}
              >
                Change Password
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {editMode === 'personal' ? (
              <>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>First Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First Name"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Last Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last Name"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>About</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
                  value={about}
                  onChangeText={setAbout}
                  placeholder="About"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
                    onPress={handleSavePersonalInfo}
                  >
                    <Text style={styles.modalButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.error }]}
                    onPress={() => setShowEditProfile(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Current</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Current Password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>New Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New Password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirm New Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm New Password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />

                <TouchableOpacity
                  style={[styles.updatePasswordButton, { backgroundColor: colors.text }]}
                  onPress={handleChangePassword}
                >
                  <Text style={[styles.updatePasswordText, { color: colors.background }]}>
                    Update Password
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="school" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Menu</Text>
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.fullName || 'User'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.roleText}>{user?.role || 'User'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface }]}
            onPress={() => setShowEditProfile(true)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.menuItem, { backgroundColor: colors.surface }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="moon-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Help and Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>About the Dev</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.primary }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderEditProfileModal()}
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 14,
  },
  roleBadge: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 14,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  modalTab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 8,
    marginTop: 12,
    fontWeight: '600',
  },
  input: {
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  updatePasswordButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  updatePasswordText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

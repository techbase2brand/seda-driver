/**
 * Reset Password Screen
 * Set new password after OTP verification → then go to Login
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import COLORS from '../constants/Color';
import { STRINGS } from '../constants/Constants';
import { fontFamilyHeading, fontFamilyBody } from '../constants/Fonts';
import AppButton from '../components/CustomButton';
import { supabase } from '../lib/supabase';

const ResetPasswordScreen = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({ new: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const err = { new: '', confirm: '' };
    if (newPassword.length < 6)
      err.new = 'Password must be at least 6 characters';
    if (newPassword !== confirmPassword) err.confirm = 'Passwords do not match';
    setErrors(err);
    return !err.new && !err.confirm;
  };

  const handleReset = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setErrors(e => ({ ...e, new: error.message }));
        setLoading(false);
        return;
      }
      navigation.replace('Login');
    } catch (err) {
      setErrors(e => ({ ...e, new: err.message || 'Something went wrong.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.replace('Login')}
        >
          <Icon name="arrow-back" size={24} color={COLORS.WHITE} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            <Image
              source={require('../assets/login_logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subTitle}>Enter your new password below.</Text>

            <View style={styles.card}>
              <Text style={[styles.label, styles.labelFirst]}>
                {STRINGS.NEW_PASSWORD}
              </Text>
              <View
                style={[
                  styles.passwordWrap,
                  errors.new ? { borderColor: COLORS.ERROR } : null,
                ]}
              >
                <TextInput
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={t => {
                    setNewPassword(t);
                    if (errors.new) setErrors(e => ({ ...e, new: '' }));
                  }}
                  secureTextEntry={!showNew}
                  style={styles.passwordInput}
                  placeholderTextColor={COLORS.PLACEHOLDER}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <Icon
                    name={showNew ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={COLORS.PLACEHOLDER}
                  />
                </TouchableOpacity>
              </View>
              {errors.new ? (
                <Text style={styles.errorText}>{errors.new}</Text>
              ) : null}

              <Text style={styles.label}>{STRINGS.CONFIRM_PASSWORD}</Text>
              <View
                style={[
                  styles.passwordWrap,
                  errors.confirm ? { borderColor: COLORS.ERROR } : null,
                ]}
              >
                <TextInput
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={t => {
                    setConfirmPassword(t);
                    if (errors.confirm) setErrors(e => ({ ...e, confirm: '' }));
                  }}
                  secureTextEntry={!showConfirm}
                  style={styles.passwordInput}
                  placeholderTextColor={COLORS.PLACEHOLDER}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Icon
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={COLORS.PLACEHOLDER}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirm ? (
                <Text style={styles.errorText}>{errors.confirm}</Text>
              ) : null}

              <AppButton
                title={loading ? 'Updating...' : STRINGS.RESET_PASSWORD}
                onPress={handleReset}
                disabled={loading}
              />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF8EF',
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: COLORS.WHITE,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
    fontFamily: fontFamilyBody,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.TEXT,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: fontFamilyHeading,
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.PLACEHOLDER,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: fontFamilyBody,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
    fontFamily: fontFamilyBody,
  },
  labelFirst: {
    marginTop: 0,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: fontFamilyBody,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
    fontFamily: fontFamilyBody,
  },
  logo: {
    height: 120,
    width: 120,
    alignSelf: 'center',
    marginBottom: 20,
    resizeMode: 'contain',
  },
});

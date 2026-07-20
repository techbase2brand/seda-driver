/**
 * Change Password Screen
 * Send OTP to logged-in driver's email → navigate to OTP screen
 */

import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

import COLORS from '../constants/Color';
import { STRINGS } from '../constants/Constants';
import { fontFamilyHeading, fontFamilyBody } from '../constants/Fonts';
import AppButton from '../components/CustomButton';
import { supabase } from '../lib/supabase';

const ChangePasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('driver_email');
        if (stored) setEmail(stored);
      } catch (err) {
        console.log('Failed to load driver email:', err);
      }
    })();
  }, []);

  const handleSendOTP = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email not found. Please login again.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed.toLowerCase(),
        options: { shouldCreateUser: false },
      });

      if (otpError) {
        if (otpError.message?.toLowerCase().includes('rate limit')) {
          setError(
            'Too many requests. Please wait a few minutes and try again.',
          );
        } else {
          setError(otpError.message || 'Failed to send OTP. Please try again.');
        }
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem('change_password_email', trimmed.toLowerCase());
      navigation.navigate('ChangePasswordOTP');
    } catch (err) {
      console.error('Change password error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
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
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.subTitle}>
              We'll send an OTP to your registered email to verify your
              identity.
            </Text>

            <View style={styles.card}>
              <Text style={styles.label}>{STRINGS.EMAIL}</Text>
              <TextInput
                placeholder={STRINGS.ENTER_EMAIL}
                value={email}
                editable={false}
                style={[styles.input, styles.inputDisabled]}
                placeholderTextColor={COLORS.PLACEHOLDER}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <AppButton
                title={loading ? 'Sending...' : STRINGS.SEND_OTP}
                onPress={handleSendOTP}
                disabled={loading || !email}
              />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default ChangePasswordScreen;

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
    fontFamily: fontFamilyBody,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
    fontFamily: fontFamilyBody,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
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

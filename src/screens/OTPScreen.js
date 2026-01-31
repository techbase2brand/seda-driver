/**
 * OTP Screen
 * Enter 6-digit OTP → Verify → navigate to Reset Password
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
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

const OTPScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('reset_password_email');
        if (stored) setEmail(stored);
        else navigation.replace('ForgotPassword');
      } catch {
        navigation.replace('ForgotPassword');
      }
    })();
  }, [navigation]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (error) setError('');
  };

  const handleKeyPress = (index, e) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    if (!email) {
      setError('Email missing. Go back and try again.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpValue,
        type: 'email',
      });

      if (verifyError) {
        setError(
          verifyError.message || 'Invalid or expired OTP. Please try again.',
        );
        setLoading(false);
        return;
      }

      navigation.navigate('ResetPassword');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) return;
    setResending(true);
    setError('');
    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false },
      });
      if (resendError) setError(resendError.message || 'Failed to resend OTP.');
      else Alert.alert('Sent', 'OTP has been resent to your email.');
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setResending(false);
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
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subTitle}>
              We sent a 6-digit code to{'\n'}
              <Text style={styles.emailText}>{email || 'your email'}</Text>
            </Text>

            <View style={styles.card}>
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={r => (inputRefs.current[i] = r)}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                      error ? styles.otpBoxError : null,
                    ]}
                    value={digit}
                    onChangeText={v => handleOtpChange(i, v)}
                    onKeyPress={e => handleKeyPress(i, e)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <AppButton
                title={loading ? 'Verifying...' : STRINGS.VERIFY_OTP}
                onPress={handleVerifyOtp}
                disabled={loading}
              />

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResendOtp}
                disabled={resending}
              >
                <Text
                  style={[
                    styles.resendText,
                    resending && styles.resendDisabled,
                  ]}
                >
                  {resending ? 'Resending...' : STRINGS.RESEND_OTP}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default OTPScreen;

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
  emailText: {
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    fontFamily: fontFamilyBody,
  },
  otpBoxFilled: {
    borderColor: COLORS.PRIMARY,
  },
  otpBoxError: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginBottom: 12,
    fontFamily: fontFamilyBody,
  },
  resendBtn: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  resendText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontFamilyBody,
  },
  resendDisabled: {
    opacity: 0.5,
  },
  logo: {
    height: 120,
    width: 120,
    alignSelf: 'center',
    marginBottom: 20,
    resizeMode: 'contain',
  },
});

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import COLORS from '../constants/Color';
// import { STRINGS } from '../constants/Constants';
// import AppButton from '../components/CustomButton';

// const DeliveryLoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState({});

//   const validate = () => {
//     let newErrors = {};

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!email.trim()) {
//       newErrors.email = STRINGS.EMAIL_REQUIRED;
//     } else if (!emailRegex.test(email.trim())) {
//       newErrors.email = STRINGS.EMAIL_INVALID; // 👈 add this string
//     }

//     if (!password.trim()) {
//       newErrors.password = STRINGS.PASSWORD_REQUIRED;
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const onLogin = () => {
//     if (validate()) {
//       console.log('Login Success', { email, password });
//       navigation.navigate('DeliveryStack');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Image source={require('../assets/coconut.png')} style={styles.logo} />

//       <TouchableOpacity style={styles.portalBtn}>
//         <MaterialIcons
//           name={'delivery-dining'}
//           size={22}
//           color={COLORS.WHITE}
//         />
//         <Text style={styles.portalText}>{STRINGS.DRIVER_PORTAL}</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>{STRINGS.DELIVERY_LOGIN}</Text>
//       <Text style={styles.subTitle}>{STRINGS.ACCESS_TEXT}</Text>

//       <View style={styles.card}>
//         <Text style={styles.label}>{STRINGS.EMAIL}</Text>
//         <TextInput
//           placeholder={STRINGS.ENTER_EMAIL}
//           value={email}
//           onChangeText={setEmail}
//           style={[styles.input, errors.email && { borderColor: COLORS.ERROR }]}
//           placeholderTextColor={COLORS.PLACEHOLDER}
//         />
//         {errors.email && <Text style={styles.error}>{errors.email}</Text>}
//         <View
//           style={[
//             styles.passwordContainer,
//             errors.password && { borderColor: COLORS.ERROR },
//           ]}
//         >
//           <TextInput
//             placeholder={STRINGS.ENTER_PASSWORD}
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry={!showPassword}
//             style={styles.passwordInput}
//             placeholderTextColor={COLORS.PLACEHOLDER}
//           />

//           <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//             <Icon
//               name={showPassword ? 'eye-off-outline' : 'eye-outline'}
//               size={22}
//               color={COLORS.PLACEHOLDER}
//             />
//           </TouchableOpacity>
//         </View>
//         {errors.password && <Text style={styles.error}>{errors.password}</Text>}

//         <AppButton title={STRINGS.LOGIN} onPress={onLogin} />
//       </View>
//     </View>
//   );
// };

// export default DeliveryLoginScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.BACKGROUND,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   logo: {
//     height: 90,
//     width: 90,
//     alignSelf: 'center',
//     marginBottom: 20,
//     resizeMode: 'contain',
//   },
//   portalBtn: {
//     backgroundColor: COLORS.PRIMARY,
//     alignSelf: 'center',
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 2,
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginBottom: 20,
//   },
//   portalText: {
//     color: COLORS.WHITE,
//     fontWeight: '600',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: '700',
//     textAlign: 'center',
//     color: COLORS.TEXT,
//   },
//   subTitle: {
//     textAlign: 'center',
//     color: COLORS.PLACEHOLDER,
//     marginBottom: 20,
//   },
//   card: {
//     backgroundColor: COLORS.WHITE,
//     borderRadius: 16,
//     padding: 20,
//   },
//   label: {
//     fontWeight: '600',
//     marginBottom: 6,
//     marginTop: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: COLORS.BORDER,
//     borderRadius: 10,
//     padding: 12,
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.BORDER,
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     marginTop: 14,
//   },

//   passwordInput: {
//     flex: 1,
//     paddingVertical: 12,
//   },
//   error: {
//     color: COLORS.ERROR,
//     fontSize: 12,
//     marginTop: 4,
//   },
// });


import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import COLORS from '../constants/Color';
import { STRINGS } from '../constants/Constants';
import AppButton from '../components/CustomButton';
import { supabase } from '../lib/supabase';

const DeliveryLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = STRINGS.EMAIL_REQUIRED;
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = STRINGS.EMAIL_INVALID;
    }

    if (!password.trim()) {
      newErrors.password = STRINGS.PASSWORD_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const onLogin = async () => {
  if (!validate()) return;

  setLoading(true);
  setErrors({});

  try {
    const cleanEmail = email.trim().toLowerCase();

    /**
     * 1️⃣ Driver table check
     */
    const { data: driver, error } = await supabase
      .from('drivers')
      .select('id,email,franchise_id,role,status')
      .eq('email', cleanEmail)
      .eq('role', 'Driver')
      .single();

    console.log('DRIVER CHECK:', driver, error);

    if (error || !driver) {
      setErrors({ email: 'Driver not found' });
      setLoading(false);
      return;
    }

    /**
     * 2️⃣ Supabase Auth login
     */
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

    if (authError) {
      setErrors({ password: authError.message });
      setLoading(false);
      return;
    }

    /**
     * 3️⃣ Save token & driver data
     */
    await AsyncStorage.multiSet([
      ['token', authData.session.access_token],
      ['driver_id', String(driver.id)],
      ['franchise_id', driver.franchise_id || ''],
      ['driver_email', driver.email],
    ]);

    /**
     * 4️⃣ Navigate
     */
    navigation.reset({
      index: 0,
      routes: [{ name: 'DeliveryStack' }],
    });
  } catch (e) {
    console.log('LOGIN ERROR:', e);
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Image source={require('../assets/coconut.png')} style={styles.logo} />

      <TouchableOpacity style={styles.portalBtn}>
        <MaterialIcons
          name="delivery-dining"
          size={22}
          color={COLORS.WHITE}
        />
        <Text style={styles.portalText}>{STRINGS.DRIVER_PORTAL}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{STRINGS.DELIVERY_LOGIN}</Text>
      <Text style={styles.subTitle}>{STRINGS.ACCESS_TEXT}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{STRINGS.EMAIL}</Text>
        <TextInput
          placeholder={STRINGS.ENTER_EMAIL}
          value={email}
          onChangeText={setEmail}
          style={[styles.input, errors.email && { borderColor: COLORS.ERROR }]}
          placeholderTextColor={COLORS.PLACEHOLDER}
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <View
          style={[
            styles.passwordContainer,
            errors.password && { borderColor: COLORS.ERROR },
          ]}
        >
          <TextInput
            placeholder={STRINGS.ENTER_PASSWORD}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            placeholderTextColor={COLORS.PLACEHOLDER}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={COLORS.PLACEHOLDER}
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={styles.error}>{errors.password}</Text>
        )}

        <AppButton
          title={loading ? 'Logging in...' : STRINGS.LOGIN}
          onPress={onLogin}
          disabled={loading}
        />
      </View>
    </View>
  );
};

export default DeliveryLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    height: 90,
    width: 90,
    alignSelf: 'center',
    marginBottom: 20,
    resizeMode: 'contain',
  },
  portalBtn: {
    backgroundColor: COLORS.PRIMARY,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  portalText: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.TEXT,
  },
  subTitle: {
    textAlign: 'center',
    color: COLORS.PLACEHOLDER,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    padding: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  error: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
  },
});


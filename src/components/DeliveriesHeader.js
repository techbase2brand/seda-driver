// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import Colors from '../constants/Color';

// const DeliveriesHeader = ({ navigation, onLogout }) => {
//   return (
//     <View style={styles.header}>
//       <View style={styles.row}>
//         <Image source={require('../assets/coconut.png')} style={styles.logo} />
//         {/* <View style={styles.logo} /> */}
//         <TouchableOpacity style={styles.logout} onPress={onLogout}>
//           <Icon name="log-out-outline" size={20} color={Colors.WHITE} />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.title}>My Deliveries</Text>
//       <Text style={styles.subTitle}>Downtown District · Today</Text>
//     </View>
//   );
// };

// export default DeliveriesHeader;

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: Colors.PRIMARY,
//     paddingHorizontal: 20,
//     paddingTop: 50,
//     paddingBottom: 55,

//     // borderBottomLeftRadius: 30,
//     // borderBottomRightRadius: 30,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   logo: {
//     height: 40,
//     width: 40,
//     borderRadius: 20,
//     backgroundColor: Colors.WHITE,
//   },
//   logout: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   logoutText: {
//     color: Colors.WHITE,
//     marginLeft: 6,
//     fontWeight: '700',
//   },
//   title: {
//     color: Colors.WHITE,
//     fontSize: 20,
//     fontWeight: '700',
//     marginTop: 16,
//   },
//   subTitle: {
//     color: Colors.WHITE,
//     marginTop: 4,
//   },
// });

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

import Colors from '../constants/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { widthPercentageToDP } from '../utils';

const DeliveriesHeader = ({ navigation, totaldeliveries }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = async () => {
    console.log('working or not ');

    try {
      await AsyncStorage.multiRemove([
        'token',
        'driver_id',
        'franchise_id',
        'driver_email',
      ]);

      console.log('Logout success, storage cleared');
      await supabase.auth.signOut();
      setShowLogoutModal(false);

      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <View style={styles.row}>
          <Image
            source={require('../assets/coconut.png')}
            style={styles.logo}
          />

          <TouchableOpacity
            style={styles.logout}
            onPress={() =>
              navigation.navigate('DriverProfileScreen', {
                totaldeliveries: totaldeliveries,
              })
            }
            // onPress={() => setShowLogoutModal(true)}
          >
            <Feather name="user" size={20} color={Colors.WHITE} />
            {/* <Text style={styles.logoutText}>Logout</Text> */}
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>My Deliveries</Text>
      </View>

      {/* ===== LOGOUT CONFIRM MODAL ===== */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Icon name="log-out-outline" size={42} color={Colors.PRIMARY} />

            <Text style={styles.modalTitle}>Confirm Logout</Text>

            <Text style={styles.modalText}>
              Are you sure you want to logout from your account?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.confirmText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DeliveriesHeader;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 20,
    paddingTop: widthPercentageToDP(10),
    paddingBottom: 35,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  logo: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: Colors.WHITE,
  },

  logout: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoutText: {
    color: Colors.WHITE,
    marginLeft: 6,
    fontWeight: '700',
  },

  title: {
    color: Colors.WHITE,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },

  subTitle: {
    color: Colors.WHITE,
    marginTop: 4,
  },

  /* ===== MODAL ===== */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    backgroundColor: Colors.WHITE,
    width: '85%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },

  modalText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.grayText,
    marginVertical: 12,
  },

  modalActions: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
  },

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },

  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
  },

  cancelText: {
    color: Colors.grayText,
    fontWeight: '500',
  },

  confirmText: {
    color: Colors.WHITE,
    fontWeight: '600',
  },
});

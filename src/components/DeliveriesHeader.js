import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';

const DeliveriesHeader = ({ navigation, onLogout }) => {
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Image source={require('../assets/coconut.png')} style={styles.logo} />
        {/* <View style={styles.logo} /> */}
        <TouchableOpacity style={styles.logout} onPress={onLogout}>
          <Icon name="log-out-outline" size={20} color={Colors.WHITE} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>My Deliveries</Text>
      <Text style={styles.subTitle}>Downtown District · Today</Text>
    </View>
  );
};

export default DeliveriesHeader;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 55,

    // borderBottomLeftRadius: 30,
    // borderBottomRightRadius: 30,
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
});

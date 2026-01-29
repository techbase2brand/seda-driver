import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';

const HeaderBar = ({ navigation,orderName,orderStop }) => {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color={Colors.WHITE} />
          {/* <Text style={styles.backText}>Back</Text> */}
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Delivery Details</Text>
          <Text style={styles.sub}>{orderName}</Text>
        </View>
      </View>

      <View style={styles.stopBadge}>
        <Text style={styles.stopText}>Stop{'\n'}{orderStop}</Text>
      </View>
    </View>
  );
};

export default HeaderBar;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.PRIMARY,
    padding: 20,
    paddingTop: 50,
    paddingBottom: 85,
    
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: Colors.WHITE,
    marginLeft: 4,
  },
  title: {
    color: Colors.WHITE,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },
  sub: {
    color: Colors.WHITE,
    opacity: 0.9,
    marginTop: 2,
  },
  stopBadge: {
    position: 'absolute',
    right: 20,
    top: 60,
    backgroundColor: '#FFFFFF40',
    borderRadius: 80,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.WHITE,
  },
  stopText: {
    color: Colors.WHITE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
});

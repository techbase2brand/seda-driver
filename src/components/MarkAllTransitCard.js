import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/Color';

const MarkAllTransitCard = () => {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[Colors.PRIMARY_DARK, Colors.PRIMARY_LOW]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.gradient}>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.btn}
          onPress={() => {}}>
          
          <Icon name="car-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>
            Mark All Orders In Transit (2)
          </Text>
        </TouchableOpacity>

      </LinearGradient>

      <Text style={styles.info}>
        Start your delivery route by marking all assigned orders as in transit
      </Text>
    </View>
  );
};

export default MarkAllTransitCard;
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.cardBg,
    margin: 16,
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  gradient: {
    borderRadius: 12,
    overflow: 'hidden', // 🔴 MUST for iOS
  },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,            
    paddingHorizontal: 16,

    borderRadius: 12,
  },

  btnText: {
    color: Colors.WHITE,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },

  info: {
    marginTop: 10,
    color: Colors.grayText,
    textAlign: 'center',
    fontSize: 12,
  },
});

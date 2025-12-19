import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';

const InstructionCard = () => {
  return (
    <View style={styles.card}>
      <Icon name="chatbubble-outline" size={18} color={Colors.PRIMARY} />
      <Text style={styles.text}>
        Please call before arrival. Deliver to back entrance.
      </Text>
    </View>
  );
};

export default InstructionCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EAF4FF',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
  },
  text: {
    marginLeft: 10,
    color: Colors.PRIMARY_DARK,
    fontSize: 13,
    flex: 1,
  },
});

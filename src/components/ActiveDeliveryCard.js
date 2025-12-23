import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';
import GradientButton from './GradientButton';

const ActiveDeliveryCard = ({ item, navigation }) => {
  const isOrderClosed =
    item?.deliveryStatus === 'completed' ||
    item?.deliveryStatus === 'cancelled';

  const handleNavigation = () => {
    navigation.navigate('UpdateStatusScreen', { order: item });
  };
  const companyDetail = JSON.parse(item?.customer_details);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.order} numberOfLines={1} ellipsizeMode="tail">
          {item.order_name}
        </Text>
        <Text style={styles.qty}>
          {'Fresh Coconuts'} : {`${item.quantity} Cases`}
        </Text>
      </View>

      <View style={styles.row}>
        <Icon name="business-outline" size={18} />
        <Text style={styles.text}>{companyDetail?.company_name}</Text>
      </View>

      <View style={styles.row}>
        <Icon name="location-outline" size={18} />
        <Text style={styles.text}>{item.delivery_address}</Text>
      </View>

      <View style={styles.actions}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: Colors.textGray,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              paddingHorizontal: 16,
              borderRadius: 14,
              width: '49%',
            }}
            onPress={() =>
              navigation.navigate('DeliveryDetailsScreen', {
                orderId: item?.id,
              })
            }
          >
            <Text>View Detail</Text>
          </TouchableOpacity>

          <GradientButton
            title="Mark as Delivered"
            onPress={handleNavigation}
            disabled={isOrderClosed}
            colors={Colors.successGradient}
            icon={
              <Icon name="checkmark-circle-outline" size={18} color="#fff" />
            }
          />
        </View>

        <View style={{ height: 10 }} />

        <GradientButton
          title="Unable to Deliver"
          colors={Colors.dangerGradient}
          disabled={isOrderClosed}
          onPress={() =>
            navigation.navigate('UnableToDeliverScreen', { order: item })
          }
          icon={<Icon name="close-circle-outline" size={18} color="#fff" />}
        />
      </View>
    </View>
  );
};

export default ActiveDeliveryCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.WHITE,
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  order: {
    fontWeight: '700',
    fontSize: 14,
    width: '48%',
  },
  qty: {
    color: Colors.textGray,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  text: {
    marginLeft: 8,
    color: Colors.TEXT,
    flex: 1,
  },
  actions: {
    marginTop: 12,
  },
});

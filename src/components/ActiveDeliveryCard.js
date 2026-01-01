import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';
import GradientButton from './GradientButton';
import { widthPercentageToDP } from '../utils';
import LinearGradient from 'react-native-linear-gradient';

const ActiveDeliveryCard = ({ item, navigation }) => {
  const isOrderClosed =
    item?.deliveryStatus === 'completed' ||
    item?.deliveryStatus === 'cancelled';

  const handleNavigation = () => {
    navigation.navigate('UpdateStatusScreen', { order: item });
  };
  const companyDetail = JSON.parse(item?.customer_details);
  const rawAddresses = companyDetail?.delivery_address;

  // always convert to array
  const deliveryAddresses = Array.isArray(rawAddresses)
    ? rawAddresses
    : rawAddresses
    ? [rawAddresses]
    : [];

  const selectedAddress =
    deliveryAddresses.length === 1
      ? deliveryAddresses[0]
      : deliveryAddresses.find(addr => addr?.isSelected === true);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {item?.stop_number && (
            <LinearGradient
              colors={['#84b9dcff', '#4AA3DF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconBox}
            >
              <Text
                style={{ color: '#fff', fontWeight: '800' }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                # {item?.stop_number}
              </Text>
            </LinearGradient>
          )}
          <Text style={styles.order} ellipsizeMode="tail">
            {item.order_name}
          </Text>
        </View>
        <View>
          <Text style={styles.qty}>{'Fresh Coconuts'}</Text>
          <Text style={[styles.qty, { textAlign: 'right', fontWeight: '700' }]}>
            {`${item.quantity} Cases`}
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={styles.row}>
          <Icon name="business-outline" size={18} />
          <Text style={styles.text}>{companyDetail?.company_name}</Text>
        </View>
        {/* <View
          style={[
            {
              width: widthPercentageToDP(23),
              borderRadius: 10,
              paddingVertical: 5,
              backgroundColor:
                item?.deliveryStatus == 'completed'
                  ? '#65c391ff'
                  : item?.deliveryStatus == 'cancelled'
                  ? '#FF3B30'
                  : '#3655f2e8',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          
          <Text
            style={[{ color: '#fff', textAlign: 'center', fontWeight: '700' }]}
          >
            {item?.deliveryStatus == 'cancelled' ? "undelivered":item?.deliveryStatus}
          </Text>
        </View> */}
        {(item?.deliveryStatus === 'completed' ||
          item?.deliveryStatus === 'cancelled') && (
          <View
            style={{
              width: widthPercentageToDP(23),
              borderRadius: 10,
              paddingVertical: 5,
              backgroundColor:
                item?.deliveryStatus === 'completed' ? '#65c391ff' : '#FF3B30',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: '#fff',
                textAlign: 'center',
                fontWeight: '700',
              }}
            >
              {item?.deliveryStatus === 'cancelled'
                ? 'undelivered'
                : item?.deliveryStatus}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.row}>
        <Icon name="location-outline" size={18} />
        <Text style={styles.text}>
          {selectedAddress?.street && selectedAddress?.street !== undefined
            ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zipCode}`
            : item?.delivery_address}
        </Text>
        {/* <Text style={styles.text}>
          {`${selectedAddress?.street}, ${selectedAddress?.city}, ${selectedAddress?.state}, ${selectedAddress?.zipCode}` ||
            item?.delivery_address}
        </Text> */}
      </View>
      {companyDetail?.delivery_zone_name && (
        <View style={styles.row}>
          <Icon name="cube-outline" size={18} />
          <Text style={styles.text}>{companyDetail?.delivery_zone_name}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
            width: widthPercentageToDP(80),
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
              width: '50%',
            }}
            onPress={() =>
              navigation.navigate('DeliveryDetailsScreen', {
                orderId: item?.id,
              })
            }
          >
            <Text>View Detail</Text>
          </TouchableOpacity>
          <View style={{ width: '50%' }}>
            <GradientButton
              title="Mark as Delivered"
              onPress={handleNavigation}
              disabled={isOrderClosed}
              font={true}
              colors={Colors.successGradient}
              icon={
                <Icon name="checkmark-circle-outline" size={18} color="#fff" />
              }
            />
          </View>
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
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: {
    height: 40,
    width: 40,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  order: {
    fontWeight: '600',
    fontSize: 14,
    // width: '1%',
  },
  qty: {
    color: Colors.textGray,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: widthPercentageToDP(50),
  },
  text: {
    marginLeft: 8,
    color: Colors.TEXT,
    flex: 1,
    fontWeight: '700',
  },
  actions: {
    marginTop: 12,
  },
});

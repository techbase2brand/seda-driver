import React, { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../constants/Color';
import HeaderBar from '../components/HeaderBar';
import { InfoCard, InfoRow } from '../components/InfoCard';
import ActionButton from '../components/ActionButton';
import InstructionCard from '../components/InstructionCard';
import { supabase } from '../lib/supabase';
import { parseCustomerDetails, buildAddressString } from '../utils';

const DeliveryDetailsScreen = ({ navigation, route }) => {
  // const phoneNumber = '9876543210';
  // const address = '43 ISBT RdSector 43, Chandigarh';
  const orderId = route?.params?.orderId;
  const [order, setOrder] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      Alert.alert('Error', 'Order fetch failed');
      return;
    }

    setOrder(data);
  }, [orderId]);

  // Refetch every time the screen comes back into focus. Without this the
  // screen kept the copy it loaded on first open, so after submitting a
  // delivery the driver came back to a stale screen that still offered
  // "Mark as Delivered" for an order that was already completed.
  useFocusEffect(
    useCallback(() => {
      fetchOrder();
    }, [fetchOrder]),
  );

  const customer =
    parseCustomerDetails(order?.customer_details);
      const rawAddresses = customer?.delivery_address;

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
  // const selectedAddress = customer?.delivery_address?.find(
  //   item => item?.isSelected === true,
  // );
  // console.log('selectedAddress>>', customer, selectedAddress);
  const formatDate = dateString => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };
  const onCallPress = phone => {
    if (!phone) {
      Alert.alert(
        'No phone number',
        'This order has no customer phone number saved. Please contact your office.',
      );
      return;
    }

    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Error', 'Could not start the call from this device.'),
    );
  };
  // const deliveredNavigation = () => {
  //   navigation.navigate('UpdateStatusScreen');
  // };
  const deliveredNavigation = () => {
    navigation.navigate('UpdateStatusScreen', { order: order });
  };
  const onNavigatePress = address => {
    console.log('addrsess', address);

    // const encodedAddress = encodeURIComponent(address);ss
    navigation.navigate('DriverMapScreen', { address: address, order: order });
    //   const url =
    //     Platform.OS === 'ios'
    //       ? `http://maps.apple.com/?daddr=${encodedAddress}`
    //       : `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

    //   Linking.openURL(url).catch(() =>
    //     Alert.alert('Error', 'Map Not working'),
    //   );
  };

  // customer_details is sometimes empty even though the order itself carries a
  // delivery_address. The order card already falls back to it, so the details
  // screen and the Navigate button must do the same - otherwise the map says
  // "No delivery address was found" for an order that does have one.
  const phoneNumber = String(customer?.phone ?? '').trim();

  const deliveryAddress =
    buildAddressString(selectedAddress) ||
    buildAddressString(customer?.delivery_address) ||
    buildAddressString(order?.delivery_address);

  const isDelivered = order?.deliveryStatus === 'completed';

  return (
    <ScrollView style={styles.container}>
      <View style={{ position: 'relative', marginBottom: 80 }}>
        <HeaderBar navigation={navigation} orderName={order?.order_name} orderStop={order?.stop_number} />
        <View
          style={{
            position: 'absolute',
            top: '55%',
            width: '100%',
            padding: 16,
          }}
        >
          <InfoCard title="Order Information">
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <InfoRow label="Product Type" value="Fresh Coconuts" />
              <InfoRow label="Quantity" value={`${order?.quantity} cases`} />
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <InfoRow label="PO Number" value={order?.po_number} />
              <InfoRow
                label="Delivery Date"
                value={formatDate(order?.delivery_date)}
              />
            </View>
          </InfoCard>
        </View>
      </View>
      <View style={{ padding: 16 }}>
        <InfoCard title="Customer Details">
          <InfoRow
            icon="business-outline"
            label="Company"
            value={customer?.company_name}
          />
          <InfoRow icon="person-outline" label="Name" value={customer?.first_name} />
          <InfoRow icon="call-outline" label="Phone Number" value={customer?.phone} />
          <InfoRow
            icon="location-outline"
            label="Delivery Address"
            value={deliveryAddress || '-'}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 4,
              marginTop: 24,
            }}
          >
            <View style={{ width: isDelivered ? '100%' : '50%' }}>
              <ActionButton
                title="Call"
                icon="call-outline"
                colors={Colors.successGradient}
                disabled={!phoneNumber}
                onPress={() => onCallPress(phoneNumber)}
              />
            </View>
            {!isDelivered && (
              <View style={{ width: '50%' }}>
                <ActionButton
                  title="Navigate"
                  icon="navigate-outline"
                  colors={[Colors.PRIMARY_LOW, Colors.PRIMARY_DARK]}
                  disabled={!deliveryAddress}
                  onPress={() => onNavigatePress(deliveryAddress)}
                />
              </View>
            )}
          </View>
        </InfoCard>

        {!isDelivered && (
          <>
            <InfoCard title="Delivery Instructions">
              <InstructionCard
                text={
                  order?.special_instructions ||
                  order?.order_notes ||
                  order?.orderNotes ||
                  ''
                }
              />
            </InfoCard>

            <ActionButton
              title="Mark as Delivered"
              icon="checkmark-circle-outline"
              colors={Colors.successGradient}
              onPress={deliveredNavigation}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default DeliveryDetailsScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.BACKGROUND,
    // padding: 16,
  },
});

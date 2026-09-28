import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ActiveDeliveryCard from '../components/ActiveDeliveryCard';
import DeliveriesHeader from '../components/DeliveriesHeader';
import MarkAllTransitCard from '../components/MarkAllTransitCard';
import DeliveryStats from '../components/DeliveryStats';

import { fontFamilyHeading, fontFamilyBody } from '../constants/Fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { ACTIVE_DELIVERIES } from '../constants/Constants';
import { useDriverLocationTrackingStatus } from '../services/driverLocationTracking';
import { isSameCalendarDay } from '../utils';
import { fillMissingCustomerDetails } from '../services/customerLookup';

const OrderSection = ({ title, data, navigation }) => {
  if (!data.length) return null;

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.title}>
        {title} ({data.length})
      </Text>

      <FlatList
        data={data}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <ActiveDeliveryCard item={item} navigation={navigation} />
        )}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const DeliveriesScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // first load
  const [refreshing, setRefreshing] = useState(false); // pull to refresh
  const [driverId, setDriverId] = useState(null);
  const [franchiseId, setFranchiseId] = useState(null);
  const [markAllOrder, setMarkAllOrder] = useState(false);
  const [selectedTab, setSelectedTab] = useState('today'); // 'today' | 'delivered' | 'tomorrow'
  const locationTracking = useDriverLocationTrackingStatus();

  const loadIdsFromStorage = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    const dId = await AsyncStorage.getItem('driver_id');
    const fId = await AsyncStorage.getItem('franchise_id');

    // normalize values
    const dIdNum = dId ? Number(dId) : null;
    const fIdClean =
      fId && fId !== 'null' && fId !== 'undefined' && fId.trim() !== ''
        ? fId
        : null;

    console.log('token>>', token);
    console.log('driver_id>>', dIdNum);
    console.log('franchise_id>>', fIdClean);

    setDriverId(dIdNum);
    setFranchiseId(fIdClean);

    return { dIdNum, fIdClean };
  }, []);
  const fetchOrders = useCallback(
    async ({ dIdNum, fIdClean } = {}) => {
      try {
        let did = dIdNum;
        let fid = fIdClean;

        if (!did && did !== 0) {
          const ids = await loadIdsFromStorage();
          did = ids.dIdNum;
          fid = ids.fIdClean;
        }

        if (!did) {
          setOrders([]);
          return;
        }

        // 🔹 today range
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let query = supabase
          .from('orders')
          .select('*')
          .eq('driver_id', did)
          // .gte('created_at', startOfDay.toISOString())
          // .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });

        if (fid) {
          query = query.eq('franchise_id', fid);
        }

        const { data, error } = await query;

        if (error) {
          console.log('Orders fetch error:', error);
          setOrders([]);
          return;
        }
        console.log('Orders fetch:', data);
        setOrders(await fillMissingCustomerDetails(data));
      } catch (e) {
        console.log('fetchOrders exception:', e);
        setOrders([]);
      }
    },
    [loadIdsFromStorage],
  );

  const POLL_INTERVAL_MS = 15000; // 15 seconds

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      const ids = await loadIdsFromStorage();
      if (isMounted) {
        await fetchOrders(ids);
        setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [fetchOrders, loadIdsFromStorage, markAllOrder]);

  // Refetch the moment the screen is focused, then keep polling as a fallback.
  // The immediate fetch matters when coming back from a delivery - the list
  // used to sit on stale data until the next 15s tick.
  useFocusEffect(
    useCallback(() => {
      fetchOrders({ dIdNum: driverId, fIdClean: franchiseId });

      const id = setInterval(() => {
        fetchOrders({ dIdNum: driverId, fIdClean: franchiseId });
      }, POLL_INTERVAL_MS);
      return () => clearInterval(id);
    }, [fetchOrders, driverId, franchiseId]),
  );

  // Live updates. Supabase pushes every change to this driver's orders, so a
  // status change made in the warehouse app shows up straight away instead of
  // waiting for the next poll. The poll above stays as a safety net in case
  // Realtime is not enabled for the orders table.
  useEffect(() => {
    if (!driverId) {
      return undefined;
    }

    const channel = supabase
      .channel(`orders-driver-${driverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `driver_id=eq.${driverId}`,
        },
        payload => {
          console.log('Realtime order change:', payload.eventType);
          fetchOrders({ dIdNum: driverId, fIdClean: franchiseId });
        },
      )
      .subscribe(status => {
        console.log('Realtime channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, franchiseId, fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders({ dIdNum: driverId, fIdClean: franchiseId });
    setRefreshing(false);
  }, [fetchOrders, driverId, franchiseId]);

  const completedOrders = orders.filter(
    item => item.deliveryStatus === 'completed',
  );

  const completedCount = completedOrders.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCompletedOrders = orders.filter(item => {
    if (item.deliveryStatus !== 'completed') return false;

    const orderDate = new Date(item.order_date);
    orderDate.setHours(0, 0, 0, 0);

    return orderDate.getTime() === today.getTime();
  });

  const todayCompletedCount = todayCompletedOrders.length;
  const totaldeliveries = {
    totalompleted: completedCount,
    todaycompleted: todayCompletedCount,
  };

  const tabEmptyMessage = {
    today: 'No orders scheduled for today',
    delivered: 'No orders delivered yet',
    tomorrow: 'No orders scheduled for tomorrow',
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>{tabEmptyMessage[selectedTab]}</Text>
      </View>
    );
  };

  const sortActiveWithStop = list => {
    return [...list].sort((a, b) => {
      const aHasStop = a.stop_number != null;
      const bHasStop = b.stop_number != null;

      if (aHasStop && bHasStop) {
        return a.stop_number - b.stop_number;
      }

      if (aHasStop && !bHasStop) return -1;

      if (!aHasStop && bHasStop) return 1;

      return 0;
    });
  };

  // The three stat tabs above (Today's / Delivered / Tomorrow's) both count
  // and filter - the card list below always reflects whichever one is
  // selected, instead of always showing every order the driver has ever had
  // assigned to them. Reuses the `today` declared above for totaldeliveries.
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const ordersForSelectedTab = orders.filter(item => {
    if (selectedTab === 'delivered') {
      return item.deliveryStatus === 'completed';
    }
    const targetDay = selectedTab === 'tomorrow' ? tomorrow : today;
    return isSameCalendarDay(item.delivery_date, targetDay);
  });

  const activeOrdersRaw = ordersForSelectedTab.filter(
    item =>
      item.deliveryStatus !== 'unable to deliver' &&
      item.deliveryStatus !== 'completed',
  );

  const activeOrders = sortActiveWithStop(activeOrdersRaw);
  const undeliveredOrders = ordersForSelectedTab?.filter(
    item => item.deliveryStatus === 'unable to deliver',
  );

  const completedOrdersList = ordersForSelectedTab?.filter(
    item => item.deliveryStatus === 'completed',
  );

  // Calculate eligible orders for MarkAllTransitCard (same logic as in
  // MarkAllTransitCard component). Scoped to today's date regardless of
  // which tab is being viewed - bulk-starting a route is inherently a
  // "today" action, and used to be able to sweep up a future day's order
  // that happened to already be in 'driver assigned' status.
  const eligibleOrders = orders?.filter(
    o =>
      isSameCalendarDay(o.delivery_date, today) &&
      o.deliveryStatus !== 'completed' &&
      o.deliveryStatus !== 'unable to deliver' &&
      o.deliveryStatus !== 'in transit',
  );

  const hasEligibleOrders = eligibleOrders?.length > 0;

  return (
    <View style={styles.container}>
      <View
        style={{
          position: 'relative',
          marginBottom: hasEligibleOrders ? 80 : 10,
        }}
      >
        <DeliveriesHeader
          navigation={navigation}
          totaldeliveries={totaldeliveries}
          hasEligibleOrders={hasEligibleOrders}
        />
        {hasEligibleOrders && (
          <View style={{ position: 'absolute', top: '63%' }}>
            <MarkAllTransitCard
              orders={orders}
              setMarkAllOrder={setMarkAllOrder}
              onSuccess={fetchOrders}
            />
          </View>
        )}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {locationTracking.active && (
          <View style={styles.trackingBanner}>
            <View style={styles.trackingDot} />
            <Text style={styles.trackingText}>
              Sharing live location for order
              {locationTracking.orderIds.length > 1 ? 's' : ''}{' '}
              {locationTracking.orderIds.join(', ')}
              {locationTracking.lastPingAt
                ? ` · last update ${locationTracking.lastPingAt.toLocaleTimeString()}`
                : ''}
            </Text>
          </View>
        )}

        <DeliveryStats
          orders={orders}
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        />

        <View style={{ padding: 16, flex: 1 }}>
          {/* <Text style={styles.title}>Active Deliveries</Text> */}

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" />
              <Text style={styles.loaderText}>Loading orders...</Text>
            </View>
          ) : (
            // <FlatList
            //   data={orders}
            //   keyExtractor={item => String(item.id)}
            //   renderItem={({ item }) => (
            //     <ActiveDeliveryCard item={item} navigation={navigation} />
            //   )}
            //   scrollEnabled={false}
            //   showsVerticalScrollIndicator={false}
            //   ListEmptyComponent={renderEmpty}
            //   // refreshControl={
            //   //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            //   // }
            // />
            <>
              <OrderSection
                title={
                  selectedTab === 'tomorrow'
                    ? 'Scheduled for Tomorrow'
                    : 'Active Deliveries'
                }
                data={activeOrders}
                navigation={navigation}
              />
              <OrderSection
                title="Undelivered Orders"
                data={undeliveredOrders}
                navigation={navigation}
              />
              <OrderSection
                title="Completed Orders"
                data={completedOrdersList}
                navigation={navigation}
              />
              {!ordersForSelectedTab.length && renderEmpty()}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DeliveriesScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12, fontFamily: fontFamilyHeading },

  trackingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#E8F8EF',
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  trackingText: {
    flex: 1,
    fontSize: 11,
    color: '#16A34A',
    fontFamily: fontFamilyBody,
  },

  loaderWrap: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  loaderText: { marginTop: 10, fontSize: 14, opacity: 0.7, fontFamily: fontFamilyBody },

  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 14, opacity: 0.6, fontFamily: fontFamilyBody },
});

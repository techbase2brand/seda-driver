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

import ActiveDeliveryCard from '../components/ActiveDeliveryCard';
import DeliveriesHeader from '../components/DeliveriesHeader';
import MarkAllTransitCard from '../components/MarkAllTransitCard';
import DeliveryStats from '../components/DeliveryStats';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { ACTIVE_DELIVERIES } from '../constants/Constants';

const OrderSection = ({ title, data, navigation }) => {
  if (!data.length) return null;

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.title}>{title}</Text>

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
    console.log('orders>>', orders.length);

    setDriverId(dIdNum);
    setFranchiseId(fIdClean);

    return { dIdNum, fIdClean };
  }, []);
  const sortOrdersByStatus = ordersList => {
    if (!Array.isArray(ordersList)) return [];

    const getPriority = status => {
      if (status === 'completed') return 3;
      if (status === 'unable to deliver') return 2;
      return 1; // in transit / pending
    };

    return [...ordersList].sort((a, b) => {
      //  status priority
      const statusDiff =
        getPriority(a.deliveryStatus) - getPriority(b.deliveryStatus);

      if (statusDiff !== 0) {
        return statusDiff;
      }

      //  same status → sort by stop_number
      const stopA = a.stop_number ?? 0;
      const stopB = b.stop_number ?? 0;

      return stopA - stopB;
    });
  };

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
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
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

        const sortedOrders = sortOrdersByStatus(data);
        setOrders(data);
      } catch (e) {
        console.log('fetchOrders exception:', e);
        setOrders([]);
      }
    },
    [loadIdsFromStorage],
  );

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

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Order not found</Text>
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

  const activeOrdersRaw = orders.filter(
    item =>
      item.deliveryStatus !== 'unable to deliver' &&
      item.deliveryStatus !== 'completed',
  );

  const activeOrders = sortActiveWithStop(activeOrdersRaw);
  const undeliveredOrders = orders?.filter(
    item => item.deliveryStatus === 'unable to deliver',
  );

  const completedOrdersList = orders?.filter(
    item => item.deliveryStatus === 'completed',
  );

  // Calculate eligible orders for MarkAllTransitCard (same logic as in MarkAllTransitCard component)
  const eligibleOrders = orders?.filter(
    o =>
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
        <DeliveryStats orders={orders} />

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
                title="Active Deliveries"
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
              {!orders.length && renderEmpty()}
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
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  loaderWrap: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  loaderText: { marginTop: 10, fontSize: 14, opacity: 0.7 },

  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 14, opacity: 0.6 },
});

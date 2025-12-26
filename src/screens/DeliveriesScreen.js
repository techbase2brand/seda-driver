// import React, { useEffect } from 'react';
// import { View, Text, FlatList, StyleSheet } from 'react-native';
// import ActiveDeliveryCard from '../components/ActiveDeliveryCard';
// import { ACTIVE_DELIVERIES } from '../constants/Constants';
// import DeliveriesHeader from '../components/DeliveriesHeader';
// import MarkAllTransitCard from '../components/MarkAllTransitCard';
// import DeliveryStats from '../components/DeliveryStats';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { supabase } from '../lib/supabase';

// const DeliveriesScreen = ({ navigation }) => {
//   useEffect(() => {
//     const tokenn = async () => {
//       const token = await AsyncStorage.getItem('token');
//       const franchiseId = await AsyncStorage.getItem('franchise_id');
//       const driverId = await AsyncStorage.getItem('driver_id');

//       console.log('franchiseIdfranchiseId>>', franchiseId, token,driverId);
//     };
//     tokenn();
//   }, []);
//   const onLogout = async () => {
//     try {
//       // remove specific keys
//       await AsyncStorage.multiRemove([
//         'token',
//         'driver_id',
//         'franchise_id',
//         'driver_email',
//       ]);

//       console.log('Logout success, storage cleared');

//       // optional: supabase auth logout
//       await supabase.auth.signOut();

//       // navigate to login
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'AuthStack' }],
//       });
//     } catch (error) {
//       console.log('Logout error:', error);
//     }
//   };
//   return (
//     <View style={styles.container}>
//       <View style={{ position: 'relative', marginBottom: 100 }}>
//         <DeliveriesHeader navigation={navigation} onLogout={onLogout} />
//         <View style={{ position: 'absolute', top: '75%' }}>
//           <MarkAllTransitCard />
//         </View>
//       </View>
//       <DeliveryStats />
//       <View style={{ padding: 16 }}>
//         <Text style={styles.title}>Active Deliveries</Text>

//         <FlatList
//           data={ACTIVE_DELIVERIES}
//           keyExtractor={item => item.id}
//           renderItem={({ item }) => (
//             <ActiveDeliveryCard item={item} navigation={navigation} />
//           )}
//           showsVerticalScrollIndicator={false}
//         />
//       </View>
//     </View>
//   );
// };

// export default DeliveriesScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // padding: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 12,
//   },
// });

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import ActiveDeliveryCard from '../components/ActiveDeliveryCard';
import DeliveriesHeader from '../components/DeliveriesHeader';
import MarkAllTransitCard from '../components/MarkAllTransitCard';
import DeliveryStats from '../components/DeliveryStats';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { ACTIVE_DELIVERIES } from '../constants/Constants';

const DeliveriesScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // first load
  const [refreshing, setRefreshing] = useState(false); // pull to refresh
  const [driverId, setDriverId] = useState(null);
  const [franchiseId, setFranchiseId] = useState(null);

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

    return [...ordersList].sort((a, b) => {
      const getPriority = status => {
        if (status === 'completed') return 3;
        if (status === 'cancelled') return 2;
        return 1; // baki sab
      };

      return getPriority(a.deliveryStatus) - getPriority(b.deliveryStatus);
    });
  };

  const fetchOrders = useCallback(
    async ({ dIdNum, fIdClean } = {}) => {
      try {
        // if ids not passed, read from state/storage
        let did = dIdNum;
        let fid = fIdClean;

        if (!did && did !== 0) {
          const ids = await loadIdsFromStorage();
          did = ids.dIdNum;
          fid = ids.fIdClean;
        }

        if (!did) {
          console.log('No driverId found, orders empty');
          setOrders([]);
          return;
        }

        // Build query
        let query = supabase
          .from('orders')
          .select('*')
          .eq('driver_id', did) // driverId match (must)
          .order('created_at', { ascending: false })
          .limit(50);

        // franchiseId match only if exists
        if (fid) {
          query = query.eq('franchise_id', fid);
        }

        const { data, error } = await query;

        if (error) {
          console.log('Orders fetch error:', error);
          setOrders([]);
          return;
        }

        console.log('✅ Orders fetched:', data?.length || 0);
        const sortedOrders = sortOrdersByStatus(data);
        setOrders(sortedOrders);
        console.log('Orders data >>', sortedOrders);
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
  }, [fetchOrders, loadIdsFromStorage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders({ dIdNum: driverId, fIdClean: franchiseId });
    setRefreshing(false);
  }, [fetchOrders, driverId, franchiseId]);

  const onLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'token',
        'driver_id',
        'franchise_id',
        'driver_email',
      ]);

      console.log('Logout success, storage cleared');
      await supabase.auth.signOut();

      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Order not found</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ position: 'relative', marginBottom: 100 }}>
        <DeliveriesHeader navigation={navigation} onLogout={onLogout} />
        <View
          style={{ position: 'absolute', top: '75%', paddingHorizontal: 30 }}
        >
          <MarkAllTransitCard orders={orders} />
        </View>
      </View>

      <DeliveryStats orders={orders} />

      <View style={{ padding: 16, flex: 1 }}>
        <Text style={styles.title}>Active Deliveries</Text>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" />
            <Text style={styles.loaderText}>Loading orders...</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <ActiveDeliveryCard item={item} navigation={navigation} />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </View>
  );
};

export default DeliveriesScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  loaderWrap: {
    flex: 1,
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

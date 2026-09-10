import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = 'https://khgwhkhwverzbnnmcpct.supabase.co';
// const SUPABASE_ANON_KEY ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ3doa2h3dmVyemJubm1jcGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMjk0NTYsImV4cCI6MjA3OTgwNTQ1Nn0.JAL_WeVLvZHodO1PxMuEwpc5p35CbTyaA0kPIXDnYIY';

const SUPABASE_URL = 'https://besbkmyixlhkpfmqbdgc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc2JrbXlpeGxoa3BmbXFiZGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODA0MjgsImV4cCI6MjA5MTk1NjQyOH0.XIByv0Z6HwWdUR2Fj8jEKE5e-xJr5WZdaqN9tClz55I';

export { SUPABASE_URL };

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // React Native has no localStorage, so without this adapter the session is
    // never persisted and every call after an app restart goes out anonymous.
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

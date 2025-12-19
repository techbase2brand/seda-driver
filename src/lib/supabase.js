import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://khgwhkhwverzbnnmcpct.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ3doa2h3dmVyemJubm1jcGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMjk0NTYsImV4cCI6MjA3OTgwNTQ1Nn0.JAL_WeVLvZHodO1PxMuEwpc5p35CbTyaA0kPIXDnYIY';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

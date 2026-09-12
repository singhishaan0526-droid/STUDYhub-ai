const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

const getSupabase = () => {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_URL or SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY) is missing in environment variables.");
    }
    supabase = createClient(url, key);
  }
  return supabase;
};

const connectDB = async () => {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

    if (!url || !key) {
      console.warn("⚠️ SUPABASE_URL or SUPABASE_KEY environment variables are missing.");
      return;
    }

    const client = getSupabase();
    // Quick test query to verify Supabase connection
    const { error } = await client.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('Connected to Supabase (Note: verify tables are created with init.sql):', error.message);
    } else {
      console.log('Successfully connected to Supabase PostgreSQL database!');
    }
  } catch (err) {
    console.error('Supabase connection check warning:', err.message);
  }
};

module.exports = { getSupabase, connectDB };

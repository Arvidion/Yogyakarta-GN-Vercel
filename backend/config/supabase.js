const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iroknccjfgyniobixgpo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.warn('Warning: SUPABASE_KEY is not defined in environment variables.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY || 'dummy_key');

module.exports = { supabase, SUPABASE_URL };

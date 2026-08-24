const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[DB] Connected to Supabase at:', supabaseUrl);
}

module.exports = { supabase };

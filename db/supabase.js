const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qnsioyfjrztapzmoamth.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuc2lveWZqcnp0YXB6bW9hbXRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU2NzA4NiwiZXhwIjoyMTAzMTQzMDg2fQ.3-yxcV9I4MsdwLhce927l4oSi44OvNJVdFPxUdH7HBg';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false
    }
});

/**
 * Generates the next unique member ID by counting existing rows in Supabase
 */
async function generateMemberId() {
    try {
        const { count, error } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('[SUPABASE] Error getting member count:', error.message);
            // Fallback random ID if count query fails
            const randomSuffix = Math.floor(10000 + Math.random() * 90000);
            return `MEM-${randomSuffix}`;
        }

        const nextNum = ((count || 0) + 1).toString().padStart(5, '0');
        return `MEM-${nextNum}`;
    } catch (err) {
        console.error('[SUPABASE] Exception in generateMemberId:', err.message);
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        return `MEM-${randomSuffix}`;
    }
}

module.exports = { supabase, generateMemberId };

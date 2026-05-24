require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    db: { schema: 'public' },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
        'apikey': process.env.SUPABASE_SECRET_KEY
      }
    }
  }
);

async function test() {
  console.log('Testing connection to:', process.env.SUPABASE_URL);
  console.log('Key starts with:', process.env.SUPABASE_SECRET_KEY?.substring(0, 20));

  const { data, error } = await supabase
    .from('permits')
    .insert({
      permit_number: 'TEST-001',
      address: '123 Main St',
      permit_type: 'Residential - New Construction',
      county: 'Hall',
      zip_code: '30501',
      date_filed: new Date().toISOString().split('T')[0],
      description: 'Test permit entry'
    })
    .select();

  if (error) {
    console.error('❌ Supabase error:', error.message);
    console.error('Error details:', error);
  } else {
    console.log('✅ Supabase connected! Test permit inserted:', data[0].id);
  }

  await supabase.from('permits').delete().eq('permit_number', 'TEST-001');
  console.log('✅ Test row cleaned up. You are ready for Week 2.');
}

test();
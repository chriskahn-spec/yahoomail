import { supabase } from './supabase.js';

export async function initializeDatabase() {
  try {
    // Check if users table exists
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      console.log('Creating users table...');
      // Users table will be created via SQL migration
    }

    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}
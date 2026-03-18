import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const testEmail = process.env.TEST_EMAIL;
const testPassword = process.env.TEST_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey || !testEmail || !testPassword) {
    throw new Error(
        'Missing env vars. Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD'
    );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('Logging in as:', testEmail);

    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
    });

    if (authErr) {
        console.error('Auth error:', authErr.message);
        return;
    }

    const user = authData.user;
    console.log('Auth user ID:', user?.id);

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

    console.log('Profile fetch result:', { data, error });

    await supabase.auth.signOut();
}

check().catch(console.error);
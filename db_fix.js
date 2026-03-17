const { Client } = require('pg');

const connectionString = 'postgresql://postgres.otphaldjdkbiinnaazfe:0918731411*Loi@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function fixDb() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to DB for fixing');

        // 1. Update the function to create 'client' profile AND 'clients' record
        await client.query(`
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS trigger
            LANGUAGE plpgsql
            SECURITY DEFINER SET search_path = public
            AS $$
            BEGIN
              -- Insert into profiles
              INSERT INTO public.profiles (id, email, role, full_name)
              VALUES (
                new.id, 
                new.email, 
                'client', 
                COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
              )
              ON CONFLICT (id) DO UPDATE SET role = 'client';

              -- Insert into clients
              INSERT INTO public.clients (user_id, email, full_name, status, source)
              VALUES (
                new.id, 
                new.email, 
                COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
                'prospect', 
                'self_registered'
              )
              ON CONFLICT (user_id) DO NOTHING;

              RETURN new;
            END;
            $$;
        `);
        console.log('Updated public.handle_new_user function');

        // 2. Re-create the trigger if it doesn't exist
        await client.query(`
            DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
            CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        `);
        console.log('Recreated trigger on_auth_user_created');

    } catch (err) {
        console.error('Error fixing DB:', err);
    } finally {
        await client.end();
    }
}

fixDb();

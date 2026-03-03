export function validateEnv() {
    const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'DIRECT_URL',
        'GOOGLE_CLIENT_EMAIL',
        'GOOGLE_PRIVATE_KEY',
        'GOOGLE_CALENDAR_ID',
        'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(
        (envVar) => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingEnvVars.join(', ')}. Please check your .env.local file.`
        );
    }
}

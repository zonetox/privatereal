import React from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements for executive atmosphere */}
            <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/5 blur-[120px] rounded-full -mr-[25vw] -mt-[25vw]" />
            <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-primary/5 blur-[100px] rounded-full -ml-[20vw] -mb-[20vw]" />

            <div className="relative w-full max-w-md z-10">
                <LoginForm />
            </div>

            {/* Minimalist footer */}
            <div className="absolute bottom-8 w-full text-center z-10">
                <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em]">
                    Private Real Estate Advisory Office • PREIO Infrastructure v2.1
                </p>
            </div>
        </div>
    );
}

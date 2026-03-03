'use client';

import React, { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { convertLeadToClientAction } from '@/app/actions/conversion';
import { useRouter } from '@/navigation';

interface ConvertButtonProps {
    leadId: string;
    leadName: string;
    disabled?: boolean;
}

export default function ConvertLeadButton({ leadId, leadName, disabled }: ConvertButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleConvert = async () => {
        if (!confirm(`Are you sure you want to convert ${leadName} to a Client? This will create a new user account.`)) {
            return;
        }

        setLoading(true);
        const result = await convertLeadToClientAction(leadId);
        setLoading(false);

        if (result.success) {
            alert(`Success! ${leadName} is now a Client.\nTemporary Password: ${result.tempPassword}\n(Please inform the client to change this upon first login)`);
            router.refresh();
        } else {
            alert(result.error || 'Conversion failed');
        }
    };

    return (
        <button
            onClick={handleConvert}
            disabled={loading || disabled}
            title="Convert to Client"
            className="p-2 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors disabled:opacity-30 flex items-center gap-1"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        </button>
    );
}

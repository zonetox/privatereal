'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateLeadScore, BudgetRange, CashflowRange, Occupation, Objective } from '@/lib/scoring';
import { revalidatePath } from 'next/cache';
import { checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export interface LeadSubmissionData {
    fullName: string;
    email: string;
    phone: string;
    capital: BudgetRange;
    cashflow: CashflowRange;
    occupation: Occupation;
    objective: Objective;
    tracking: {
        utm_source: string | null;
        utm_campaign: string | null;
        referrer: string;
    };
    honeypot: string;
}

export async function submitLeadAction(formData: LeadSubmissionData) {
    // 1. Honeypot check
    if (formData.honeypot) {
        return { success: false, error: 'Spam detected' };
    }

    // 2. Rate limit check
    const forwarded = headers().get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';

    if (!checkRateLimit(ip)) {
        return { success: false, error: 'Too many requests. Please try again later.' };
    }

    const supabase = createClient();

    const { score, status } = calculateLeadScore(
        formData.capital,
        formData.cashflow,
        formData.occupation,
        formData.objective
    );

    const { data, error } = await supabase
        .from('leads')
        .insert([
            {
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                capital_range: formData.capital,
                monthly_cashflow_range: formData.cashflow,
                occupation: formData.occupation,
                objective: formData.objective,
                lead_score: score,
                status: status,
                source: JSON.stringify(formData.tracking)
            }
        ])
        .select();

    if (error) {
        console.error('Submission error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/leads');
    return {
        success: true,
        lead: data ? data[0] : null,
        isQualified: status === 'qualified'
    };
}

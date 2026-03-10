'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface ClientProfileData {
    liquid_capital?: number;
    annual_business_revenue?: number;
    debt_obligations?: number;
    real_estate_allocation_percent?: number;
    max_drawdown_percent: string | number;
    liquidity_preference: string;
    crash_reaction: string;
    leverage_preference: string;
    investment_horizon?: string;
    target_annual_return?: number;
    succession_planning?: boolean;
    international_exposure_interest?: boolean;
    decision_style: string;
}

export async function updateClientProfileAction(clientId: string, data: ClientProfileData) {
    const supabase = createClient();

    // 1. Admin Verification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Unauthorized. Admin access only.' };
    }

    // 2. Data Sanitization (basic)
    const updateData = {
        liquid_capital: data.liquid_capital || 0,
        annual_business_revenue: data.annual_business_revenue || 0,
        debt_obligations: data.debt_obligations || 0,
        real_estate_allocation_percent: data.real_estate_allocation_percent || 0,

        max_drawdown_percent: parseInt(data.max_drawdown_percent.toString()) || 0,
        liquidity_preference: data.liquidity_preference,
        crash_reaction: data.crash_reaction,
        leverage_preference: data.leverage_preference,
        investment_horizon: data.investment_horizon,

        target_annual_return: data.target_annual_return || 0,
        succession_planning: !!data.succession_planning,
        international_exposure_interest: !!data.international_exposure_interest,
        decision_style: data.decision_style
    };

    // 3. Update Domain Tables (Normalized)
    await Promise.all([
        supabase.from('client_financials').upsert({
            client_id: clientId,
            liquid_capital: updateData.liquid_capital,
            annual_business_revenue: updateData.annual_business_revenue,
            debt_obligations: updateData.debt_obligations,
            real_estate_allocation_percent: updateData.real_estate_allocation_percent
        }),
        supabase.from('client_preferences').upsert({
            client_id: clientId,
            risk_score: 0, // Will be updated by trigger on clients table for now
            risk_profile: data.liquidity_preference === 'high' ? 'conservative' : 'balanced', // Placeholder logic if needed, but trigger on clients is primary
            investment_horizon: data.investment_horizon,
            liquidity_preference: updateData.liquidity_preference,
            leverage_preference: updateData.leverage_preference,
            target_annual_return: updateData.target_annual_return,
            crash_reaction: updateData.crash_reaction,
            decision_style: updateData.decision_style
        }),
        supabase.from('client_priorities').upsert({
            client_id: clientId,
            succession_planning: updateData.succession_planning,
            international_exposure_interest: updateData.international_exposure_interest,
            max_drawdown_percent: updateData.max_drawdown_percent
        })
    ]);

    // 4. Update Main Client Table (Maintains risk scoring & backward compatibility)
    const { data: updatedClient, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', clientId)
        .select('risk_score, risk_profile')
        .single();

    if (error) {
        console.error('Update client profile failed:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/clients/${clientId}/profile`);
    revalidatePath(`/dashboard/clients`);

    return {
        success: true,
        risk_score: updatedClient.risk_score,
        risk_profile: updatedClient.risk_profile
    };
}

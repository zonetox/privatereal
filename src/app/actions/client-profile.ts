'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface ClientProfileData {
    full_name?: string;
    phone?: string;
    email?: string;
    liquid_capital?: number;
    annual_business_revenue?: number;
    debt_obligations?: number;
    real_estate_allocation_percent?: number;
    budget_range?: string;
    
    max_drawdown_percent?: string | number;
    liquidity_preference?: string;
    crash_reaction?: string;
    leverage_preference?: string;
    investment_horizon?: string;
    target_annual_return?: number;
    succession_planning?: boolean;
    international_exposure_interest?: boolean;
    decision_style?: string;
    
    purchase_goal?: string;
    preferred_locations?: string[];
    holding_period?: string;
    risk_tolerance?: string;

    // Restricted fields (Advisors only)
    analyst_confidence?: number;
    risk_score?: number;
    advisor_notes?: string;
    internal_tags?: string[];
}

export async function updateClientProfileAction(clientId: string, data: ClientProfileData) {
    const supabase = createClient();

    // 1. User Identity & Role Verification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.role === 'admin';
    const isClient = profile?.role === 'client' || profile?.role === 'pending';

    if (!isAdmin && !isClient) {
        return { success: false, error: 'Access denied. Invalid role.' };
    }

    // 2. Ownership Check (for non-admins)
    if (!isAdmin) {
        const { data: targetClient } = await supabase
            .from('clients')
            .select('user_id')
            .eq('id', clientId)
            .single();

        if (targetClient?.user_id !== user.id) {
            return { success: false, error: 'Access denied. You can only update your own profile.' };
        }
    }

    // 3. Data Sanitization & Whitelisting based on Role
    let updateData: any = {};

    if (isAdmin) {
        // Admins can update everything
        updateData = {
            full_name: data.full_name,
            phone: data.phone,
            liquid_capital: data.liquid_capital || 0,
            annual_business_revenue: data.annual_business_revenue || 0,
            debt_obligations: data.debt_obligations || 0,
            real_estate_allocation_percent: data.real_estate_allocation_percent || 0,
            max_drawdown_percent: parseInt(data.max_drawdown_percent?.toString() || '0') || 0,
            liquidity_preference: data.liquidity_preference,
            crash_reaction: data.crash_reaction,
            leverage_preference: data.leverage_preference,
            investment_horizon: data.investment_horizon,
            target_annual_return: data.target_annual_return || 0,
            succession_planning: !!data.succession_planning,
            international_exposure_interest: !!data.international_exposure_interest,
            decision_style: data.decision_style,
            purchase_goal: data.purchase_goal,
            preferred_locations: data.preferred_locations,
            holding_period: data.holding_period,
            risk_tolerance: data.risk_tolerance,
            budget_range: data.budget_range,
            // Restricted fields allowed for Admins
            analyst_confidence: data.analyst_confidence,
            risk_score: data.risk_score,
            advisor_notes: data.advisor_notes,
            internal_tags: data.internal_tags
        };
    } else {
        // Clients can update their own personal info and specific advisory fields
        updateData = {
            full_name: data.full_name,
            phone: data.phone,
            purchase_goal: data.purchase_goal,
            budget_range: data.budget_range,
            preferred_locations: data.preferred_locations,
            holding_period: data.holding_period,
            risk_tolerance: data.risk_tolerance,
            investment_horizon: data.investment_horizon // Required for calculation alignment
        };
    }

    // 4. Update Domain Tables (Normalized)
    // Only update financials if provided (Admins or if Client is allowed to update budget)
    if (updateData.budget_range !== undefined || isAdmin) {
        await supabase.from('client_financials').upsert({
            client_id: clientId,
            liquid_capital: updateData.liquid_capital || 0,
            annual_business_revenue: updateData.annual_business_revenue || 0,
            debt_obligations: updateData.debt_obligations || 0,
            real_estate_allocation_percent: updateData.real_estate_allocation_percent || 0,
            budget_range: updateData.budget_range
        });
    }

    await supabase.from('client_preferences').upsert({
        client_id: clientId,
        investment_horizon: updateData.investment_horizon,
        liquidity_preference: updateData.liquidity_preference,
        leverage_preference: updateData.leverage_preference,
        target_annual_return: updateData.target_annual_return,
        crash_reaction: updateData.crash_reaction,
        decision_style: updateData.decision_style,
        purchase_goal: updateData.purchase_goal,
        preferred_locations: updateData.preferred_locations,
        holding_period: updateData.holding_period,
        risk_tolerance: updateData.risk_tolerance
    });

    if (isAdmin) {
        await supabase.from('client_priorities').upsert({
            client_id: clientId,
            succession_planning: updateData.succession_planning,
            international_exposure_interest: updateData.international_exposure_interest,
            max_drawdown_percent: updateData.max_drawdown_percent
        });
    }

    // 5. Update Main Client Table
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
    revalidatePath(`/dashboard`); // Refresh client-side dash

    return {
        success: true,
        risk_score: updatedClient?.risk_score,
        risk_profile: updatedClient?.risk_profile
    };
}

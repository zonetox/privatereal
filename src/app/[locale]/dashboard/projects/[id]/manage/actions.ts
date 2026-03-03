'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProjectAction(projectId: string, formData: FormData) {
    const supabase = createClient();

    // Security: verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthenticated');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') throw new Error('Access denied');

    // 3. Prepare update data
    const updateData: Record<string, string | number | boolean | null> = {
        name: formData.get('name') as string,
        location: formData.get('location') as string,
        developer: formData.get('developer') as string,
        property_type: formData.get('property_type') as string,
        target_segment: formData.get('target_segment') as string,
        launch_year: formData.get('launch_year') ? parseInt(formData.get('launch_year') as string) : null,
        legal_score: formData.get('legal_score') ? parseInt(formData.get('legal_score') as string) : null,
        location_score: formData.get('location_score') ? parseInt(formData.get('location_score') as string) : null,
        infrastructure_score: formData.get('infrastructure_score') ? parseInt(formData.get('infrastructure_score') as string) : null,
        liquidity_score: formData.get('liquidity_score') ? parseInt(formData.get('liquidity_score') as string) : null,
        growth_score: formData.get('growth_score') ? parseInt(formData.get('growth_score') as string) : null,
        risk_score: formData.get('risk_score') ? parseInt(formData.get('risk_score') as string) : null,
        status: formData.get('status') as string,
        visible_to_clients: formData.get('visible_to_clients') === 'true',
        analyst_confidence_level: formData.get('analyst_confidence_level') ? parseInt(formData.get('analyst_confidence_level') as string) : null,
        evaluation_notes: formData.get('evaluation_notes') as string,
        legal_notes: formData.get('legal_notes') as string,
        risk_notes: formData.get('risk_notes') as string,
    };

    // 4. Validation: If publishing, check data completeness
    if (updateData.visible_to_clients === true) {
        // We perform the check against the compiled updateData which will be saved.
        const requiredFields = [
            'legal_score', 'location_score', 'infrastructure_score', 'liquidity_score',
            'growth_score', 'risk_score', 'analyst_confidence_level'
        ];

        const missingFields = requiredFields.filter(f => updateData[f] === null);
        if (missingFields.length > 0) {
            return { success: false, error: "Project incomplete. All intelligence scores and analyst confidence must be populated before publication." };
        }
    }

    // 5. Execute update
    const { error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    revalidatePath(`/[locale]/dashboard/projects/${projectId}/manage`, 'page');
    revalidatePath(`/[locale]/dashboard/recommendations`, 'page');

    return { success: true };
}

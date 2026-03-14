'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function togglePublishAction(projectId: string, currentVisibility: boolean, formData: FormData) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthenticated');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        throw new Error('Access denied');
    }

    const newVisibility = !currentVisibility;

    // If publishing (toggling ON), validate project completeness first
    if (newVisibility === true) {
        const { data: isValid } = await supabase.rpc('validate_project_for_publish', {
            p_project_id: projectId,
        });

        if (!isValid) {
            throw new Error(
                'Dự án chưa đủ dữ liệu để xuất bản. Vui lòng điền đủ điểm số và thông tin tư vấn trước khi publish.'
            );
        }
    }

    const { error } = await supabase
        .from('projects')
        .update({ visible_to_clients: newVisibility })
        .eq('id', projectId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/[locale]/dashboard/projects', 'page');
    revalidatePath('/[locale]/dashboard/recommendations', 'page');
}

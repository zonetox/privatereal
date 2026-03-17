'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Save, BadgeCheck, MapPin, BarChart3, ShieldAlert, BookOpen } from 'lucide-react';
import { updateProjectAction } from '@/app/[locale]/dashboard/projects/[id]/manage/actions';
import { useRouter } from '@/navigation';

interface ProjectIntakeFormProps {
    project: any;
    locale: string;
}

export default function ProjectIntakeForm({ project, locale }: ProjectIntakeFormProps) {
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const sections = [
        { id: 1, title: 'Thông tin cơ bản', icon: <BadgeCheck size={18} /> },
        { id: 2, title: 'Phân tích vị trí', icon: <MapPin size={18} /> },
        { id: 3, title: 'Bối cảnh thị trường', icon: <BarChart3 size={18} /> },
        { id: 4, title: 'Rủi ro', icon: <ShieldAlert size={18} /> },
        { id: 5, title: 'Nhận xét tư vấn', icon: <BookOpen size={18} /> },
    ];

    async function handleSubmit(formData: FormData) {
        setIsSaving(true);
        setMessage(null);

        // 1. Client-side score validation (0-100)
        const scoreFields = [
            'location_score', 'infrastructure_score', 'liquidity_score', 
            'growth_score', 'legal_score', 'risk_score', 'analyst_confidence_level'
        ];
        
        for (const field of scoreFields) {
            const val = formData.get(field);
            if (val !== null && val !== '') {
                const num = parseInt(val as string);
                if (num < 0 || num > 100) {
                    setMessage({ type: 'error', text: `Lỗi: Điểm số "${field.replace('_', ' ')}" phải nằm trong khoảng 0-100.` });
                    setIsSaving(false);
                    return;
                }
            }
        }

        try {
            const result = await updateProjectAction(project.id, formData);
            if (result?.success) {
                setMessage({ type: 'success', text: 'Dữ liệu tư vấn đã được lưu thành công.' });
                router.refresh();
            } else {
                setMessage({ type: 'error', text: result?.error || 'Không thể cập nhật dự án.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Đã xảy ra lỗi không mong muốn.' });
        } finally {
            setIsSaving(false);
        }
    }

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="space-y-8">
            {/* Step Navigation */}
            {/* Step Navigation */}
            <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl -mx-4 px-4 py-4 md:static md:bg-transparent md:backdrop-blur-none md:p-0 border-b border-white/5 md:border-0 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 md:grid md:grid-cols-5 md:gap-4">
                    {sections.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setStep(s.id)}
                            className={`flex flex-row md:flex-row items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all flex-shrink-0 md:flex-shrink-1 ${
                                step === s.id 
                                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' 
                                : 'bg-slate-900/40 border-white/5 text-slate-500 hover:bg-slate-800/40'
                            }`}
                        >
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${step === s.id ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                                {s.icon}
                            </div>
                            <div className="text-left">
                                <p className="text-[8px] md:text-[9px] uppercase tracking-widest font-bold opacity-60">Bước 0{s.id}</p>
                                <p className="text-[10px] md:text-xs font-bold whitespace-nowrap">{s.title}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest border animate-in fade-in slide-in-from-top-2 ${
                    message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                }`}>
                    {message.text}
                </div>
            )}

            <form action={handleSubmit} className="space-y-8 pb-24">
                {/* BƯỚC 1 — THÔNG TIN DỰ ÁN */}
                {step === 1 && (
                    <div className="glass p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 space-y-5 md:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-white/5 pb-4">
                            <h1 className="text-2xl md:text-3xl font-black gold-text-gradient uppercase tracking-tighter">Bước 1 — Thông tin dự án</h1>
                            <p className="text-[11px] md:text-sm text-slate-500 font-medium tracking-widest mt-1">ĐỊNH DANH DỰ ÁN — PREIO ELITE</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <FormLabel label="Tên dự án" />
                                <input name="name" defaultValue={project.name} className="form-input" placeholder="VD: Grand Marina Saigon" />
                            </div>
                            <div>
                                <FormLabel label="Chủ đầu tư" />
                                <input name="developer" defaultValue={project.developer} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Loại hình dự án" />
                                <select name="property_type" defaultValue={project.property_type || ''} className="form-input">
                                    <option value="apartment">Căn hộ Hạng sang</option>
                                    <option value="mid_apartment">Căn hộ Cao cấp</option>
                                    <option value="townhouse">Nhà phố</option>
                                    <option value="villa">Biệt thự</option>
                                    <option value="resort">BĐS Nghỉ dưỡng</option>
                                    <option value="land">Đất nền</option>
                                    <option value="mixed_use">Phức hợp</option>
                                </select>
                            </div>
                            <div>
                                <FormLabel label="Phân khúc / Nhóm khách phù hợp" />
                                <select name="target_segment" defaultValue={project.target_segment || ''} className="form-input">
                                    <option value="mass">Đại chúng (Mass)</option>
                                    <option value="mid">Trung cấp</option>
                                    <option value="high_end">Cao cấp</option>
                                    <option value="luxury">Hạng sang (Ultra-Luxury)</option>
                                </select>
                            </div>
                            <div>
                                <FormLabel label="Năm bàn giao / Giai đoạn" />
                                <input name="launch_year" type="number" defaultValue={project.launch_year} className="form-input" placeholder="VD: 2026" />
                            </div>
                            <div>
                                <FormLabel label="Trạng thái" />
                                <select name="status" defaultValue={project.status || 'draft'} className="form-input">
                                    <option value="draft">Bản nháp (Internal)</option>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="archived">Lưu trữ</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* BƯỚC 2 — VỊ TRÍ & KHU VỰC */}
                {step === 2 && (
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-white/5 pb-4">
                            <h2 className="text-xl font-bold text-slate-200">Bước 2 — Vị trí & Khu vực</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Đánh giá chiến lược địa lý</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <FormLabel label="Khu vực / Địa điểm" />
                                <input name="location" defaultValue={project.location} className="form-input" placeholder="VD: Quận 1, TP. HCM" />
                            </div>
                            <div>
                                <FormLabel label="Khoảng cách trung tâm (km)" />
                                <input name="distance_to_cbd" type="number" step="0.1" defaultValue={project.distance_to_cbd} className="form-input" />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel label="Hạ tầng giao thông" />
                                <textarea name="market_trend_notes" defaultValue={project.market_trend_notes} rows={3} className="form-input" placeholder="Kết nối cao tốc, metro, các tuyến đường chính..." />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel label="Tiện ích xung quanh" />
                                <textarea name="amenities" defaultValue={project.amenities} rows={3} className="form-input" placeholder="Trường học, bệnh viện, TTTM, công viên..." />
                            </div>
                            <div className="border-t border-white/5 pt-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <FormLabel label="infrastructure_score (0-100)" />
                                    <input name="infrastructure_score" type="number" min="0" max="100" defaultValue={project.infrastructure_score} className="form-input" required />
                                </div>
                                <div>
                                    <FormLabel label="location_score (0-100)" />
                                    <input name="location_score" type="number" min="0" max="100" defaultValue={project.location_score} className="form-input" required />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BƯỚC 3 — BỐI CẢNH THỊ TRƯỜNG */}
                {step === 3 && (
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-white/5 pb-4">
                            <h2 className="text-xl font-bold text-slate-200">Bước 3 — Bối cảnh thị trường</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Giá trị so sánh và nguồn cung khu vực</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <FormLabel label="Giá tham chiếu / Giá khu vực (m²/VND)" />
                                <input name="regional_avg_price" type="number" defaultValue={project.regional_avg_price} className="form-input" placeholder="VD: 85000000" />
                            </div>
                            <div>
                                <FormLabel label="Giá dự án tối thiểu (VND)" />
                                <input name="min_unit_price" type="number" defaultValue={project.min_unit_price} className="form-input" placeholder="VD: 5000000000" />
                            </div>
                            <div>
                                <FormLabel label="Nhu cầu thuê" />
                                <select name="rental_demand" defaultValue={project.rental_demand || 'medium'} className="form-input">
                                    <option value="low">Thấp</option>
                                    <option value="medium">Trung bình</option>
                                    <option value="high">Cao</option>
                                </select>
                            </div>
                            <div>
                                <FormLabel label="Thanh khoản / Nguồn cung" />
                                <select name="supply_level" defaultValue={project.supply_level || 'medium'} className="form-input">
                                    <option value="low">Thấp / Cân bằng</option>
                                    <option value="medium">Trung bình</option>
                                    <option value="high">Dư thừa / Cạnh tranh cao</option>
                                </select>
                            </div>
                            <div>
                                <FormLabel label="Tiềm năng tăng trưởng (%)" />
                                <input name="expected_growth_rate" type="number" step="0.1" defaultValue={project.expected_growth_rate} className="form-input" />
                            </div>
                            <div className="border-t border-white/5 pt-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <FormLabel label="liquidity_score (0-100)" />
                                    <input name="liquidity_score" type="number" min="0" max="100" defaultValue={project.liquidity_score} className="form-input" required />
                                </div>
                                <div>
                                    <FormLabel label="growth_score (0-100)" />
                                    <input name="growth_score" type="number" min="0" max="100" defaultValue={project.growth_score} className="form-input" required />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BƯỚC 4 — RỦI RO & PHÁP LÝ */}
                {step === 4 && (
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-white/5 pb-4">
                            <h2 className="text-xl font-bold text-slate-200">Bước 4 — Rủi ro & Pháp lý</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Kiểm soát rủi ro và minh bạch pháp lý</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <FormLabel label="legal_notes (Pháp lý chi tiết)" />
                                <textarea name="legal_notes" defaultValue={project.legal_notes} rows={2} className="form-input" placeholder="Phê duyệt 1/500, Giấy phép xây dựng..." />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel label="risk_notes (Tiến độ & Rủi ro nguồn cung)" />
                                <textarea name="risk_notes" defaultValue={project.risk_notes} rows={2} className="form-input" placeholder="Rủi ro nguồn cung tương lai, Lãi suất, Tiến độ..." />
                            </div>
                            <div>
                                <FormLabel label="Tiến độ xây dựng thực tế" />
                                <input name="construction_status" defaultValue={project.construction_status} className="form-input" placeholder="VD: Đang làm móng" />
                            </div>
                            <div>
                                <FormLabel label="downside_risk_percent (%)" />
                                <input name="downside_risk_percent" type="number" step="0.1" defaultValue={project.downside_risk_percent} className="form-input" required />
                            </div>
                            <div className="border-t border-white/5 pt-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <FormLabel label="legal_score (0-100)" />
                                    <input name="legal_score" type="number" min="0" max="100" defaultValue={project.legal_score} className="form-input" required />
                                </div>
                                <div>
                                    <FormLabel label="risk_score (0-100)" />
                                    <input name="risk_score" type="number" min="0" max="100" defaultValue={project.risk_score} className="form-input" required />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BƯỚC 5 — GHI CHÚ TƯ VẤN */}
                {step === 5 && (
                    <div className="glass p-8 rounded-3xl border border-yellow-500/10 border-yellow-500/20 bg-yellow-500/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-yellow-500/10 pb-4">
                            <h2 className="text-xl font-bold text-yellow-500">Bước 5 — Ghi chú tư vấn</h2>
                            <p className="text-xs text-yellow-600/70 mt-1 uppercase tracking-widest">Advisory Insights & Publication</p>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <FormLabel label="evaluation_notes (Vì sao đáng quan tâm?)" />
                                <textarea name="evaluation_notes" defaultValue={project.evaluation_notes} rows={4} className="form-input !bg-slate-900" placeholder="Lý do đầu tư cốt lõi..." />
                            </div>
                            <div>
                                <FormLabel label="buyer_suitability (Phù hợp với ai?)" />
                                <textarea name="buyer_suitability" defaultValue={project.buyer_suitability} rows={3} className="form-input !bg-slate-900" />
                            </div>
                            <div>
                                <FormLabel label="not_suitable_for (KHÔNG phù hợp với ai?)" />
                                <textarea name="not_suitable_for" defaultValue={project.not_suitable_for} rows={2} className="form-input !bg-slate-900" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <FormLabel label="analyst_confidence_level (0-100)" />
                                    <input name="analyst_confidence_level" type="number" min="0" max="100" defaultValue={project.analyst_confidence_level} className="form-input !bg-slate-900" />
                                </div>
                                <div>
                                    <FormLabel label="visible_to_clients (Trạng thái xuất bản)" />
                                    <select name="visible_to_clients" defaultValue={project.visible_to_clients ? 'true' : 'false'} className="form-input !bg-slate-900 font-bold">
                                        <option value="false">🔒 Nội bộ</option>
                                        <option value="true">🌐 Xuất bản cho khách</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 z-50">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 1}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} /> <span className="hidden xs:inline">Quay lại</span>
                            </button>
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={step === 5}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-30 transition-all"
                            >
                                <span className="hidden xs:inline">Tiếp tục</span> <ChevronRight size={16} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 md:px-10 py-3 md:py-3 rounded-xl bg-yellow-500 text-slate-950 text-[11px] md:text-xs font-black uppercase tracking-[0.2em] hover:bg-yellow-400 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-yellow-500/20"
                        >
                            {isSaving ? 'Đang lưu...' : <><Save size={16} /><span className="inline md:hidden">Lưu</span><span className="hidden md:inline">Lưu Thông tin Tư vấn</span></>}
                        </button>
                    </div>
                </div>
            </form>

            <style jsx>{`
                .form-input {
                    display: block;
                    width: 100%;
                    background-color: rgba(15, 23, 42, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    font-size: 0.875rem;
                    color: #f1f5f9;
                    transition: all 0.2s;
                }
                .form-input:focus {
                    outline: none;
                    border-color: rgba(234, 179, 8, 0.3);
                    background-color: rgba(15, 23, 42, 0.6);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

function FormLabel({ label }: { label: string }) {
    return (
        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
            {label}
        </label>
    );
}

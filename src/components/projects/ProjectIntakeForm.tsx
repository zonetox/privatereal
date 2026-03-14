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
        { id: 1, title: 'Định danh Dự án', icon: <BadgeCheck size={18} /> },
        { id: 2, title: 'Vị trí & Khu vực', icon: <MapPin size={18} /> },
        { id: 3, title: 'Bối cảnh Thị trường', icon: <BarChart3 size={18} /> },
        { id: 4, title: 'Kiểm soát Rủi ro', icon: <ShieldAlert size={18} /> },
        { id: 5, title: 'Ý kiến Chuyên gia', icon: <BookOpen size={18} /> },
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
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 no-scrollbar">
                {sections.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setStep(s.id)}
                        className={`flex-1 min-w-[140px] flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                            step === s.id 
                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' 
                            : 'bg-slate-900/40 border-white/5 text-slate-500 hover:bg-slate-800/40'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${step === s.id ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            {s.icon}
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Bước 0{s.id}</p>
                            <p className="text-xs font-bold whitespace-nowrap">{s.title}</p>
                        </div>
                    </button>
                ))}
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest border animate-in fade-in slide-in-from-top-2 ${
                    message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                }`}>
                    {message.text}
                </div>
            )}

            <form action={handleSubmit} className="space-y-8 pb-24">
                {/* STEP 1 — IDENTITY */}
                {step === 1 && (
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-white/5 pb-4">
                            <h1 className="text-4xl font-black gold-text-gradient uppercase tracking-tighter">Nhập liệu Tư vấn Dự án</h1>
                        <p className="text-slate-500 text-sm font-medium tracking-widest mt-1">KHÓA DỮ LIỆU CHIẾN LƯỢC — PREIO ELITE</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <FormLabel label="Tên Dự án" />
                                <input name="name" defaultValue={project.name} className="form-input" placeholder="VD: Grand Marina Saigon" />
                            </div>
                            <div>
                                <FormLabel label="Chủ đầu tư" />
                                <input name="developer" defaultValue={project.developer} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Loại hình BĐS" />
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
                                <FormLabel label="Phân khúc Mục tiêu" />
                                <select name="target_segment" defaultValue={project.target_segment || ''} className="form-input">
                                    <option value="mass">Đại chúng (Mass)</option>
                                    <option value="mid">Trung cấp</option>
                                    <option value="high_end">Cao cấp</option>
                                    <option value="luxury">Hạng sang (Ultra-Luxury)</option>
                                </select>
                            </div>
                            <div>
                                <FormLabel label="Năm Khởi công/Bàn giao" />
                                <input name="launch_year" type="number" defaultValue={project.launch_year} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Trạng thái Hệ thống" />
                                <select name="status" defaultValue={project.status || 'draft'} className="form-input">
                                    <option value="draft">Bản nháp (Internal)</option>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="archived">Lưu trữ</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2 — LOCATION */}
                {step === 2 && (
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-white/5 pb-4">
                            <h2 className="text-xl font-bold text-slate-200">Bước 2 — Phân tích Vị trí & Khu vực</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Đánh giá chiến lược địa lý</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <FormLabel label="Địa chỉ Chính của Dự án" />
                                <input name="location" defaultValue={project.location} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Khoảng cách tới trung tâm (km)" />
                                <input name="distance_to_cbd" type="number" step="0.1" defaultValue={project.distance_to_cbd} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Điểm Hạ tầng Tuyến tính (0-100) *" />
                                <input name="infrastructure_score" type="number" min="0" max="100" defaultValue={project.infrastructure_score} className="form-input" required />
                            </div>
                            <div>
                                <FormLabel label="Điểm Vị trí Chiến lược (0-100) *" />
                                <input name="location_score" type="number" min="0" max="100" defaultValue={project.location_score} className="form-input" required />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel label="Điểm nhấn Phát triển Khu vực" />
                                <textarea name="market_trend_notes" defaultValue={project.market_trend_notes} rows={4} className="form-input" placeholder="Hạ tầng lân cận, kết nối giao thông, tiện ích ngoại khu..." />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3 — MARKET */}
                {step === 3 && (
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-white/5 pb-4">
                            <h2 className="text-xl font-bold text-slate-200">Bước 3 — Bối cảnh Thị trường Tư vấn</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Giá trị so sánh và các chỉ số phù hợp</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <FormLabel label="Giá trung bình trên m² (VNĐ/USD)" />
                                <input name="price_per_m2" type="number" defaultValue={project.price_per_m2} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Giá căn hộ tối thiểu (VND) ★" />
                                <input name="min_unit_price" type="number" defaultValue={project.min_unit_price} className="form-input" placeholder="VD: 3000000000" />
                                <p className="text-[9px] text-yellow-600/70 mt-1 uppercase tracking-widest font-bold">★ Dùng cho tính toán Budget Alignment</p>
                            </div>
                            <div>
                                <FormLabel label="Tỷ suất cho thuê mục tiêu (%)" />
                                <input name="avg_rental_yield" type="number" step="0.1" defaultValue={project.avg_rental_yield} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Tăng trưởng giá kỳ vọng (% năm)" />
                                <input name="expected_growth_rate" type="number" step="0.1" defaultValue={project.expected_growth_rate} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Thời gian nắm giữ khuyến nghị (Năm)" />
                                <input name="holding_period_recommendation" type="number" defaultValue={project.holding_period_recommendation} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Chỉ số Thanh khoản Dự kiến (0-100) *" />
                                <input name="liquidity_score" type="number" min="0" max="100" defaultValue={project.liquidity_score} className="form-input" required />
                            </div>
                            <div>
                                <FormLabel label="Điểm Tăng trưởng Vốn (0-100) *" />
                                <input name="growth_score" type="number" min="0" max="100" defaultValue={project.growth_score} className="form-input" required />
                            </div>
                            <div>
                                <FormLabel label="Mức độ Nhu cầu Thuê" />
                                <select name="rental_demand" defaultValue={project.rental_demand || 'medium'} className="form-input">
                                    <option value="low">Thấp</option>
                                    <option value="medium">Bình thường</option>
                                    <option value="high">Cao</option>
                                </select>
                            </div>
                            <div>
                                <FormLabel label="Mức độ Cung trong Khu vực" />
                                <select name="supply_level" defaultValue={project.supply_level || 'medium'} className="form-input">
                                    <option value="low">Cân bằng / Thấp</option>
                                    <option value="medium">Trung bình</option>
                                    <option value="high">Rủi ro Thừa cung</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4 — RISK */}
                {step === 4 && (
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-white/5 pb-4">
                            <h2 className="text-xl font-bold text-slate-200">Bước 4 — Kiểm soát Rủi ro Chiến lược</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Sự minh bạch và các lưu ý tư vấn quan trọng</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <FormLabel label="Điểm Khung Pháp lý (0-100) *" />
                                <input name="legal_score" type="number" min="0" max="100" defaultValue={project.legal_score} className="form-input" required />
                            </div>
                            <div>
                                <FormLabel label="Chỉ số Rủi ro Tổng thể (0-100) *" />
                                <input name="risk_score" type="number" min="0" max="100" defaultValue={project.risk_score} className="form-input" required />
                            </div>
                            <div>
                                <FormLabel label="Xác suất Rủi ro Giảm giá (%) *" />
                                <input name="downside_risk_percent" type="number" step="0.1" min="0" max="100" defaultValue={project.downside_risk_percent} className="form-input" required />
                            </div>
                            <div>
                                <FormLabel label="Trạng thái Xây dựng" />
                                <input name="construction_status" defaultValue={project.construction_status} className="form-input" placeholder="Tình trạng giấy phép, số tầng hiện tại..." />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel label="Ghi chú Pháp lý Chi tiết" />
                                <textarea name="legal_notes" defaultValue={project.legal_notes} rows={2} className="form-input" placeholder="Phê duyệt 1/500, Giấy phép xây dựng, Hợp đồng mua bán..." />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel label="Rủi ro Thị trường & Cảnh báo" />
                                <textarea name="key_concerns" defaultValue={project.key_concerns} rows={3} className="form-input" placeholder="Rủi ro nguồn cung, lãi suất, hoặc lịch sử chủ đầu tư..." />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel label="Chiến lược Giảm thiểu Rủi ro" />
                                <textarea name="risk_notes" defaultValue={project.risk_notes} rows={2} className="form-input" placeholder="Các giải pháp bảo vệ nhà đầu tư..." />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5 — ADVISORY */}
                {step === 5 && (
                    <div className="glass p-8 rounded-3xl border border-yellow-500/10 border-yellow-500/20 bg-yellow-500/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-yellow-500/10 pb-4">
                            <h2 className="text-xl font-bold text-yellow-500">Bước 5 — Luận điểm Chuyên gia Broker</h2>
                            <p className="text-xs text-yellow-600/70 mt-1 uppercase tracking-widest">The Advisor Edge — Thông tin chuyên môn độc quyền</p>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <FormLabel label="Đối tượng Phù hợp Chiến lược (Khách hàng mục tiêu là ai?)" />
                                <textarea name="buyer_suitability" defaultValue={project.buyer_suitability} rows={3} className="form-input !bg-slate-900" />
                            </div>
                            <div>
                                <FormLabel label="Dự án này KHÔNG phù hợp với ai?" />
                                <textarea name="not_suitable_for" defaultValue={project.not_suitable_for} rows={2} className="form-input !bg-slate-900" />
                            </div>
                            <div>
                                <FormLabel label="Ưu điểm Vượt trội (Key Advantages)" />
                                <textarea 
                                    name="key_advantages" 
                                    defaultValue={Array.isArray(project.key_advantages) ? project.key_advantages.join('\n') : (project.key_advantages || '')} 
                                    rows={3} 
                                    className="form-input !bg-slate-900" 
                                />
                            </div>
                            <div>
                                <FormLabel label="Luận điểm Đầu tư chính (Investment Thesis)" />
                                <textarea name="evaluation_notes" defaultValue={project.evaluation_notes} rows={4} className="form-input !bg-slate-900" placeholder="Tổng hợp phân tích chuyên gia cho dự án này..." />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <FormLabel label="Mức độ Tự tin của Chuyên gia (0-100) *" />
                                    <input name="analyst_confidence_level" type="number" min="0" max="100" defaultValue={project.analyst_confidence_level} className="form-input !bg-slate-900" required />
                                </div>
                                <div>
                                    <FormLabel label="Trạng thái Hiển thị trên Cổng Thông tin" />
                                    <select name="visible_to_clients" defaultValue={project.visible_to_clients ? 'true' : 'false'} className="form-input !bg-slate-900 font-bold">
                                        <option value="false">🔒 Ẩn (Nội bộ)</option>
                                        <option value="true">🌐 Xuất bản cho Khách hàng</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 z-50">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 1}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} /> Quay lại
                            </button>
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={step === 5}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-30 transition-all"
                            >
                                Tiếp tục <ChevronRight size={16} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-10 py-3 rounded-xl bg-yellow-500 text-slate-950 text-xs font-black uppercase tracking-[0.2em] hover:bg-yellow-400 hover:scale-[1.05] active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-yellow-500/20"
                        >
                            {isSaving ? 'Đang lưu...' : <><Save size={16} /> Lưu Thông tin Tư vấn</>}
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

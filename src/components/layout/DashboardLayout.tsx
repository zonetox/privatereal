'use client';

import React from 'react';
import { Link, usePathname, useRouter } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { locales } from '@/navigation';
import {
    LayoutDashboard,
    Users,
    UserSquare2,
    Briefcase,
    PieChart,
    FileText,
    Settings,
    LogOut,
    ChevronRight,
    Sparkles,
    Building2,
    ShieldCheck,
    CheckSquare,
    Scale,
    Menu,
    X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type UserRole = 'admin' | 'client';

interface DashboardUser {
    id: string;
    email?: string;
    role: UserRole;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    user: DashboardUser | null;
}

// Blueprint defined navigation items
const adminNavItems = [
    { href: '/dashboard', label: 'overview', icon: LayoutDashboard },
    { href: '/dashboard/leads', label: 'leads', icon: UserSquare2 },
    { href: '/dashboard/clients', label: 'clients', icon: Users },
    { href: '/dashboard/projects', label: 'projects', icon: Briefcase },
    { href: '/dashboard/recommendations', label: 'recommendations', icon: Sparkles },
    { href: '/dashboard/workspace', label: 'workspace', icon: CheckSquare },
    { href: '/dashboard/portfolio', label: 'advisoryCollection', icon: Building2 },
    { href: '/dashboard/reports', label: 'reports', icon: FileText },
];

const clientNavItems = [
    { href: '/dashboard/recommendations', label: 'recommendationsClient', icon: Sparkles },
    { href: '/dashboard/workspace', label: 'workspaceClient', icon: CheckSquare },
    { href: '/dashboard/compare', label: 'compare', icon: Scale },
    { href: '/dashboard/my-properties', label: 'myProperties', icon: Building2 },
    { href: '/dashboard/settings', label: 'profile', icon: UserSquare2 },
];

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
    const t = useTranslations('Dashboard');
    const pathname = usePathname();
    const currentLocale = useLocale();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Use role-specific navigation arrays
    const filteredNavItems = user?.role === 'admin' ? adminNavItems : clientNavItems;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-64 border-r border-border flex-col glass sticky top-0 h-screen z-20">
                <div className="p-6 border-b border-border">
                    <Link href="/" className="text-xl font-bold gold-text-gradient tracking-tighter">
                        PREIO
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-md transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/10"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={18} className={cn(isActive ? "text-primary-foreground" : "text-primary")} />
                                    <span className="text-sm">{t(item.label)}</span>
                                </div>
                                {isActive && <ChevronRight size={14} />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                    >
                        <LogOut size={18} />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar - Drawer */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-border z-[101] lg:hidden transition-transform duration-500 ease-out flex flex-col",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold gold-text-gradient tracking-tighter">
                        PREIO
                    </Link>
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 -mr-2 text-slate-400 hover:text-white touch-target"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/10"
                                        : "text-slate-400 active:bg-slate-900 active:text-white"
                                )}
                            >
                                <Icon size={20} className={cn(isActive ? "text-primary-foreground" : "text-primary")} />
                                <span className="text-sm tracking-wide">{t(item.label)}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-border">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-5 py-4 text-sm font-bold text-rose-500 bg-rose-500/5 rounded-xl border border-rose-500/10 active:bg-rose-500/20 transition-all"
                    >
                        <LogOut size={20} />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 md:h-16 border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 bg-background/80 backdrop-blur-md z-40">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white touch-target"
                        >
                            <Menu size={24} />
                        </button>
                        <Link href="/" className="lg:hidden text-lg font-black gold-text-gradient tracking-tighter">
                            PREIO.
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Language Switcher */}
                        <div className="flex items-center gap-1.5 md:gap-2 border-r border-border pr-3 md:pr-6">
                            {locales.map((l) => (
                                <button
                                    key={l}
                                    onClick={() => {
                                        router.push(pathname, { locale: l as 'en' | 'vi' | 'zh' });
                                    }}
                                    className={cn(
                                        "px-2 py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-tighter rounded transition-all",
                                        currentLocale === l
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-white"
                                    )}
                                >
                                    {l === 'vi' ? 'VN' : l === 'en' ? 'EN' : 'CN'}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{user?.role}</span>
                                <span className="text-xs font-bold leading-none">{user?.email?.split('@')[0] || 'investor'}</span>
                            </div>
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-primary/20 bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                <span className="text-primary font-black text-xs md:text-sm">{user?.email?.[0].toUpperCase() || 'P'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="flex-1 overflow-auto bg-slate-950/50 backdrop-blur-sm p-3 md:p-8">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </section>
            </main>
        </div>
    );
}

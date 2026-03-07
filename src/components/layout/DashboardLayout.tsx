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
    ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

const navItems = [
    { href: '/dashboard', label: 'overview', icon: LayoutDashboard, roles: ['admin', 'client'] },
    { href: '/dashboard/leads', label: 'leads', icon: UserSquare2, roles: ['admin'] },
    { href: '/dashboard/clients', label: 'clients', icon: Users, roles: ['admin'] },
    { href: '/dashboard/projects', label: 'projects', icon: Briefcase, roles: ['admin'] },
    { href: '/dashboard/portfolio', label: 'portfolio', icon: PieChart, roles: ['admin'] },
    { href: '/dashboard/recommendations', label: 'recommendations', icon: Sparkles, roles: ['client', 'admin'] },
    { href: '/dashboard/workspace', label: 'workspace', icon: Briefcase, roles: ['client', 'admin'] },
    { href: '/dashboard/my-properties', label: 'myProperties', icon: Building2, roles: ['client', 'admin'] },
    { href: '/dashboard/reports', label: 'reports', icon: FileText, roles: ['admin'] },
    { href: '/dashboard/advisor', label: 'advisor', icon: ShieldCheck, roles: ['admin'] },
    { href: '/dashboard/settings', label: 'settings', icon: Settings, roles: ['admin', 'client'] },
];

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
    const t = useTranslations('Dashboard');
    const pathname = usePathname();
    const currentLocale = useLocale();
    const router = useRouter();

    const handleLogout = async () => {
        // Logout logic will be added later
        router.push('/login');
    };

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter(item =>
        user && item.roles.includes(user.role)
    );

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border flex flex-col glass sticky top-0 h-screen">
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 border-b border-border flex items-center justify-between px-8 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                    <div>
                        {/* Breadcrumbs or Page Title could go here */}
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Language Switcher */}
                        <div className="flex items-center gap-2 border-r border-border pr-6">
                            {locales.map((l) => (
                                <button
                                    key={l}
                                    onClick={() => {
                                        // next-intl's router.push with locale option handles prefixing.
                                        // We ensure we pass the base pathname.
                                        router.push(pathname, { locale: l as 'en' | 'vi' | 'zh' });
                                    }}
                                    className={cn(
                                        "px-2 py-1 text-[10px] font-bold uppercase tracking-tighter rounded transition-all",
                                        currentLocale === l
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    {l === 'vi' ? 'VN' : l === 'en' ? 'EN' : 'CN'}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{user?.role}</span>
                                <span className="text-sm font-semibold">{user?.email || 'investor@preio.vn'}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-primary/20 bg-muted flex items-center justify-center overflow-hidden">
                                <span className="text-primary font-bold">{user?.email?.[0].toUpperCase() || 'P'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="flex-1 overflow-auto bg-slate-950/50 backdrop-blur-sm p-4">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </section>
            </main>
        </div>
    );
}

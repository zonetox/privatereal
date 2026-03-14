import { createNavigation } from 'next-intl/navigation';

export const locales = ['vi', 'en', 'zh'] as const;
export const localePrefix = 'always'; // Default

export const { Link, redirect, usePathname, useRouter } =
    createNavigation({ locales, localePrefix });

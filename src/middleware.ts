import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, localePrefix } from './navigation'
import { updateSession } from './lib/supabase/middleware'

import { validateEnv } from './lib/env'

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale: 'vi',
    localePrefix,
    localeDetection: false
})

export default async function middleware(request: NextRequest) {
    // Step 0: Validate environment
    if (process.env.NODE_ENV === 'development') {
        validateEnv();
    }

    // Step 1: Run i18n middleware
    const response = intlMiddleware(request)

    // If i18n middleware is already redirecting (e.g. from / to /vi), return it immediately
    // to avoid session logic potentially overwriting the redirect.
    if (response.headers.has('x-next-intl-locale') || response.status === 307 || response.status === 308) {
        return response;
    }

    // Step 2: Update Supabase session
    const { supabaseResponse, user, profile } = await updateSession(request, response)

    // Step 3: Protected Route Logic
    const { pathname } = request.nextUrl
    const locale = pathname.split('/')[1] || 'vi'

    // Define protected paths (localized)
    const isDashboardRoute = locales.some(l =>
        pathname === `/${l}/dashboard` || pathname.startsWith(`/${l}/dashboard/`)
    )

    if (isDashboardRoute) {
        // 1. No valid session
        if (!user) {
            return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
        }

        // 2. Allow access even if profile record is missing (Temporary for evaluation)
        // We will handle profile existence checks within the dashboard pages if needed
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - … if they contain a dot, e.g. `favicon.ico`
        // - … if they start with `_next`
        // - /api routes
        '/((?!api|_next|_vercel|.*\\..*).*)',
        // However, match all paths of the form /vi, /en, etc.
        '/([\\w]{2})/:path*'
    ],
}

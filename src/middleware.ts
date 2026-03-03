import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, localePrefix } from './navigation'
import { updateSession } from './lib/supabase/middleware'

import { validateEnv } from './lib/env'

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale: 'vi',
    localePrefix
})

export default async function middleware(request: NextRequest) {
    // Step 0: Validate environment
    if (process.env.NODE_ENV === 'development') {
        validateEnv();
    }

    // Step 1: Run i18n middleware
    const response = intlMiddleware(request)

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

        // 2. No profile or invalid role (pending/null)
        if (!profile || profile.role === 'pending') {
            return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

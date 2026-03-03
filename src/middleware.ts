import { type NextRequest } from 'next/server'
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
    const supabaseResponse = await updateSession(request, response)

    // Step 3: Protected Route Logic
    const { pathname } = request.nextUrl

    // Define protected paths (localized)
    const isDashboardRoute = locales.some(locale =>
        pathname === `/${locale}/dashboard` || pathname.startsWith(`/${locale}/dashboard/`)
    )

    if (isDashboardRoute) {
        // Simple presence check for user token in cookies could be added here
        // But updateSession already refreshes/validates via getUser()
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

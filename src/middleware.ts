import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 1. Initialize Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 2. Refresh Session
    // This helps us update the cookie if it's expired or about to expire
    // IMPORTANT: Do NOT use existing user object from getSession(), call getUser() instead
    const {
        data: { user },
    } = await supabase.auth.getUser()


    // 3. Intelligent Routing Logic
    const path = request.nextUrl.pathname

    // Redirect Logic for Protected Routes
    if (path.startsWith('/wizard') || path.startsWith('/dashboard')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Check User's Project Statuts
        try {
            const { data: projects } = await supabase
                .from('projects')
                .select('status, deposit_paid')
                .eq('user_id', user.id)
                .limit(1)

            const hasProject = projects && projects.length > 0;
            const project = hasProject ? projects[0] : null;

            // If user is logged in + has signed contract (paid) -> Redirect /wizard to /dashboard
            const isPaidOrBuilding = project && (project.deposit_paid === true || ['building', 'active', 'qa', 'launched'].includes(project.status));

            if (path.startsWith('/wizard') && isPaidOrBuilding) {
                const redirectUrl = new URL('/dashboard', request.url)
                return NextResponse.redirect(redirectUrl)
            }

            // If user is logged in + has NO project -> Redirect /dashboard to /wizard
            if (path.startsWith('/dashboard') && !hasProject) {
                const redirectUrl = new URL('/wizard', request.url)
                return NextResponse.redirect(redirectUrl)
            }

        } catch (error) {
            console.error("Middleware Project Check Error:", error);
        }
    }

    // Specific Logic: If user is logged in and visits login page, redirect them appropiately
    if (path === '/login' && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 4. Return the response
    return response
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

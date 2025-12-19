import { withAuth } from 'next-auth/middleware';

export default withAuth(
    function middleware(req) {
        // Check if user is logged in and trying to access login page
        if (req.nextUrl.pathname === '/login' && req.nextauth.token) {
            console.log('🔄 Redirecting authenticated user from login to admin activities');
            return Response.redirect(new URL('/admin/activities', req.url));
        }

        // Protect admin API routes
        if (req.nextUrl.pathname.startsWith('/api/admin') && req.nextauth.token?.role !== 'admin') {
            return new Response('Unauthorized', { status: 401 });
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Allow access to login page if not authenticated
                if (req.nextUrl.pathname === '/login') {
                    return true;
                }
                // Require authentication for all other protected routes
                return !!token;
            }
        }
    }
);

export const config = {
    matcher: [
        '/login',
        '/admin/:path*',
        '/api/admin/:path*'
    ]
};

import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                console.log('🔍 Authorize called with:', credentials); // Log input
                if (!credentials?.email || !credentials?.password) {
                    console.log('❌ Missing credentials');
                    return null;
                }

                try {
                    // Normalize email
                    const normalizedEmail = credentials.email.toLowerCase().trim();
                    console.log('📧 Normalized email:', normalizedEmail);

                    // Query with Prisma
                    console.log('🔍 Searching for user with query:', { email: normalizedEmail });
                    const user = await prisma.user.findUnique({
                        where: { email: normalizedEmail },
                    });
                    console.log(
                        '📊 Query result:',
                        user
                            ? {
                                  id: user.id,
                                  email: user.email,
                                  name: user.name,
                                  role: user.role,
                                  hasPassword: !!user.password,
                                  passwordLength: user.password ? user.password.length : 0,
                              }
                            : 'Not found',
                    );

                    if (!user) {
                        console.log('❌ User not found in database');
                        return null;
                    }

                    console.log('🔐 Comparing passwords...');
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    console.log('✅ Password comparison result:', isValid);

                    if (!isValid) {
                        console.log('❌ Invalid password');
                        return null;
                    }

                    if (user.role !== 'admin') {
                        console.log('❌ Invalid role:', user.role);
                        return null;
                    }

                    console.log('✅ Auth success for user:', user.email);
                    return { id: user.id, email: user.email, name: user.name, role: user.role };
                } catch (error) {
                    console.error('❌ Error in authorize:', error);
                    return null;
                }
            },
        }),
    ],
    pages: { signIn: '/login' },
    session: {
        strategy: 'jwt',
        maxAge: 15 * 60, // 5 minutes inactivity
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            // Always redirect to admin activities after login
            if (url.startsWith(baseUrl)) return `${baseUrl}/admin/activities`;
            // Allow relative URLs and same-origin URLs
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            // Fallback to baseUrl for external URLs
            return baseUrl;
        },
        async jwt({ token, user }) {
            if (user) token.role = (user as unknown as { role: string }).role;
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                if (token.sub) (session.user as { id: string }).id = token.sub;
                if (token.role) (session.user as { role: string }).role = token.role as string;
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };

import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
  from: process.env.EMAIL_FROM || 'noreply@shakespeareplaylist.com',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
  // Since we have a single trusted admin email, allow linking the GitHub
  // OAuth account to the existing email user (created via Email provider)
  // to avoid OAuthAccountNotLinked errors during first GitHub sign-in.
  allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id
        
        // Check if user is admin
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        })
        
        session.user.role = dbUser?.role || 'USER'
      }
      return session
    },
    signIn: async ({ user, account, profile }) => {
      // Only allow admin users to sign in
      const adminEmail = process.env.ADMIN_EMAIL
      
      if (adminEmail && user.email === adminEmail) {
        // Ensure admin user exists in database
        const now = new Date()
        await prisma.user.upsert({
          where: { email: user.email },
          update: { role: 'ADMIN', emailVerified: { set: now } },
          create: {
            email: user.email,
            role: 'ADMIN',
            emailVerified: now,
          },
        })
        return true
      }
      
      // Check if user already exists and is admin
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })
      
      return existingUser?.role === 'ADMIN'
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
}

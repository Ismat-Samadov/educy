import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { RoleName } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.hashedPassword) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        // Log authentication
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'USER_LOGIN',
            targetType: 'User',
            targetId: user.id,
            details: { email: user.email, timestamp: new Date().toISOString() },
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.profileAvatarUrl,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as RoleName
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface User {
    role: RoleName
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: RoleName
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: RoleName
    id: string
  }
}

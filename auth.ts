
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const password = parsed.data.password;

        const user = await prisma.user.findUnique({
          where: { email },
        });

          const userWithPassword = user as
            | (typeof user & { passwordHash?: string })
            | null;

          if (!userWithPassword?.passwordHash) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
            userWithPassword.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: userWithPassword.id,
          name: userWithPassword.name,
          email: userWithPassword.email,
        };
      },
    }),
  ],
});

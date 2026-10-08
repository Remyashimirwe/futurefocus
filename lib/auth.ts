import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { consumeLoginCode, getAdminByEmail } from "./admin";

export const { handlers, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Verification code", type: "text" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const code = String(credentials?.code ?? "").trim();
        if (!email || code.length < 4) return null;

        const valid = await consumeLoginCode(email, code);
        if (!valid) return null;

        const admin = await getAdminByEmail(email);
        if (!admin) return null;

        return {
          id: String(admin.id),
          email: admin.email,
          name: admin.name ?? "Administrator",
        };
      },
    }),
  ],
});

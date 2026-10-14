import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateAdmin, consumeLoginCode, getAdminByEmail } from "./admin";
import { codeRequired } from "./mailer";

export const { handlers, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Verification code", type: "text" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        const code = String(credentials?.code ?? "").trim();
        if (!email) return null;

        // Email delivery isn't configured (or the code step is switched off):
        // email + password is the whole check.
        if (!codeRequired()) {
          if (!password) return null;
          const admin = await authenticateAdmin(email, password);
          if (!admin) return null;
          return {
            id: String(admin.id),
            email: admin.email,
            name: admin.name ?? "Administrator",
          };
        }

        if (code.length < 4) return null;
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

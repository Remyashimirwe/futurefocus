import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateAdmin, consumeLoginCode, getAdminByEmail, Admin } from "./admin";
import { codeRequired } from "./mailer";
import { verifyFallbackTicket } from "./fallback-ticket";

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
        ticket: { label: "Delivery fallback ticket", type: "text" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        const code = String(credentials?.code ?? "").trim();
        const ticket = String(credentials?.ticket ?? "").trim();
        if (!email) return null;

        const toSession = (admin: Admin) => ({
          id: String(admin.id),
          email: admin.email,
          name: admin.name ?? "Administrator",
        });

        // Email delivery isn't configured (or the code step is switched off):
        // email + password is the whole check.
        if (!codeRequired()) {
          if (!password) return null;
          const admin = await authenticateAdmin(email, password);
          if (!admin) return null;
          return toSession(admin);
        }

        // Normal path: the emailed code proves mailbox control.
        if (code.length >= 4) {
          if (!(await consumeLoginCode(email, code))) return null;
          const admin = await getAdminByEmail(email);
          if (!admin) return null;
          return toSession(admin);
        }

        // No code supplied: allowed only with the signed ticket request-code
        // issues when the code email couldn't be delivered (bad Resend key /
        // unverified sender). The password is still checked here.
        if (!password || !verifyFallbackTicket(email, ticket)) return null;
        const fallbackAdmin = await authenticateAdmin(email, password);
        if (!fallbackAdmin) return null;
        return toSession(fallbackAdmin);
      },
    }),
  ],
});

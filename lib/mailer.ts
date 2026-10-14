import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Future Focus Academy <onboarding@resend.dev>";

export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Whether sign-in requires the emailed verification code.
 *
 * With no RESEND_API_KEY there is nowhere to send the code, so the code step is
 * skipped and email + password alone sign you in. Set LOGIN_CODE_REQUIRED to
 * "true" / "false" to force either behaviour regardless of email delivery.
 */
export function codeRequired(): boolean {
  if (process.env.LOGIN_CODE_REQUIRED === "true") return true;
  if (process.env.LOGIN_CODE_REQUIRED === "false") return false;
  return mailConfigured();
}

export async function sendLoginCode(email: string, code: string): Promise<boolean> {
  if (!mailConfigured()) return false;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: `${code} is your Future Focus sign-in code`,
      text: [
        "Your sign-in code is:",
        "",
        `   ${code}`,
        "",
        "It expires in 10 minutes. If you didn't request this, you can safely ignore this email.",
        "",
        "Future Focus Academy",
      ].join("\n"),
    });
    if (error) {
      console.error("[mail] Resend error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mail] failed to send login code:", err);
    return false;
  }
}

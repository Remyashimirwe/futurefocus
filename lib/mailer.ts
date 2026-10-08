import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Future Focus Academy <onboarding@resend.dev>";

export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
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

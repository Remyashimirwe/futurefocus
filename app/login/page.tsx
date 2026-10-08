import type { Metadata } from "next";
import LoginForm from "../components/LoginForm";

export const metadata: Metadata = {
  title: "Login — Future Focus Academy",
  description:
    "Sign in to your Future Focus Academy account to track your application, manage your enrollment, and explore programs.",
};

export default function LoginPage() {
  return (
    <main>
      <LoginForm />
    </main>
  );
}

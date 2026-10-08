import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ApplyForm from "../components/ApplyForm";

export const metadata: Metadata = {
  title: "Apply — Future Focus Academy",
  description:
    "Apply to Future Focus Academy. Share your personal information, address, preferred course, schedule, and delivery mode (in-person or online).",
};

export default function ApplyPage() {
  return (
    <>
      <Navbar />
      <main>
        <ApplyForm />
      </main>
      <Footer />
    </>
  );
}

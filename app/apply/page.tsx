import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ApplyForm from "../components/ApplyForm";
import { getPublishedPrograms } from "@/lib/programs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply - Future Focus Academy",
  description:
    "Apply to Future Focus Academy. Share your personal information, address, preferred course, schedule, and delivery mode (in-person or online).",
};

export default async function ApplyPage() {
  const programs = await getPublishedPrograms();

  return (
    <>
      <Navbar />
      <main>
        <ApplyForm courses={programs.map((p) => p.title)} />
      </main>
      <Footer />
    </>
  );
}

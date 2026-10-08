import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ProgramsSection } from "../components/Sections";

export const metadata: Metadata = {
  title: "Programs — Future Focus Academy",
  description:
    "Explore Future Focus Academy programs: digital skills, coding, career readiness, creative arts, music production, photography, and more.",
};

export default function ProgramsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "88px", background: "var(--ff-50)" }}>
        <ProgramsSection />
      </main>
      <Footer />
    </>
  );
}

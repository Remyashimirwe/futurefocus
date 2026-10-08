import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { WhyChooseUsSection } from "../components/Sections";

export const metadata: Metadata = {
  title: "Why Choose Us — Future Focus Academy",
  description:
    "Discover why young people choose Future Focus Academy: youth-centered design, real-world relevance, expert facilitators, and a supportive community.",
};

export default function WhyChooseUsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "88px", background: "var(--white)" }}>
        <WhyChooseUsSection />
      </main>
      <Footer />
    </>
  );
}

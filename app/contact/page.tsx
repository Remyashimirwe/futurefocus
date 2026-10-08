import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ContactSection } from "../components/Sections";

export const metadata: Metadata = {
  title: "Contact Us — Future Focus Academy",
  description:
    "Get in touch with Future Focus Academy — email, phone, or send us a message. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "88px", background: "var(--white)" }}>
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

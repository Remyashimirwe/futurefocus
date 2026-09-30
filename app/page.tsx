import PageLoader from "./components/PageLoader";
import Navbar from "./components/Navbar";
import HeroSlideshow from "./components/HeroSlideshow";
import {
  ProgramsSection,
  WhyChooseUsSection,
  GallerySection,
  ContactSection,
} from "./components/Sections";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <PageLoader />
      <Navbar />
      <main>
        <HeroSlideshow />
        <ProgramsSection />
        <WhyChooseUsSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

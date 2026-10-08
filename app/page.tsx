import PageLoader from "./components/PageLoader";
import Navbar from "./components/Navbar";
import HeroSlideshow from "./components/HeroSlideshow";
import { FeaturedProgramsSection } from "./components/Sections";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <PageLoader />
      <Navbar />
      <main>
        <HeroSlideshow />
        <FeaturedProgramsSection />
      </main>
      <Footer />
    </>
  );
}

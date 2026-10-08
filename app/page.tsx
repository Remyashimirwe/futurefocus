import PageLoader from "./components/PageLoader";
import Navbar from "./components/Navbar";
import HeroSlideshow from "./components/HeroSlideshow";
import { FeaturedProgramsSection } from "./components/Sections";
import Footer from "./components/Footer";
import { getPublishedPrograms } from "@/lib/programs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const programs = await getPublishedPrograms();

  return (
    <>
      <PageLoader />
      <Navbar />
      <main>
        <HeroSlideshow />
        <FeaturedProgramsSection programs={programs} />
      </main>
      <Footer />
    </>
  );
}

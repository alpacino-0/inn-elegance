import HeroSection from "@/components/home/hero/HeroSection";
import PopularVillas from "@/components/villa-kiralama/PopularVillas";

export default function Home() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <div className="flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 md:px-8">
        <PopularVillas />
      </div>
    </main>
  );
};

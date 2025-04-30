import HeroSection from "@/components/home/hero/HeroSection";
import PopularVillas from "@/components/villa-kiralama/PopularVillas";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className="flex flex-col justify-center items-center h-screen">
        <PopularVillas />
      </div>

    </main>
  );
};

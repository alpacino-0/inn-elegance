import { Button } from "@/components/ui/button";
import HeroSection from "@/components/home/hero/HeroSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className="flex flex-col justify-center items-center h-screen">
        <Button className="mx-auto">
          Hello welcome to my website
        </Button>
      </div>
    </main>
  );
};

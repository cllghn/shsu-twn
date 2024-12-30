import Footer from "@/components/footer/Footer";
import Graph from "@/components/graph/graph";

export default function Home() {
  return (
    <>
      <div className="px-10 py-10 h-screen w-full relative">
        <Graph />
      </div>
      <Footer />
    </>
  );
}

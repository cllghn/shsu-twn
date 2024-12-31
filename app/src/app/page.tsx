import Footer from "@/components/footer/Footer";
import Graph from "@/components/graph/graph";


export default function Home() {
  return (
    <>
      <main className="p-5 sm:p-10 h-screen w-full relative">
        {/* Graph Statistics Section */}
        <Graph />
      </main >
      <Footer />
    </>
  );
}

import Footer from "../components/footer/Footer.tsx";
import Graph from "../components/graph/graph.tsx";

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

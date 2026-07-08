import { Map } from "@/components/ui/map";

export default function Home() {
  return (
    <main className="h-dvh w-full">
      <Map center={[-118.24, 34.05]} zoom={10}/>
    </main>
  );
}
import { useEffect, useState } from 'react';
import Header from './components/Header';
import WebinarAccordion from './components/WebinarAccordion';

type Occ = { occurrence_id: string; start_time: string; duration: number };
type Webinar = { id: number; topic: string; occurrences: Occ[] };

export default function App() {
  const [list, setList] = useState<Webinar[]>([]);

  useEffect(() => {
    fetch('/api/webinars').then((r) => r.json()).then(setList);
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto mt-8 px-4">
        <h2 className="text-3xl font-bold mb-6">Select a webinar & session</h2>
        {list.map((w) => (
          <WebinarAccordion key={w.id} w={w} />
        ))}
      </main>
    </>
  );
}

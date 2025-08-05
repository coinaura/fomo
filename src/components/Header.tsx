import { Video } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-[#f2f3f5] py-3 px-6 flex items-center">
      <Video className="text-[#0E71EB]" />
      <h1 className="ml-2 text-xl font-semibold text-[#0E71EB]">Zoom</h1>
    </header>
  );
}

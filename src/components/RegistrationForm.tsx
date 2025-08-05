import { useState } from 'react';

export type RegData = {
  name: string;
  school: string;
  email: string;
  phone: string;
};

type Props = {
  onSubmit: (data: RegData) => Promise<void>;
};

export default function RegistrationForm({ onSubmit }: Props) {
  const [data, set] = useState<RegData>({
    name: '',
    school: '',
    email: '',
    phone: '',
  });
  const [busy, setBusy] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await onSubmit(data);
    setBusy(false);
  }

  const input = (key: keyof RegData, placeholder: string, required = true) => (
    <input
      className="border rounded p-2 w-full"
      required={required}
      placeholder={placeholder}
      value={data[key]}
      onChange={(e) => set({ ...data, [key]: e.target.value })}
    />
  );

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {input('name', 'First Name *')}
        {input('school', 'Last Name (School) *')}
      </div>
      {input('email', 'Email Address *')}
      {input('phone', 'Phone *', false)}
      <button
        disabled={busy}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 w-full"
      >
        {busy ? 'Registering…' : 'Register'}
      </button>
    </form>
  );
}

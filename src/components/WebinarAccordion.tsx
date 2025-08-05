/* ------------------------------------------------------------------ */
/*  WebinarAccordion.tsx                                              */
/*  - lists sessions                                                  */
/*  - shows inline registration form                                  */
/*  - calls /api/register and redirects to the Zoom join_url          */
/* ------------------------------------------------------------------ */

import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock3,
  CheckSquare2,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

/* ───────────── Types ───────────── */

type Occ = { occurrence_id: string; start_time: string; duration: number };
type Webinar = { id: number; topic: string; occurrences: Occ[] };

/* ───────────── Helpers ─────────── */

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/* ───────────── Component ───────── */

export default function WebinarAccordion({ w }: { w: Webinar }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'list' | 'form'>('list');
  const [occ, setOcc] = useState<Occ | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    school: '',
    email: '',
    phone: '',
  });

  /* ---------- register handler ---------- */
  async function register(e: React.FormEvent) {
    e.preventDefault();
    if (!occ) return;
    setBusy(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webinarId: w.id,
        occurrenceId: occ.occurrence_id,
        name: form.name,
        school: form.school,
        email: form.email,
        phone: form.phone,
      }),
    });

    const raw = await res.text();
    const payload =
      raw.trim().startsWith('{') ? JSON.parse(raw) : { error: raw };

    if (res.ok && payload.join_url) {
      window.location.replace(payload.join_url);
    } else {
      alert(payload.error || 'Registration failed');
      setBusy(false);
    }
  }

  /* ---------- tiny input helper ---------- */
  const input = (
    key: keyof typeof form,
    ph: string,
    required = true,
    type = 'text'
  ) => (
    <input
      type={type}
      required={required}
      value={form[key]}
      placeholder={ph}
      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      className="border rounded px-3 py-2 w-full"
    />
  );

  /* -------------- UI --------------------- */
  return (
    <div className="border rounded mb-4">
      {/* accordion header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center w-full p-2 bg-gray-50 hover:bg-gray-100"
      >
        <CheckSquare2 className="text-green-600 mr-1" />
        <span className="flex-1 text-left font-medium">{w.topic}</span>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* accordion body */}
      {open && (
        <div className="p-4 space-y-4">
          {/* session grid */}
          {step === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {w.occurrences.map((o) => (
                <button
                  key={o.occurrence_id}
                  onClick={() => {
                    setOcc(o);
                    setStep('form');
                  }}
                  className={clsx(
                    'flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50',
                    occ?.occurrence_id === o.occurrence_id && 'bg-blue-100'
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  {fmt(o.start_time)}
                  <Clock3 className="h-4 w-4 ml-auto text-gray-400" />
                  <span className="text-xs">{o.duration}m</span>
                </button>
              ))}
            </div>
          )}

          {/* registration form */}
          {step === 'form' && occ && (
            <div className="max-w-md mx-auto">
              <p className="mb-4 font-medium">
                Session:&nbsp;
                <span className="text-blue-700">{fmt(occ.start_time)}</span>
              </p>

              <form className="space-y-3" onSubmit={register}>
                {input('name', 'Full Name *')}
                {input('school', 'School Name (Last Name) *')}
                {input('email', 'Email *', true, 'email')}
                {input('phone', 'Phone')}

                <button
                  disabled={busy}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2"
                >
                  {busy ? 'Registering…' : 'Register & Join'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

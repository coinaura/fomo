/* ------------------------------------------------------------------ */
/*  WebinarAccordion.tsx  –  modern card + pill UI (no Tailwind)      */
/* ------------------------------------------------------------------ */

import { ChevronDown, ChevronUp, Calendar, Clock3, CheckSquare2 } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

/* ---------- Types ---------- */
type Occ      = { occurrence_id: string; start_time: string; duration: number };
type Webinar  = { id: number; topic: string; occurrences: Occ[] };

/* ---------- Helpers -------- */
const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

/* ---------- Component ------ */
export default function WebinarAccordion({ w }: { w: Webinar }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'list' | 'form'>('list');
  const [occ , setOcc]  = useState<Occ | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', school: '', email: '', phone: '' });

  /* --- hit Zoom register API & redirect --- */
  async function register(e: React.FormEvent) {
    e.preventDefault();
    if (!occ) return;
    setBusy(true);

    const res = await fetch('/api/register', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        webinarId    : w.id,
        occurrenceId : occ.occurrence_id,
        ...form
      }),
    });

    const raw = await res.text();
    const payload = raw.trim().startsWith('{') ? JSON.parse(raw) : { error: raw };

    if (res.ok && payload.join_url) {
      window.location.replace(payload.join_url);
    } else {
      alert(payload.error || 'Registration failed');
      setBusy(false);
    }
  }

  /* --- small input helper --- */
  const input = (key: keyof typeof form, ph: string, required = true, type = 'text') => (
    <input
      className="input"
      type={type}
      required={required}
      value={form[key]}
      placeholder={ph}
      onChange={e => setForm({ ...form, [key]: e.target.value })}
    />
  );

  /* ---------- UI ----------- */
  return (
    <div className="card">
      {/* accordion header */}
      <button onClick={() => setOpen(!open)} className="flex items-center w-full">
        <CheckSquare2 className="text-green-600 me-1" />
        <span className="flex-1 text-start card-title">{w.topic}</span>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* accordion body */}
      {open && (
        <div className="mt-3">
          {/* session grid */}
          {step === 'list' && (
            <div>
              {w.occurrences.map(o => (
                <button
                  key={o.occurrence_id}
                  onClick={() => { setOcc(o); setStep('form'); }}
                  className={clsx(
                    'pill',
                    occ?.occurrence_id === o.occurrence_id && 'bg-blue-100'
                  )}
                >
                  <Calendar className="me-1" size={14}/>
                  {fmt(o.start_time)}
                  <Clock3 className="ms-2 me-1 text-gray-500" size={14}/>
                  <span className="text-xs">{o.duration}m</span>
                </button>
              ))}
            </div>
          )}

          {/* registration form */}
          {step === 'form' && occ && (
            <form className="form mt-4" onSubmit={register}>
              <h2>Register</h2>

              <p className="text-center mb-3">
                <strong>{fmt(occ.start_time)}</strong>
              </p>

              {input('name'  , 'Full Name *')}
              {input('school', 'School Name (Last Name) *')}
              {input('email' , 'Email *', true, 'email')}
              {input('phone' , 'Phone')}

              <button className="btn mt-2" disabled={busy}>
                {busy ? 'Registering…' : 'Register & Join'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

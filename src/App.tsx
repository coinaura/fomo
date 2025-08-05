/* --------------------------------------------------------------------
   App.tsx – glossy fixed-header page with dropdown session picker + form
---------------------------------------------------------------------*/
import { useEffect, useState } from 'react';

/* ── Types ─────────────────────────────────────────────────────────── */
type Occurrence = { occurrence_id: string; start_time: string; duration: number };
type Webinar    = { id: number; topic: string; occurrences: Occurrence[] };

/* ── Date helper ───────────────────────────────────────────────────── */
const fmt = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleString(undefined, opts);

/* ── SessionPicker component ───────────────────────────────────────── */
function SessionPicker({
  webinars,
  onSelect,
}: {
  webinars: Webinar[];
  onSelect: (webId: number, occ: Occurrence, label: string) => void;
}) {
  const [open, setOpen]   = useState(false);
  const [label, setLabel] = useState('Choose a session');

  /* close dropdown when clicking outside */
  useEffect(() => {
    const close = (e: MouseEvent) =>
      !document.getElementById('ss-root')?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return (
    <div id="ss-root" className={open ? 'session-select open' : 'session-select'}>
      <button className="session-trigger" onClick={() => setOpen(!open)}>
        {label}
      </button>

      <div className="session-menu">
        {webinars.flatMap(w =>
          w.occurrences.map(o => (
            <button
              key={o.occurrence_id}
              className="session-item"
              onClick={() => {
                const pretty =
                  `${fmt(o.start_time, { month: 'short', day: 'numeric', year: 'numeric' })} — ` +
                  fmt(o.start_time, { hour: '2-digit', minute: '2-digit' });
                onSelect(w.id, o, pretty);
                setLabel(pretty);
                setOpen(false);
              }}
            >
              {fmt(o.start_time, { month: 'short', day: 'numeric', year: 'numeric' })}
              <span className="time">
                {fmt(o.start_time, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────── */
export default function App() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [session , setSession ] = useState<{ webId: number; occ: Occurrence }>();
  const [busy    , setBusy    ] = useState(false);
  const [form    , setForm    ] = useState({ name:'', school:'', email:'', phone:'' });

  /* fetch webinars once */
  useEffect(() => {
    fetch('/api/webinars').then(r => r.json()).then(setWebinars)
      .catch(err => console.error('API error', err));
  }, []);

  /* ─ Measure header height → CSS var so content never overlaps */
  useEffect(() => {
    const apply = () => {
      const h = document.querySelector<HTMLElement>('.header')?.offsetHeight || 0;
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    };
    apply(); window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  /* register & redirect */
  async function register(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setBusy(true);

    const res = await fetch('/api/register', {
      method :'POST',
      headers:{ 'Content-Type':'application/json' },
      body   : JSON.stringify({
        webinarId   : session.webId,
        occurrenceId: session.occ.occurrence_id,
        ...form
      }),
    }).then(r=>r.json());

    if (res.join_url) window.location.replace(res.join_url);
    else { alert(res.error || 'Registration failed'); setBusy(false); }
  }

  const firstWebinar = webinars[0];

  return (
    <>
      {/* Fixed glossy header */}
      <header className="header"><h1>{firstWebinar?.topic || 'Webinar'}</h1></header>

      <main>
        {/* Session dropdown */}
        <SessionPicker
          webinars={webinars}
          onSelect={(webId, occ) => setSession({ webId, occ })}
        />

        {/* Registration form */}
        <form className="form-card" onSubmit={register}>
          <h2>
            {session
              ? fmt(session.occ.start_time, {
                  weekday:'short', month:'short', day:'numeric',
                  year:'numeric', hour:'2-digit', minute:'2-digit'
                })
              : 'Choose a session'}
          </h2>

          {(['name','school','email','phone'] as const).map(f => (
            <input
              key={f}
              className="input"
              placeholder={
                f==='school' ? 'School Name (Last Name)' :
                f==='phone'  ? 'Phone' :
                `${f[0].toUpperCase()}${f.slice(1)}`
              }
              type={f==='email' ? 'email' : 'text'}
              required={f!=='phone'}
              value={form[f]}
              disabled={!session}
              onChange={e => setForm({ ...form, [f]: e.target.value })}
            />
          ))}

          <button className="btn" disabled={!session || busy}>
            {busy ? 'Registering…' : 'Register & Join'}
          </button>
        </form>
      </main>
    </>
  );
}

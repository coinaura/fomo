/* --------------------------------------------------------------------
   App.tsx – glossy fixed-header page with auto-select session + form
--------------------------------------------------------------------*/
import { useEffect, useState } from 'react';

/* ── Types ─────────────────────────────────────────────────────────── */
type Occurrence = { occurrence_id: string; start_time: string; duration: number };
type Webinar    = { id: number; topic: string; occurrences: Occurrence[] };

/* ── Date helpers ──────────────────────────────────────────────────── */
const fmt = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleString(undefined, opts);

const fmtDate = (iso: string) =>
  fmt(iso, { month: 'short', day: 'numeric', year: 'numeric' });

const fmtTime = (iso: string) =>
  fmt(iso, { hour: '2-digit', minute: '2-digit' });

/* ── SessionPicker (controlled) ───────────────────────────────────── */
function SessionPicker({
  webinars,
  selectedLabel,
  onSelect,
}: {
  webinars: Webinar[];
  /** Human label for the currently selected session */
  selectedLabel: string;
  /** Called when user clicks a session */
  onSelect: (webId: number, occ: Occurrence, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = selectedLabel || 'Choose a session';

  /* close when clicking outside */
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

      {open && (
        <div className="session-menu">
          {webinars.flatMap(w =>
            w.occurrences.map(o => {
              const pretty = `${fmtDate(o.start_time)} — ${fmtTime(o.start_time)}`;
              return (
                <button
                  key={o.occurrence_id}
                  className="session-item"
                  onClick={() => {
                    onSelect(w.id, o, pretty);
                    setOpen(false);
                  }}
                >
                  <span>{fmtDate(o.start_time)}</span>
                  <span className="time">{fmtTime(o.start_time)}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────── */
export default function App() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [session , setSession ] = useState<{ webId: number; occ: Occurrence }>();
  const [label   , setLabel   ] = useState('');
  const [busy    , setBusy    ] = useState(false);
  const [form    , setForm    ] = useState({ name:'', school:'', email:'', phone:'' });

  /* fetch webinars once */
  useEffect(() => {
    fetch('/api/webinars')
      .then(r => r.json())
      .then(setWebinars)
      .catch(err => console.error('API error', err));
  }, []);

  /* auto-select nearest upcoming session */
  useEffect(() => {
    if (webinars.length && !session) {
      const now = Date.now();
      // flatten all sessions
      const all = webinars.flatMap(w =>
        w.occurrences.map(o => ({ webId: w.id, occ: o }))
      );
      // sort by start_time
      all.sort((a, b) =>
        new Date(a.occ.start_time).getTime() - new Date(b.occ.start_time).getTime()
      );
      // pick first upcoming or fallback to earliest
      const next = all.find(x => new Date(x.occ.start_time).getTime() > now) || all[0];
      const pretty = `${fmtDate(next.occ.start_time)} — ${fmtTime(next.occ.start_time)}`;
      setSession(next);
      setLabel(pretty);
    }
  }, [webinars, session]);

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
    }).then(r => r.json());

    if (res.join_url) {
      window.location.replace(res.join_url);
    } else {
      alert(res.error || 'Registration failed');
      setBusy(false);
    }
  }

  const firstWebinar = webinars[0];

  return (
    <>
      {/* Fixed glossy header */}
      <header className="header">
        <h1>{firstWebinar?.topic || 'Webinar'}</h1>
      </header>

      <main>
        {/* Controlled dropdown session-picker */}
        <SessionPicker
          webinars={webinars}
          selectedLabel={label}
          onSelect={(webId, occ, pretty) => {
            setSession({ webId, occ });
            setLabel(pretty);
          }}
        />

        {/* Registration form */}
        <form className="form-card" onSubmit={register}>
          <h2>
            {session
              ? fmtDateTime(session.occ.start_time)
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
              disabled={!session}
              value={form[f]}
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

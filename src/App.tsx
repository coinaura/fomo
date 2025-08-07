import { useEffect, useState } from 'react';

/* ── Types ─────────────────────────────────────────────────────────── */
type Occurrence = { occurrence_id: string; start_time: string; duration: number };
type Webinar    = { id: number; topic: string; occurrences: Occurrence[] };

/* ── Date formatting ───────────────────────────────────────────────── */
const fmt = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleString(undefined, opts);
const fmtDate = (iso: string) => fmt(iso, { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (iso: string) => fmt(iso, { hour: '2-digit', minute: '2-digit' });
const fmtDateTime = (iso: string) =>
  `${fmtDate(iso)} — ${fmtTime(iso)}`;

/* ══════════ SessionPicker ══════════ */
function SessionPicker({
  webinars,
  selectedSession,
  onSelect,
}: {
  webinars: Webinar[];
  /** current selection (auto or user) */
  selectedSession: { webId: number; occ: Occurrence } | null;
  /** fires when user picks manually */
  onSelect: (webId: number, occ: Occurrence) => void;
}) {
  const [open, setOpen]   = useState(false);
  const [label, setLabel] = useState('Choose a session');

  /* keep label in sync with selectedSession */
  useEffect(() => {
    if (selectedSession) {
      setLabel(fmtDateTime(selectedSession.occ.start_time));
    }
  }, [selectedSession]);

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
      {open && (
        <div className="session-menu">
          {webinars.flatMap(w =>
            w.occurrences.map(o => (
              <button
                key={o.occurrence_id}
                className="session-item"
                onClick={() => {
                  onSelect(w.id, o);
                  setOpen(false);
                }}
              >
                <span>{fmtDate(o.start_time)}</span>
                <span className="time">{fmtTime(o.start_time)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════ Main App ══════════ */
export default function App() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [session , setSession ] = useState<{ webId: number; occ: Occurrence } | null>(null);
  const [busy    , setBusy    ] = useState(false);
  const [form    , setForm    ] = useState({ name:'', school:'', email:'', phone:'' });

  /* 1 Fetch all webinars */
  useEffect(() => {
    fetch('/api/webinars')
      .then(r => r.json())
      .then(setWebinars)
      .catch(console.error);
  }, []);

  /* 2 Auto-select nearest upcoming session once webinars load */
  useEffect(() => {
    if (webinars.length && !session) {
      const now = Date.now();
      const all = webinars.flatMap(w =>
        w.occurrences.map(o => ({ webId: w.id, occ: o }))
      );
      all.sort((a, b) =>
        new Date(a.occ.start_time).getTime() - new Date(b.occ.start_time).getTime()
      );
      const next = all.find(x => new Date(x.occ.start_time).getTime() > now) || all[0];
      setSession(next);
    }
  }, [webinars, session]);

  /* 3 Submit registration */
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
        ...form,
      }),
    }).then(r => r.json());

    if (res.join_url) window.location.replace(res.join_url);
    else {
      alert(res.error || 'Registration failed');
      setBusy(false);
    }
  }

  /* For header title */
  const topic = webinars[0]?.topic || 'Webinar';

  return (
    <>
      {/* fixed glossy header */}
      <header className="header">
        <h1>{topic}</h1>
      </header>

      <main>
        {/* session picker */}
        <SessionPicker
          webinars={webinars}
          selectedSession={session}
          onSelect={(webId, occ) => setSession({ webId, occ })}
        />

        {/* registration form */}
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
                f[0].toUpperCase() + f.slice(1)
              }
              type={f==='email' ? 'email' : 'text'}
              required={f !== 'phone'}
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

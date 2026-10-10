import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MAX_ALARM_MS = 2 * 60 * 1000;

export default function AlertSound() {
  const [enabled, setEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [active, setActive] = useState(null);

  const seen = useRef(new Set());
  const firstLoad = useRef(true);
  const pulseTimer = useRef(null);
  const capTimer = useRef(null);
  const audio = useRef(null);
  // Refs let the polling effect read current settings without restarting the interval.
  const enabledRef = useRef(false);
  const mutedRef = useRef(false);
  enabledRef.current = enabled;
  mutedRef.current = muted;

  const stop = useCallback(() => {
    clearTimeout(pulseTimer.current); pulseTimer.current = null;
    clearTimeout(capTimer.current); capTimer.current = null;
    if (audio.current) {
      try { audio.current.osc.stop(); } catch { /* already stopped */ }
      try { audio.current.ctx.close(); } catch { /* already closed */ }
      audio.current = null;
    }
  }, []);

  const tone = useCallback((emergency = false) => {
    stop(); // never stack overlapping alarms
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = emergency ? 740 : 880;
      gain.gain.value = 0.0001;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start();
      audio.current = { ctx, osc };
      const pulse = () => {
        if (!audio.current) return;
        const t = ctx.currentTime;
        gain.gain.setTargetAtTime(0.12, t, 0.02);
        gain.gain.setTargetAtTime(0.0001, t + 0.28, 0.03);
        pulseTimer.current = setTimeout(pulse, emergency ? 650 : 400);
      };
      pulse();
      // Test beep ends quickly; the emergency alarm is capped at two minutes.
      capTimer.current = setTimeout(stop, emergency ? MAX_ALARM_MS : 500);
    } catch { setMuted(true); }
  }, [stop]);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const { data } = await api.get('/alerts');
        if (!alive || !Array.isArray(data)) return;
        const fresh = data.filter(a => !seen.current.has(a._id));
        fresh.forEach(a => seen.current.add(a._id));
        // Newest first from API; surface the newest unseen Active + Critical alert.
        const urgent = fresh.find(a => a.status === 'Active' && a.priority === 'Critical');
        if (urgent) {
          setActive(urgent);
          // Do not blast audio for alerts that already existed when the page opened.
          if (!firstLoad.current && enabledRef.current && !mutedRef.current) tone(true);
        }
        firstLoad.current = false;
      } catch { /* network errors are ignored; next poll retries */ }
    };
    poll();
    const id = setInterval(poll, 12000);
    return () => { alive = false; clearInterval(id); stop(); };
  }, [tone, stop]);

  const close = async ack => {
    stop();
    const a = active;
    setActive(null);
    // Only administrators can change alert status on the server; skip the call for everyone else.
    if (ack && a && localStorage.getItem('citypulse_token')) {
      try { await api.patch(`/alerts/${a._id}`, { status: 'Acknowledged' }); } catch { /* not an admin */ }
    }
  };

  const toggleEnabled = () => {
    if (!enabled) { setEnabled(true); setMuted(false); tone(false); }
    else { setEnabled(false); stop(); }
  };
  const toggleMute = () => { setMuted(v => !v); stop(); };

  return (
    <>
      <div className="sound-control">
        <button onClick={toggleEnabled}>{enabled ? 'Sound Enabled' : 'Enable Alert Sound'}</button>
        <button className="quiet" onClick={toggleMute}>{muted ? 'Sound Muted' : 'Mute Alerts'}</button>
      </div>
      {active && (
        <div className="modal-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="emergency-title">
          <section className="emergency-modal">
            <p className="eyebrow">CITYPULSE EMERGENCY ALERT</p>
            <h2 id="emergency-title">{active.title}</h2>
            <p><b>Type:</b> {active.type} · <b>Priority:</b> {active.priority}</p>
            <p><b>Location:</b> {active.location}</p>
            <p>{active.description}</p>
            <p className="muted">Received {new Date(active.createdAt).toLocaleString()}</p>
            <div className="actions">
              <button onClick={() => close(true)}>Acknowledge Alert</button>
              <button className="quiet" onClick={() => { stop(); setMuted(true); }}>Mute Sound</button>
              <Link className="button-link" to="/map" onClick={() => close(false)}>View Live Map</Link>
            </div>
            <small>Alarm is limited to two minutes. Browser audio requires sound to be enabled by user interaction.</small>
          </section>
        </div>
      )}
    </>
  );
}

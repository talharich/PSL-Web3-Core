import { useState, useEffect } from 'react';
import { Terminal, Zap, Calculator, Award, Play } from 'lucide-react';
import TierBadge from '../components/TierBadge';
import { oracle as oracleApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();
  const [events,     setEvents]     = useState([]);
  const [milestones, setMilestones] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [triggering, setTriggering] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [mintForm,   setMintForm]   = useState({ toAddress: '', playerId: '', tier: 'LEGEND', eventId: '' });
  const [minting,    setMinting]    = useState(false);
  const [scoreForm,  setScoreForm]  = useState({
    recentMatches: '[{"formPoints":80},{"formPoints":90}]',
    milestones: '[{"type":"century","points":80}]',
    tradeVolume: 500, maxTradeVolume: 1000, mintRarity: 70,
  });
  const [scoreResult, setScoreResult] = useState(null);

  useEffect(() => {
    Promise.all([
      oracleApi.events(),
      oracleApi.milestones(),
    ]).then(([evRes, mlRes]) => {
      setEvents(Array.isArray(evRes) ? evRes : (evRes?.events ?? []));
      setMilestones(mlRes && typeof mlRes === 'object' && !Array.isArray(mlRes) ? mlRes : {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const triggerEvent = async (eventId) => {
    setTriggering(eventId);
    setLastResult(null);
    try {
      const data = await oracleApi.trigger(eventId);
      setLastResult({ success: true, eventId, data });
    } catch (e) {
      setLastResult({ success: false, eventId, error: e.message });
    } finally {
      setTriggering(null);
    }
  };

  const mintAtTier = async () => {
    setMinting(true);
    try {
      const data = await oracleApi.mintAtTier(mintForm.toAddress, mintForm.playerId, mintForm.tier, mintForm.eventId);
      setLastResult({ success: true, data });
    } catch (e) {
      setLastResult({ success: false, error: e.message });
    } finally {
      setMinting(false);
    }
  };

  const calculateScore = async () => {
    try {
      const payload = {
        recentMatches: JSON.parse(scoreForm.recentMatches),
        milestones: JSON.parse(scoreForm.milestones),
        tradeVolume: Number(scoreForm.tradeVolume),
        maxTradeVolume: Number(scoreForm.maxTradeVolume),
        mintRarity: Number(scoreForm.mintRarity),
      };
      const data = await oracleApi.calculateScore(payload);
      setScoreResult(data);
    } catch (e) {
      setScoreResult({ error: e.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <p className="text-green-400 text-xs tracking-widest font-mono">ORACLE CONTROL PANEL</p>
        <h1 className="font-display text-6xl text-white mt-2">Admin</h1>
        <p className="text-gray-400 text-sm mt-1">Trigger events, mint NFTs, run score calculations</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT: Events */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Terminal size={18} className="text-green-400" />
            <h2 className="text-xl font-semibold text-white">Mock Events</h2>
            <span className="ml-auto px-2 py-0.5 text-xs bg-green-500/10 border border-green-500/20 text-green-400 font-mono">
              {events.length}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.eventId}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-green-500/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-green-400">{event.eventId}</span>
                      <TierBadge tier={event.rarityTrigger} size="sm" />
                    </div>
                    <p className="text-white text-sm font-medium truncate">{event.playerName} · {event.team}</p>
                    <p className="text-gray-500 text-xs truncate">{event.stat} — {event.matchContext}</p>
                  </div>
                  <button
                    onClick={() => triggerEvent(event.eventId)}
                    disabled={!!triggering}
                    className="ml-4 flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition disabled:opacity-50 shrink-0"
                  >
                    {triggering === event.eventId
                      ? <><div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" /> Running</>
                      : <><Play size={11} /> Trigger</>
                    }
                  </button>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">No events available. Check backend connection.</p>
              )}
            </div>
          )}

          {/* Last result terminal */}
          {lastResult && (
            <div className={`mt-4 terminal-bg p-4 text-xs font-mono ${lastResult.success ? 'terminal-line-success' : 'terminal-line-error'}`}>
              <div className="flex items-center justify-between mb-2">
                <span>{lastResult.success ? '✓ SUCCESS' : '✗ ERROR'} — {lastResult.eventId}</span>
                <button onClick={() => setLastResult(null)} className="text-gray-500 hover:text-white">×</button>
              </div>
              <pre className="overflow-auto max-h-32 text-gray-300 text-[10px]">
                {JSON.stringify(lastResult.data || lastResult.error, null, 2)}
              </pre>
            </div>
          )}
        </section>

        {/* RIGHT col */}
        <div className="space-y-6">
          {/* Deadshot Mint */}
          <section className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <Zap size={18} className="text-amber-400" />
              <h2 className="text-xl font-semibold text-white">Deadshot Mint</h2>
            </div>
            <p className="text-gray-500 text-xs mb-4">Mint directly at LEGEND or ICON for special events (hat-tricks, 6-sixes).</p>
            <div className="space-y-3">
              {[['To Address', 'toAddress', 'text', '0x...'], ['Player ID', 'playerId', 'text', 'babar-azam'], ['Event ID', 'eventId', 'text', 'EVT-DEMO']].map(([label, key, type, placeholder]) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                  <input type={type} placeholder={placeholder} value={mintForm[key]}
                    onChange={e => setMintForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full p-2.5 bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-amber-400/50"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tier</label>
                <select value={mintForm.tier} onChange={e => setMintForm(f => ({ ...f, tier: e.target.value }))}
                  className="w-full p-2.5 bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-amber-400/50"
                  style={{ background: '#0a0f0b' }}
                >
                  {['COMMON','RARE','EPIC','LEGEND','ICON'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={mintAtTier} disabled={minting}
                className="w-full py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold hover:bg-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {minting ? <><div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" /> Minting...</> : <><Zap size={13} /> Mint at Tier</>}
              </button>
            </div>
          </section>

          {/* Score Calculator */}
          <section className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <Calculator size={18} className="text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Score Calculator</h2>
            </div>
            <div className="space-y-3">
              {[['Recent Matches (JSON)', 'recentMatches', true], ['Milestones (JSON)', 'milestones', true]].map(([label, key, isTextarea]) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                  <textarea rows={2} value={scoreForm[key]}
                    onChange={e => setScoreForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full p-2.5 bg-white/5 border border-white/10 text-white text-xs font-mono outline-none focus:border-blue-400/50 resize-none"
                  />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2">
                {[['Trade Volume','tradeVolume'],['Max Volume','maxTradeVolume'],['Mint Rarity','mintRarity']].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                    <input type="number" value={scoreForm[key]}
                      onChange={e => setScoreForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full p-2 bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-blue-400/50"
                    />
                  </div>
                ))}
              </div>
              <button onClick={calculateScore}
                className="w-full py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition flex items-center justify-center gap-2"
              >
                <Calculator size={13} /> Calculate Score
              </button>
              {scoreResult && (
                <div className={`p-4 border ${scoreResult.error ? 'border-red-500/30 bg-red-500/10' : 'border-blue-500/30 bg-blue-500/10'}`}>
                  {scoreResult.error ? (
                    <p className="text-red-400 text-sm">{scoreResult.error}</p>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Performance Score</p>
                        <p className="text-blue-400 font-display text-4xl">{scoreResult.total}</p>
                      </div>
                      <TierBadge tier={scoreResult.tier} size="lg" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Milestones table */}
          {Object.keys(milestones).length > 0 && (
            <section className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <Award size={18} className="text-green-400" />
                <h2 className="text-xl font-semibold text-white">Milestone Points</h2>
              </div>
              <div className="space-y-2">
                {Object.entries(milestones).map(([key, pts]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm capitalize">{key.replace(/_/g,' ')}</span>
                    <span className="text-amber-400 font-display text-2xl">{pts}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

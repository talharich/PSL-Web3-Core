import { useState, useRef, useEffect } from 'react';
import { X, Lock, Mail, User, ShieldCheck, RotateCcw, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth as authApi } from '../services/api';

export default function AuthModal({ onClose }) {
  const { login, signup, verifyOtp } = useAuth();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Validation ──────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (mode === 'signup' && !name.trim())
      errs.name = 'Display name is required';
    if (!email.trim())
      errs.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Enter a valid email address';
    if (!pass)
      errs.pass = 'Password is required';
    else if (pass.length < 10)
      errs.pass = 'Password must be at least 10 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearFieldError = (field) =>
    setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  // ── OTP handling ────────────────────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0)
      otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  // ── Handlers ────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!validate()) return;
    setError(''); setLoading(true);
    try {
      await signup(email, pass, name);
      setMode('otp');
      setResendCooldown(60);
    } catch (err) {
      if (err.message?.toLowerCase().includes('already') ||
        err.message?.toLowerCase().includes('exists') ||
        err.message?.toLowerCase().includes('registered')) {
        setError('already-registered');
      } else {
        setError(err.message);
      }
    } finally { setLoading(false); }
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setError(''); setLoading(true);
    try {
      await login(email, pass);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    setError(''); setLoading(true);
    try {
      await verifyOtp(email, code, pass, name);
      onClose();
    } catch (err) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setError(''); setResending(true);
    try {
      await authApi.resendOtp(email);
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally { setResending(false); }
  };

  // noValidate — kills browser "@" / "fill in this field" popups entirely
  const handle = (e) => {
    e.preventDefault();
    if (mode === 'login') handleLogin();
    if (mode === 'signup') handleSignup();
    if (mode === 'otp') handleVerifyOtp();
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setFieldErrors({});
    setOtp(['', '', '', '', '', '']);
    setResendCooldown(0);
  };

  const isAlreadyRegistered = error === 'already-registered';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

        .auth-overlay {
          position: fixed; inset: 0; z-index: 200;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
          background: rgba(0,0,0,0.82);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .auth-card {
          width: 100%; max-width: 410px;
          background: linear-gradient(160deg, rgba(9,14,10,0.99) 0%, rgba(4,7,5,1) 100%);
          border: 1px solid rgba(34,197,94,0.16);
          border-radius: 18px; overflow: hidden;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.6), 0 40px 80px rgba(0,0,0,0.65), 0 0 60px rgba(34,197,94,0.06), inset 0 1px 0 rgba(255,255,255,0.04);
          animation: cardIn 0.32s cubic-bezier(0.34,1.5,0.64,1) both;
        }
        @keyframes cardIn {
          from { opacity:0; transform:scale(0.93) translateY(14px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }

        /* Header */
        .auth-hd {
          padding: 26px 26px 18px; position: relative;
          border-bottom: 1px solid rgba(255,255,255,0.055);
        }
        .auth-hd::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, transparent 10%, rgba(34,197,94,0.45) 50%, transparent 90%);
        }

        /* Mode pill */
        .mode-pill {
          display: inline-flex; background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 999px;
          padding: 3px; gap: 2px; margin-bottom: 14px;
        }
        .mode-btn {
          font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500; letter-spacing:0.03em;
          padding: 5px 18px; border-radius: 999px; border: none; cursor: pointer;
          background: transparent; color: rgba(156,163,175,0.7);
          transition: all 0.2s;
        }
        .mode-btn.active {
          background: rgba(34,197,94,0.14); color: #4ade80;
          border: 1px solid rgba(34,197,94,0.22);
          box-shadow: 0 0 14px rgba(34,197,94,0.1);
        }

        .auth-title {
          font-family:'Syne',sans-serif; font-size:21px; font-weight:700; letter-spacing:-0.025em;
          color:#f9fafb; margin:0 0 3px;
        }
        .auth-sub {
          font-family:'DM Sans',sans-serif; font-size:12.5px; color:rgba(107,114,128,0.85); margin:0;
        }
        .auth-x {
          position:absolute; top:22px; right:22px;
          width:28px; height:28px; display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:8px;
          color:rgba(107,114,128,0.7); cursor:pointer; transition:all 0.15s;
        }
        .auth-x:hover { background:rgba(255,255,255,0.09); color:#fff; }

        /* Body */
        .auth-bd { padding:22px 26px 18px; }

        /* Fields */
        .fgrp { margin-bottom:12px; }
        .flbl {
          display:block; font-family:'DM Sans',sans-serif; font-size:11px; font-weight:500;
          text-transform:uppercase; letter-spacing:0.07em; color:rgba(107,114,128,0.8); margin-bottom:6px;
        }
        .fwrap { position:relative; display:flex; align-items:center; }
        .ficon { position:absolute; left:12px; color:rgba(75,85,99,0.7); pointer-events:none; display:flex; align-items:center; }
        .ainput {
          width:100%; font-family:'DM Sans',sans-serif; font-size:13.5px; color:#e5e7eb;
          background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.08); border-radius:10px;
          padding:11px 13px 11px 37px; outline:none; box-sizing:border-box;
          transition:border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .ainput::placeholder { color:rgba(75,85,99,0.65); }
        .ainput:focus {
          border-color:rgba(34,197,94,0.38); background:rgba(34,197,94,0.035);
          box-shadow:0 0 0 3px rgba(34,197,94,0.07);
        }
        .ainput.err { border-color:rgba(239,68,68,0.45); box-shadow:0 0 0 3px rgba(239,68,68,0.06); }
        .ainput.pr { padding-right:40px; }
        .feye {
          position:absolute; right:11px; background:none; border:none; cursor:pointer;
          color:rgba(75,85,99,0.7); display:flex; align-items:center; padding:2px;
          transition:color 0.15s;
        }
        .feye:hover { color:rgba(156,163,175,0.9); }
        .ferr {
          font-family:'DM Sans',sans-serif; font-size:11.5px; color:#f87171;
          margin:5px 0 0 2px; display:flex; align-items:center; gap:3px;
        }
        .ferr::before { content:'↑'; font-size:10px; opacity:0.7; }

        /* OTP */
        .otp-icon {
          width:54px; height:54px; border-radius:13px; margin:0 auto 18px;
          display:flex; align-items:center; justify-content:center;
          background:linear-gradient(135deg,rgba(34,197,94,0.11),rgba(34,197,94,0.04));
          border:1px solid rgba(34,197,94,0.22);
          box-shadow:0 0 22px rgba(34,197,94,0.09);
        }
        .otp-hint {
          font-family:'DM Sans',sans-serif; font-size:12.5px; color:rgba(107,114,128,0.85);
          text-align:center; line-height:1.55; margin-bottom:16px;
        }
        .otp-hint strong { color:rgba(167,174,183,0.9); font-weight:500; }
        .otp-row { display:flex; gap:8px; justify-content:center; margin-bottom:14px; }
        .obox {
          width:44px; height:50px; text-align:center;
          font-family:'Syne',monospace; font-size:20px; font-weight:700; color:#f9fafb;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px;
          outline:none; caret-color:#22c55e;
          transition:border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .obox.on { border-color:rgba(34,197,94,0.48); background:rgba(34,197,94,0.055); }
        .obox:focus { border-color:rgba(34,197,94,0.65); box-shadow:0 0 0 3px rgba(34,197,94,0.1); background:rgba(34,197,94,0.055); }

        .resend {
          display:flex; align-items:center; justify-content:center; gap:5px;
          font-family:'DM Sans',sans-serif; font-size:12px;
          background:none; border:none; cursor:pointer;
          padding:4px 10px; border-radius:7px; margin:0 auto 16px;
          transition:background 0.15s, color 0.15s;
        }
        .resend:not(:disabled):hover { background:rgba(255,255,255,0.04); }

        /* Error banner */
        .errbanner {
          border-radius:10px; padding:10px 13px; margin-bottom:12px;
          background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.18);
        }
        .errbanner p { font-family:'DM Sans',sans-serif; font-size:13px; color:#fca5a5; margin:0; }
        .errlink {
          font-family:'DM Sans',sans-serif; font-size:12px; color:#4ade80;
          background:none; border:none; cursor:pointer; padding:0; margin-top:5px;
          display:inline-flex; align-items:center; gap:4px;
          text-decoration:underline; text-underline-offset:2px;
        }

        /* Submit */
        .asub {
          width:100%; height:46px;
          display:flex; align-items:center; justify-content:center; gap:8px;
          font-family:'Syne',sans-serif; font-size:14px; font-weight:600; letter-spacing:0.02em; color:#fff;
          background:linear-gradient(135deg,#16a34a,#15803d);
          border:1px solid rgba(34,197,94,0.28); border-radius:10px; cursor:pointer;
          box-shadow:0 4px 16px rgba(34,197,94,0.18), inset 0 1px 0 rgba(255,255,255,0.1);
          transition:all 0.2s; margin-bottom:14px;
        }
        .asub:hover:not(:disabled) {
          background:linear-gradient(135deg,#15803d,#166534);
          box-shadow:0 4px 22px rgba(34,197,94,0.26), inset 0 1px 0 rgba(255,255,255,0.1);
          transform:translateY(-1px);
        }
        .asub:active:not(:disabled) { transform:translateY(0); }
        .asub:disabled { opacity:0.42; cursor:not-allowed; transform:none; box-shadow:none; }

        .spin { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:rot 0.65s linear infinite; }
        @keyframes rot { to { transform:rotate(360deg); } }
        .spin-sm { animation:rot 0.75s linear infinite; }

        /* Switch */
        .aswitch {
          text-align:center; font-family:'DM Sans',sans-serif; font-size:13px; color:rgba(107,114,128,0.8);
        }
        .aswitch button {
          background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif;
          font-size:13px; font-weight:500; color:rgba(74,222,128,0.9); margin-left:4px;
          padding:0; transition:color 0.15s;
        }
        .aswitch button:hover { color:#4ade80; }

        .aback {
          display:flex; align-items:center; justify-content:center; gap:4px;
          font-family:'DM Sans',sans-serif; font-size:12px; color:rgba(75,85,99,0.8);
          background:none; border:none; cursor:pointer;
          margin:0 auto; padding:4px 10px; border-radius:7px;
          transition:color 0.15s, background 0.15s;
        }
        .aback:hover { color:rgba(156,163,175,0.9); background:rgba(255,255,255,0.04); }

        /* Footer */
        .auth-ft {
          padding:10px 26px 18px; border-top:1px solid rgba(255,255,255,0.048); text-align:center;
        }
        .auth-ft p { font-family:'DM Sans',sans-serif; font-size:11px; color:rgba(55,65,75,0.95); margin:0; }
      `}</style>

      <div className="auth-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="auth-card">

          {/* Header */}
          <div className="auth-hd">
            {mode !== 'otp' && (
              <div className="mode-pill">
                <button className={`mode-btn${mode === 'login' ? ' active' : ''}`} type="button" onClick={() => switchMode('login')}>Sign In</button>
                <button className={`mode-btn${mode === 'signup' ? ' active' : ''}`} type="button" onClick={() => switchMode('signup')}>Sign Up</button>
              </div>
            )}
            <h2 className="auth-title">
              {mode === 'login' && 'Welcome back'}
              {mode === 'signup' && 'Create account'}
              {mode === 'otp' && 'Check your email'}
            </h2>
            <p className="auth-sub">
              {mode === 'login' && 'Sign in to access your NFT collection'}
              {mode === 'signup' && 'Join the PSL × Web3 experience'}
              {mode === 'otp' && `We sent a 6-digit code to ${email}`}
            </p>
            <button className="auth-x" type="button" onClick={onClose}><X size={14} /></button>
          </div>

          {/* Body */}
          <form className="auth-bd" onSubmit={handle} noValidate>

            {mode === 'otp' ? (
              <>
                <div className="otp-icon"><ShieldCheck size={23} color="#4ade80" /></div>
                <p className="otp-hint">Enter the code sent to <strong>{email}</strong></p>
                <div className="otp-row" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      autoFocus={i === 0}
                      className={`obox${digit ? ' on' : ''}`}
                    />
                  ))}
                </div>
                <button
                  type="button" onClick={handleResend}
                  disabled={resendCooldown > 0 || resending}
                  className="resend"
                  style={{ color: resendCooldown > 0 || resending ? 'rgba(75,85,99,0.5)' : 'rgba(107,114,128,0.8)' }}
                >
                  <RotateCcw size={11} className={resending ? 'spin-sm' : ''} />
                  {resending ? 'Sending…' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </>
            ) : (
              <>
                {mode === 'signup' && (
                  <div className="fgrp">
                    <label className="flbl">Display Name</label>
                    <div className="fwrap">
                      <span className="ficon"><User size={13} /></span>
                      <input
                        type="text" placeholder="Your name" value={name}
                        onChange={e => { setName(e.target.value); clearFieldError('name'); }}
                        className={`ainput${fieldErrors.name ? ' err' : ''}`}
                      />
                    </div>
                    {fieldErrors.name && <div className="ferr">{fieldErrors.name}</div>}
                  </div>
                )}

                <div className="fgrp">
                  <label className="flbl">Email Address</label>
                  <div className="fwrap">
                    <span className="ficon"><Mail size={13} /></span>
                    <input
                      type="email" placeholder="you@example.com" value={email}
                      onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
                      className={`ainput${fieldErrors.email ? ' err' : ''}`}
                    />
                  </div>
                  {fieldErrors.email && <div className="ferr">{fieldErrors.email}</div>}
                </div>

                <div className="fgrp" style={{ marginBottom: 18 }}>
                  <label className="flbl">Password</label>
                  <div className="fwrap">
                    <span className="ficon"><Lock size={13} /></span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? 'Min. 10 characters' : '••••••••'}
                      value={pass}
                      onChange={e => { setPass(e.target.value); clearFieldError('pass'); }}
                      className={`ainput pr${fieldErrors.pass ? ' err' : ''}`}
                    />
                    <button type="button" className="feye" onClick={() => setShowPass(s => !s)}>
                      {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  {fieldErrors.pass && <div className="ferr">{fieldErrors.pass}</div>}
                </div>
              </>
            )}

            {/* Error banners */}
            {error && !isAlreadyRegistered && (
              <div className="errbanner"><p>{error}</p></div>
            )}
            {isAlreadyRegistered && (
              <div className="errbanner">
                <p>This email is already registered.</p>
                <button className="errlink" type="button" onClick={() => switchMode('login')}>
                  Go to Sign In <ArrowRight size={11} />
                </button>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="asub" disabled={loading || (mode === 'otp' && otp.join('').length < 6)}>
              {loading ? <div className="spin" /> : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'otp' && 'Verify & Continue'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {mode !== 'otp' && (
              <div className="aswitch">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            )}

            {mode === 'otp' && (
              <div style={{ textAlign: 'center' }}>
                <button className="aback" type="button" onClick={() => switchMode('signup')}>
                  ← Change email
                </button>
              </div>
            )}
          </form>

          <div className="auth-ft">
            <p>No wallet needed · No ETH required · Powered by WireFluid</p>
          </div>
        </div>
      </div>
    </>
  );
}
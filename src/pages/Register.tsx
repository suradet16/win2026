import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';

export function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirm) {
      setError('Password ไม่ตรงกัน');
      return;
    }

    if (password.length < 6) {
      setError('Password ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password);
      setMessage('สมัครสำเร็จ! โปรดเช็คอีเมลเพื่อยืนยันบัญชี');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.message || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setMessage('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Grid Overlay */}
      <div className="grid-overlay"></div>
      
      {/* Hero Background Image with Zoom Animation */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80" 
          alt="Background" 
          className="w-full h-full object-cover hero-image"
          style={{
            animation: 'heroZoom 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="glass-strong rounded-3xl shadow-2xl p-10 border border-white/20 fade-up-2">
            {/* Logo */}
            <div className="text-center mb-8 fade-up-3">
              <div className="inline-block w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center text-5xl shadow-2xl mb-4">
                🏆
              </div>
              <h1 className="text-5xl font-black font-manrope gradient-text mb-2">สมัครสมาชิก</h1>
              <p className="text-white/60 text-sm uppercase tracking-wider">Performance Tracking System</p>
            </div>

            {/* Alerts */}
            {(error || message) && (
              <div className="space-y-3 mb-6 fade-up-4">
                {error && <Alert type="error" message={error} />}
                {message && <Alert type="success" message={message} />}
              </div>
            )}

            {/* Form */}
            <form className="space-y-5 fade-up-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white/90 uppercase tracking-wide text-xs">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-indigo-400/50 focus:bg-white/15 transition-all"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white/90 uppercase tracking-wide text-xs">Password</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-indigo-400/50 focus:bg-white/15 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white/90 uppercase tracking-wide text-xs">ยืนยัน Password</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-indigo-400/50 focus:bg-white/15 transition-all"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold py-4 shadow-xl hover:shadow-2xl transition-all disabled:opacity-60 text-white hover:from-indigo-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? <Spinner label="กำลังสมัครสมาชิก" /> : 'สมัครสมาชิก'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6 fade-up-6">
              <div className="flex-1 border-t border-white/20"></div>
              <div className="bg-slate-900/50 rounded-lg px-4 py-2">
                <span className="text-xs uppercase text-white/60">หรือ</span>
              </div>
              <div className="flex-1 border-t border-white/20"></div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 glass border border-white/20 rounded-xl font-semibold py-4 text-white hover:bg-white/15 transition-all fade-up-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              เข้าสู่ระบบด้วย Google
            </button>

            {/* Info */}
            <div className="mt-5 glass rounded-xl p-4 border border-white/10 fade-up-6">
              <p className="text-center text-xs text-white/60 leading-relaxed">
                การสมัครสมาชิก คุณจะได้รับ email ยืนยัน<br />โปรดเช็ค inbox/spam
              </p>
            </div>

            {/* Login Link */}
            <p className="mt-4 text-center text-sm text-white/70 fade-up-6">
              มีบัญชีแล้ว?{' '}
              <Link to="/login" className="text-indigo-300 font-semibold hover:text-indigo-200 transition-colors">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
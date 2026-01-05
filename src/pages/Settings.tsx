import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBackground, backgroundOptions } from '../context/BackgroundContext';
import { supabase } from '../lib/supabaseClient';
import { Alert } from '../components/Alert';
import { Shell } from '../components/Shell';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { backgroundId, setBackgroundId } = useBackground();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);

  async function handleUpdateName() {
    if (!displayName.trim()) {
      setMessage({ tone: 'error', text: 'กรุณากรอกชื่อที่ต้องการแสดง' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() }
      });
      if (error) throw error;
      setMessage({ tone: 'success', text: 'อัปเดตชื่อสำเร็จ!' });
    } catch (err: any) {
      setMessage({ tone: 'error', text: err?.message || 'อัปเดตชื่อไม่สำเร็จ' });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePassword() {
    if (!newPassword || !confirmPassword) {
      setMessage({ tone: 'error', text: 'กรุณากรอกรหัสผ่านใหม่' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ tone: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ tone: 'error', text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      setMessage({ tone: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ tone: 'error', text: err?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') {
      setMessage({ tone: 'error', text: 'กรุณาพิมพ์ DELETE เพื่อยืนยัน' });
      return;
    }
    
    const confirmed = window.confirm('⚠️ คุณแน่ใจหรือไม่? การลบบัญชีจะไม่สามารถกู้คืนได้!');
    if (!confirmed) return;

    setSaving(true);
    setMessage(null);
    try {
      // Delete user data first
      if (user) {
        await supabase.from('daily_executions').delete().eq('user_id', user.id);
        await supabase.from('weekly_reviews').delete().eq('user_id', user.id);
        await supabase.from('user_profiles').delete().eq('user_id', user.id);
      }
      
      // Sign out (actual user deletion requires admin privileges)
      await signOut();
      navigate('/');
      
    } catch (err: any) {
      setMessage({ tone: 'error', text: err?.message || 'ลบบัญชีไม่สำเร็จ' });
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <Shell
      title="ตั้งค่าบัญชี"
      subtitle="จัดการข้อมูลส่วนตัวและความปลอดภัย"
      icon="⚙️"
      active="settings"
      actions={
        <button
          onClick={() => navigate('/app')}
          className="glass rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all"
        >
          กลับ Dashboard
        </button>
      }
    >
      {message && <Alert tone={message.tone} title={message.text} />}

      <div className="space-y-6 max-w-2xl">
        {/* Account Info */}
        <div className="glass-strong rounded-3xl border border-white/15 p-6 lg:p-8 space-y-6 fade-up-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-2xl shadow-lg shadow-sky-500/25">
              👤
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">ข้อมูลบัญชี</h3>
              <p className="text-sm text-white/50">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">ชื่อที่แสดง (Display Name)</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-sky-400/50 focus:bg-white/10 transition-all"
                placeholder="ชื่อของคุณ"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <button
              onClick={handleUpdateName}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 font-semibold text-white hover:shadow-lg hover:shadow-sky-500/25 transition-all disabled:opacity-60"
            >
              {saving ? 'กำลังบันทึก...' : '💾 บันทึกชื่อ'}
            </button>
          </div>
        </div>

        {/* Background Selection */}
        <div className="glass-strong rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6 lg:p-8 space-y-6 fade-up-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/25">
              🖼️
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">พื้นหลัง</h3>
              <p className="text-sm text-violet-400/80">เลือกภาพพื้นหลังที่ชอบ</p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {backgroundOptions.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setBackgroundId(bg.id)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  backgroundId === bg.id
                    ? 'border-violet-400 ring-2 ring-violet-400/50 scale-105'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {bg.thumbnail ? (
                  <img
                    src={bg.thumbnail}
                    alt={bg.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <span className="text-2xl">🚫</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-black/60 py-1 px-1">
                  <span className="text-[10px] text-white font-medium">{bg.name}</span>
                </div>
                {backgroundId === bg.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className="glass-strong rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 lg:p-8 space-y-6 fade-up-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25">
              🔐
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">เปลี่ยนรหัสผ่าน</h3>
              <p className="text-sm text-amber-400/80">ใช้รหัสผ่านที่แข็งแกร่ง</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">รหัสผ่านใหม่</label>
              <input
                type="password"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              onClick={handleUpdatePassword}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-60"
            >
              {saving ? 'กำลังเปลี่ยน...' : '🔑 เปลี่ยนรหัสผ่าน'}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-strong rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6 lg:p-8 space-y-6 fade-up-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/25">
              ⚠️
            </div>
            <div>
              <h3 className="font-bold text-xl text-rose-300">Danger Zone</h3>
              <p className="text-sm text-rose-400/80">การกระทำเหล่านี้ไม่สามารถย้อนกลับได้</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-sm text-rose-200 mb-4">
                ⚠️ การลบบัญชีจะลบข้อมูลทั้งหมดของคุณ รวมถึง Daily Execution, Weekly Review และ Profile
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-rose-300">พิมพ์ "DELETE" เพื่อยืนยัน</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-white placeholder-rose-300/50 focus:outline-none focus:border-rose-400/50 transition-all"
                    placeholder="DELETE"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving || deleteConfirm !== 'DELETE'}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 font-semibold text-white hover:shadow-lg hover:shadow-rose-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? 'กำลังลบ...' : '🗑️ ลบบัญชีถาวร'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Profile */}
        <div className="glass rounded-2xl border border-white/10 p-5 fade-up-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎯</span>
              <div>
                <p className="text-sm font-semibold text-white/80">Win 2026 Profile</p>
                <p className="text-xs text-white/50">ตั้ง Vision และ Strategy ของคุณ</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 rounded-xl glass border border-white/20 text-sm font-semibold text-white hover:bg-white/10 transition-all"
            >
              ไปหน้า Profile →
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

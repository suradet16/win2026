import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Spinner } from '../components/Spinner';
import { Alert } from '../components/Alert';
import { Shell } from '../components/Shell';

interface ProfileForm {
  vision: string;
  win_metrics: string;
  primary_skill: string;
  non_negotiables: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    vision: '',
    win_metrics: '',
    primary_skill: '',
    non_negotiables: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setForm({
            vision: data.vision || '',
            win_metrics: data.win_metrics || '',
            primary_skill: data.primary_skill || '',
            non_negotiables: data.non_negotiables || '',
          });
        }
      } catch (err) {
        console.error('Load profile error:', err);
        setMessage({ tone: 'error', text: 'โหลดข้อมูลไม่สำเร็จ' });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  function handleChange(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('user_profiles').upsert(
        {
          user_id: user.id,
          ...form,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (error) throw error;
      setMessage({ tone: 'success', text: 'บันทึก Win 2026 Profile สำเร็จ!' });
    } catch (err: any) {
      console.error('Save profile error:', err);
      setMessage({ tone: 'error', text: err?.message || 'บันทึกไม่สำเร็จ' });
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <Shell
      title="Win 2026 Profile"
      subtitle="ตั้งครั้งเดียว ทบทวนทุกไตรมาส"
      icon="🎯"
      active="profile"
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

      {loading ? (
        <div className="glass-strong rounded-3xl border border-white/15 p-8 fade-up-3">
          <Spinner label="กำลังโหลดข้อมูล" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 p-8 lg:p-10 fade-up-3">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-4xl lg:text-5xl shadow-2xl shadow-amber-500/25">
                  🎯
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-slate-900 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl lg:text-3xl font-black text-white">Win 2026 Profile</h2>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30">
                    STRATEGY LAYER
                  </span>
                </div>
                <p className="text-white/50 text-sm lg:text-base">
                  กำหนดทิศทางชีวิต 2026 — ตั้งครั้งเดียว ทบทวนทุกไตรมาส
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-black text-white">{form.vision ? '1' : '0'}</div>
                  <div className="text-xs text-white/40">Vision</div>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-black text-white">{form.primary_skill ? '1' : '0'}</div>
                  <div className="text-xs text-white/40">Skill</div>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-black text-white">{form.non_negotiables ? (form.non_negotiables.split('\n').filter(l => l.trim()).length) : '0'}</div>
                  <div className="text-xs text-white/40">Rules</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Vision Card - Full Width */}
            <div className="lg:col-span-2 group animated-border animated-border-amber rounded-3xl">
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 lg:p-8 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25">
                        🏆
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-white">Win 2026 Vision</h3>
                        <p className="text-sm text-amber-400/80">31 ธ.ค. 2026 ชีวิตฉันจะเป็นยังไง?</p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-bold">
                      NORTH STAR
                    </div>
                  </div>

                  {/* Vision Input */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white/80">Vision Statement</label>
                      <span className="text-xs text-white/30">{form.vision.length} chars</span>
                    </div>
                    <textarea
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-base text-white placeholder-white/30 min-h-[140px] focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none font-medium"
                      placeholder="ภายใน 31 ธ.ค. 2026 ฉันจะ..."
                      value={form.vision}
                      onChange={(e) => handleChange('vision', e.target.value)}
                    />
                  </div>

                  {/* Win Metrics */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <label className="text-sm font-semibold text-white/80">วัดว่าชนะได้ยังไง (Win Metrics)</label>
                    </div>
                    <textarea
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white placeholder-white/30 min-h-[100px] focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
                      placeholder="1. รายได้ถึง X บาท/เดือน&#10;2. สุขภาพ...&#10;3. ความสัมพันธ์..."
                      value={form.win_metrics}
                      onChange={(e) => handleChange('win_metrics', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Skill Card */}
            <div className="group animated-border animated-border-indigo rounded-3xl">
              <div className="relative h-full overflow-hidden rounded-3xl bg-slate-900 p-6 lg:p-8 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/25">
                      ⚡
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white">Primary Skill</h3>
                      <p className="text-sm text-indigo-400/80">Skill เดียวที่จะ all-in</p>
                    </div>
                  </div>

                  {/* Skill Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-white/80">Skill ที่จะ Leverage</label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-base text-white placeholder-white/30 focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 transition-all font-medium"
                      placeholder="เช่น: AI Engineering"
                      value={form.primary_skill}
                      onChange={(e) => handleChange('primary_skill', e.target.value)}
                    />
                    <p className="text-xs text-white/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      เลือก 1 อย่างที่จะทำให้เก่งขึ้นทุกวัน
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Non-negotiables Card */}
            <div className="group animated-border animated-border-rose rounded-3xl">
              <div className="relative h-full overflow-hidden rounded-3xl bg-slate-900 p-6 lg:p-8 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/25">
                      🛡️
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white">Non-negotiables</h3>
                      <p className="text-sm text-rose-400/80">สิ่งที่ห้ามแลก ไม่ว่าจะยุ่งแค่ไหน</p>
                    </div>
                  </div>

                  {/* Rules Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-white/80">กฎเหล็กของชีวิต</label>
                    <textarea
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white placeholder-white/30 min-h-[100px] focus:outline-none focus:border-rose-400/50 focus:ring-2 focus:ring-rose-400/20 transition-all resize-none"
                      placeholder="- นอน 7 ชม.&#10;- ออกกำลังกาย 3x/week&#10;- เวลาครอบครัว"
                      value={form.non_negotiables}
                      onChange={(e) => handleChange('non_negotiables', e.target.value)}
                    />
                    <p className="text-xs text-white/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      ถ้าเสียสิ่งนี้ไป ชนะก็ไม่มีความหมาย
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Section */}
          <div className="animated-border animated-border-emerald rounded-3xl">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 lg:p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">💾</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">พร้อมบันทึก Strategy?</h3>
                  <p className="text-sm text-white/50">Profile นี้จะเป็น North Star ตลอดปี 2026</p>
                </div>
              </div>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-60"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      ✨ บันทึก Win 2026 Profile
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
          </div>

          {/* Tips Card */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <span className="text-lg">💡</span>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white/80">เมื่อไหร่ควรกลับมาแก้?</h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    ทบทวนทุก 3 เดือน
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    เจอโอกาสใหม่
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Win Metrics บรรลุแล้ว
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

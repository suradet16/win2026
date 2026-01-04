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
      active="dashboard"
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
        <div className="space-y-6">
          {/* Vision Section */}
          <div className="glass-strong rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 lg:p-8 space-y-5 fade-up-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <div className="font-bold text-lg text-amber-300">Win 2026 Vision</div>
                <div className="text-xs text-white/50">ภายใน 31 ธ.ค. 2026 ชีวิตฉันจะเป็นยังไง?</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Vision Statement</label>
              <textarea
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 min-h-[120px] focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all resize-y"
                placeholder="ภายใน 31 ธ.ค. 2026 ฉันจะ..."
                value={form.vision}
                onChange={(e) => handleChange('vision', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white">วัดว่าชนะได้ยังไง</label>
              <textarea
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 min-h-[100px] focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all resize-y"
                placeholder="1. รายได้ถึง X บาท/เดือน&#10;2. สุขภาพ...&#10;3. ..."
                value={form.win_metrics}
                onChange={(e) => handleChange('win_metrics', e.target.value)}
              />
              <div className="text-xs text-white/40">ใส่ตัวเลขหรือสถานะที่ชัดเจน จะได้รู้ว่าชนะจริงหรือยัง</div>
            </div>
          </div>

          {/* Primary Skill */}
          <div className="glass-strong rounded-3xl border border-indigo-500/30 bg-indigo-500/5 p-6 lg:p-8 space-y-5 fade-up-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <div className="font-bold text-lg text-indigo-300">Primary Skill</div>
                <div className="text-xs text-white/50">Skill เดียวที่จะ all-in ตลอดปี</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Skill ที่จะ leverage</label>
              <input
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-indigo-400/50 focus:bg-white/10 transition-all"
                placeholder="เช่น: AI/ML Engineering, Sales, Content Creation"
                value={form.primary_skill}
                onChange={(e) => handleChange('primary_skill', e.target.value)}
              />
              <div className="text-xs text-white/40">เลือก 1 อย่างเท่านั้น ที่จะทำให้เก่งขึ้นทุกวัน</div>
            </div>
          </div>

          {/* Non-negotiables */}
          <div className="glass-strong rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6 lg:p-8 space-y-5 fade-up-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div>
                <div className="font-bold text-lg text-rose-300">Non-negotiables</div>
                <div className="text-xs text-white/50">สิ่งที่ห้ามแลก ไม่ว่าจะยุ่งแค่ไหน</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white">สิ่งที่ไม่ยอมเสีย</label>
              <textarea
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 min-h-[100px] focus:outline-none focus:border-rose-400/50 focus:bg-white/10 transition-all resize-y"
                placeholder="- นอน 7 ชม.&#10;- ออกกำลังกาย 3 ครั้ง/สัปดาห์&#10;- เวลาครอบครัว"
                value={form.non_negotiables}
                onChange={(e) => handleChange('non_negotiables', e.target.value)}
              />
              <div className="text-xs text-white/40">ถ้าเสียสิ่งนี้ไป ชนะก็ไม่มีความหมาย</div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary rounded-2xl py-4 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60 fade-up-6"
          >
            {saving ? 'กำลังบันทึก...' : '💾 บันทึก Win 2026 Profile'}
          </button>

          {/* Info Box */}
          <div className="glass rounded-2xl border border-white/10 p-5 fade-up-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div className="text-sm text-white/60 space-y-2">
                <p><strong className="text-white/80">เมื่อไหร่ควรกลับมาแก้?</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>ทบทวนทุก 3 เดือน (ไตรมาส)</li>
                  <li>เมื่อเจอโอกาสใหม่ที่เปลี่ยนทิศทาง</li>
                  <li>เมื่อ Win Metrics บรรลุแล้ว</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

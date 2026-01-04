import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Spinner } from '../components/Spinner';
import { Alert } from '../components/Alert';
import { Shell } from '../components/Shell';

interface WeeklyForm {
  one_thing: string;
  win_condition: string;
  win_reason: string;
  lose_reason: string;
  cut_next: string;
  outputs: string;
}

interface WeekStats {
  deepWorkRate: number;
  shipCount: number;
  healthRate: number;
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(start: Date) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const formatShort = (d: Date) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  return `สัปดาห์ ${formatShort(start)} - ${formatShort(end)}`;
}

export function WeeklyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [vision, setVision] = useState<string | null>(null);
  const [suggestedOutputs, setSuggestedOutputs] = useState<string[]>([]);
  const [form, setForm] = useState<WeeklyForm>({
    one_thing: '',
    win_condition: '',
    win_reason: '',
    lose_reason: '',
    cut_next: '',
    outputs: '',
  });
  const [stats, setStats] = useState<WeekStats>({ deepWorkRate: 0, shipCount: 0, healthRate: 0 });

  const weekStart = useMemo(() => getWeekStart(new Date()), []);
  const weekStartStr = useMemo(() => {
    const d = weekStart;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [weekStart]);
  const weekLabel = useMemo(() => formatWeekLabel(weekStart), [weekStart]);

  useEffect(() => {
    async function fetchWeekly() {
      if (!user) return;
      try {
        setLoading(true);

        const [{ data: weeklyData, error: weeklyError }, { data: dailyData, error: dailyError }, { data: profileData, error: profileError }] = await Promise.all([
          supabase
            .from('weekly_reviews')
            .select('*')
            .eq('user_id', user.id)
            .eq('week_start_date', weekStartStr)
            .single(),
          supabase
            .from('daily_executions')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', weekStartStr)
            .order('date', { ascending: false }),
          supabase
            .from('user_profiles')
            .select('vision')
            .eq('user_id', user.id)
            .single(),
        ]);

        if (weeklyError && weeklyError.code !== 'PGRST116') throw weeklyError;
        if (weeklyData) {
          setForm({
            one_thing: weeklyData.one_thing || '',
            win_condition: weeklyData.win_condition || '',
            win_reason: weeklyData.win_reason || '',
            lose_reason: weeklyData.lose_reason || '',
            cut_next: weeklyData.cut_next || '',
            outputs: weeklyData.outputs || '',
          });
        }

        if (profileError && profileError.code !== 'PGRST116') {
          console.log('No profile found');
        }
        if (profileData?.vision) {
          setVision(profileData.vision);
        }

        if (dailyError && dailyError.code !== 'PGRST116') throw dailyError;
        if (dailyData) {
          const total = dailyData.length || 0;
          if (total > 0) {
            const deepWorkCount = dailyData.filter((d: any) => d.deep_work).length;
            const shipCount = dailyData.filter((d: any) => d.ship).length;
            const healthCount = dailyData.filter((d: any) => d.health_min).length;
            setStats({
              deepWorkRate: Math.round((deepWorkCount / total) * 100),
              shipCount,
              healthRate: Math.round((healthCount / total) * 100),
            });
            
            // Extract shipped outputs for suggestion
            const shippedOutputs = dailyData
              .filter((d: any) => d.ship && d.output_name)
              .map((d: any) => d.output_name as string);
            setSuggestedOutputs(shippedOutputs);
          } else {
            setStats({ deepWorkRate: 0, shipCount: 0, healthRate: 0 });
          }
        }
      } catch (err) {
        console.error('Load weekly error:', err);
        setMessage({ tone: 'error', text: 'โหลดข้อมูลสัปดาห์นี้ไม่สำเร็จ' });
      } finally {
        setLoading(false);
      }
    }

    fetchWeekly();
  }, [user, weekStartStr]);

  function updateLocal(field: keyof WeeklyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function upsert(payload: Partial<WeeklyForm>) {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('weekly_reviews').upsert(
        {
          user_id: user.id,
          week_start_date: weekStartStr,
          ...form,
          ...payload,
        },
        { onConflict: 'user_id,week_start_date' }
      );
      if (error) throw error;
      setMessage({ tone: 'success', text: 'บันทึกแล้ว' });
    } catch (err: any) {
      console.error('Save weekly error:', err);
      setMessage({ tone: 'error', text: err?.message || 'บันทึกไม่สำเร็จ' });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof WeeklyForm, value: string) {
    updateLocal(field, value);
  }

  async function handleSave() {
    await upsert({});
  }
  
  if (!user) return null;

  return (
    <Shell
      title="Weekly Review"
      subtitle="ใช้ 10 นาที | ทำทุกวันอาทิตย์"
      icon="📅"
      active="weekly"
      actions={
        <button
          onClick={() => navigate('/app')}
          className="glass rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all"
        >
          กลับ Dashboard
        </button>
      }
    >
      <div className="glass-strong rounded-3xl border border-white/15 p-6 fade-up-3">
        <div className="text-sm text-white/50 uppercase tracking-wider">ช่วงสัปดาห์</div>
        <div className="text-xl font-bold text-white mt-1">{weekLabel}</div>
      </div>

      {message && <Alert tone={message.tone} title={message.text} />}

      {loading ? (
        <div className="glass-strong rounded-3xl border border-white/15 p-8 fade-up-4">
          <Spinner label="กำลังโหลดข้อมูลสัปดาห์นี้" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 fade-up-4">
            <StatCard label="Deep Work Rate" value={`${stats.deepWorkRate}%`} tone="green" />
            <StatCard label="Ship Count" value={`${stats.shipCount}/7`} tone="blue" />
            <StatCard label="Health Rate" value={`${stats.healthRate}%`} tone="amber" />
          </div>

          {/* Weekly One Thing - Separate Card */}
          <div className="glass-strong rounded-3xl border border-indigo-500/30 bg-indigo-500/5 p-6 lg:p-8 space-y-5 fade-up-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <div className="font-bold text-lg text-indigo-300">Weekly One Thing</div>
                <div className="text-xs text-white/50">สัปดาห์นี้ต้องชนะเรื่องเดียวนี้</div>
              </div>
            </div>

            {/* Vision Reminder */}
            {vision ? (
              <div className="glass rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-start gap-2">
                  <span className="text-lg">🏆</span>
                  <div className="text-sm">
                    <span className="text-amber-300 font-semibold">Win 2026: </span>
                    <span className="text-white/70">{vision}</span>
                  </div>
                </div>
                <div className="text-xs text-white/40 mt-2 ml-7">One Thing ต้องพาไปถึง Vision นี้</div>
              </div>
            ) : (
              <div 
                onClick={() => navigate('/profile')}
                className="glass rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 cursor-pointer hover:bg-amber-500/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <span className="text-sm text-amber-300">ยังไม่ได้ตั้ง Win 2026 Vision</span>
                  </div>
                  <span className="text-white/40">→</span>
                </div>
              </div>
            )}
            
            <TextInput
              label="สัปดาห์นี้ถ้าชนะได้เรื่องเดียว คือ"
              placeholder="สิ่งสำคัญที่สุดที่ต้องทำให้เสร็จ"
              value={form.one_thing}
              onChange={(val) => handleChange('one_thing', val)}
            />
            
            <TextInput
              label="วัดว่าชนะได้ยังไง"
              placeholder="เช่น: ส่ง draft ให้ mentor ภายในศุกร์"
              value={form.win_condition}
              onChange={(val) => handleChange('win_condition', val)}
            />

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
            >
              {saving ? 'กำลังบันทึก...' : '🎯 บันทึก One Thing'}
            </button>
          </div>

          {/* Review Form */}
          <div className="glass-strong rounded-3xl border border-white/15 p-6 lg:p-8 space-y-6 fade-up-6">
            <div className="flex items-center gap-2 text-white/60">
              <span className="text-xl">📋</span>
              <div className="text-sm font-semibold uppercase tracking-wider">Weekly Review</div>
            </div>

            <TextArea
              label="① สัปดาห์นี้ชนะเพราะ"
              placeholder="คิดถึงสิ่งที่ทำให้สัปดาห์นี้ดีขึ้น"
              value={form.win_reason}
              onChange={(val) => handleChange('win_reason', val)}
            />
            
            <TextArea
              label="② แพ้เพราะ"
              placeholder="มองหาสาเหตุจริง ๆ ไม่ใช่แค่อาการ"
              value={form.lose_reason}
              onChange={(val) => handleChange('lose_reason', val)}
            />
            
            <TextInput
              label="③ สิ่งที่ควรตัดสัปดาห์หน้า (1 อย่าง)"
              placeholder="เลือก 1 สิ่งที่กินเวลา แต่ไม่ได้ช่วย Win 2026"
              value={form.cut_next}
              onChange={(val) => handleChange('cut_next', val)}
            />
            
            {/* Output Section with Suggestions */}
            <div className="space-y-3">
              <TextArea
                label="④ Output ทั้งสัปดาห์"
                placeholder={'1. \n2. \n3. \n\nลิสต์สิ่งที่ Ship ออกมาจริง ๆ'}
                value={form.outputs}
                onChange={(val) => handleChange('outputs', val)}
              />
              
              {/* Suggested Outputs from Daily */}
              {suggestedOutputs.length > 0 && (
                <div className="glass rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold">
                      <span>💡</span>
                      Shipped จาก Daily ({suggestedOutputs.length})
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const outputList = suggestedOutputs.map((o, i) => `${i + 1}. ${o}`).join('\n');
                        handleChange('outputs', form.outputs ? `${form.outputs}\n${outputList}` : outputList);
                      }}
                      className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg font-semibold transition-all"
                    >
                      ✨ เพิ่มทั้งหมด
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedOutputs.map((output, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const newOutput = form.outputs ? `${form.outputs}\n• ${output}` : `• ${output}`;
                          handleChange('outputs', newOutput);
                        }}
                        className="text-xs bg-white/5 hover:bg-white/10 text-white/80 px-3 py-1.5 rounded-lg transition-all border border-white/10"
                      >
                        + {output}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full btn-primary rounded-2xl py-4 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
            >
              {saving ? 'กำลังบันทึก...' : '💾 บันทึก Weekly Review'}
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'green' | 'blue' | 'amber' }) {
  const toneClass = {
    green: 'metric-success glow-emerald',
    blue: 'metric-info glow-sky',
    amber: 'metric-warning glow-amber',
  }[tone];

  return (
    <div className={`${toneClass} status-badge rounded-2xl p-6 card-hover flex flex-col gap-2`}>
      <div className="text-sm font-semibold text-white/80">{label}</div>
      <div className="text-4xl font-black font-manrope">{value}</div>
    </div>
  );
}

function TextArea({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-bold text-white">{label}</div>
      <textarea
        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 min-h-[140px] focus:outline-none focus:border-sky-400/50 focus:bg-white/10 transition-all resize-y"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-bold text-white">{label}</div>
      <input
        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-sky-400/50 focus:bg-white/10 transition-all"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Spinner } from '../components/Spinner';
import { Alert } from '../components/Alert';
import { Shell } from '../components/Shell';

interface WeeklyForm {
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
  const [form, setForm] = useState<WeeklyForm>({
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

        const [{ data: weeklyData, error: weeklyError }, { data: dailyData, error: dailyError }] = await Promise.all([
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
        ]);

        if (weeklyError && weeklyError.code !== 'PGRST116') throw weeklyError;
        if (weeklyData) {
          setForm({
            win_reason: weeklyData.win_reason || '',
            lose_reason: weeklyData.lose_reason || '',
            cut_next: weeklyData.cut_next || '',
            outputs: weeklyData.outputs || '',
          });
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

  async function handleBlur(field: keyof WeeklyForm, value: string) {
    updateLocal(field, value);
    await upsert({ [field]: value });
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

          {/* Review Form */}
          <div className="glass-strong rounded-3xl border border-white/15 p-6 lg:p-8 space-y-6 fade-up-5">
            <TextArea
              label="① สัปดาห์นี้ชนะเพราะ"
              placeholder="คิดถึงสิ่งที่ทำให้สัปดาห์นี้ดีขึ้น"
              defaultValue={form.win_reason}
              onBlur={(val) => handleBlur('win_reason', val)}
            />
            
            <TextArea
              label="② แพ้เพราะ"
              placeholder="มองหาสาเหตุจริง ๆ ไม่ใช่แค่อาการ"
              defaultValue={form.lose_reason}
              onBlur={(val) => handleBlur('lose_reason', val)}
            />
            
            <TextInput
              label="③ สิ่งที่ควรตัดสัปดาห์หน้า (1 อย่าง)"
              placeholder="เลือก 1 สิ่งที่กินเวลา แต่ไม่ได้ช่วย Win 2026"
              defaultValue={form.cut_next}
              onBlur={(val) => handleBlur('cut_next', val)}
            />
            
            <TextArea
              label="④ Output ทั้งสัปดาห์"
              placeholder={'1. \n2. \n3. \n\nลิสต์สิ่งที่ Ship ออกมาจริง ๆ'}
              defaultValue={form.outputs}
              onBlur={(val) => handleBlur('outputs', val)}
            />

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
  defaultValue,
  onBlur,
}: {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  onBlur: (value: string) => void | Promise<void>;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-bold text-white">{label}</div>
      <textarea
        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 min-h-[140px] focus:outline-none focus:border-sky-400/50 focus:bg-white/10 transition-all resize-y"
        placeholder={placeholder}
        defaultValue={defaultValue}
        onBlur={(e) => onBlur(e.target.value)}
      />
    </div>
  );
}

function TextInput({
  label,
  placeholder,
  defaultValue,
  onBlur,
}: {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  onBlur: (value: string) => void | Promise<void>;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-bold text-white">{label}</div>
      <input
        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-sky-400/50 focus:bg-white/10 transition-all"
        placeholder={placeholder}
        defaultValue={defaultValue}
        onBlur={(e) => onBlur(e.target.value)}
      />
    </div>
  );
}
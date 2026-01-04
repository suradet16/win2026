import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Spinner } from '../components/Spinner';
import { Alert } from '../components/Alert';
import { Shell } from '../components/Shell';

interface DailyRecord {
  deep_work: boolean;
  ship: boolean;
  health_min: boolean;
  bad_day: boolean;
  output_name: string | null;
  noise: string | null;
  tomorrow_focus: string | null;
}

export function DailyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'standard' | 'bad'>('standard');
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [yesterdayFocus, setYesterdayFocus] = useState<string | null>(null);
  const [form, setForm] = useState<DailyRecord>({
    deep_work: false,
    ship: false,
    health_min: false,
    bad_day: false,
    output_name: '',
    noise: '',
    tomorrow_focus: '',
  });

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  useEffect(() => {
    async function fetchDaily() {
      try {
        setLoading(true);
        
        // Fetch today's data and yesterday's tomorrow_focus in parallel
        const [{ data, error }, { data: yesterdayData, error: yesterdayError }] = await Promise.all([
          supabase
            .from('daily_executions')
            .select('*')
            .eq('user_id', user?.id)
            .eq('date', todayStr)
            .single(),
          supabase
            .from('daily_executions')
            .select('tomorrow_focus')
            .eq('user_id', user?.id)
            .eq('date', yesterdayStr)
            .single(),
        ]);

        if (error && error.code !== 'PGRST116') throw error;
        if (yesterdayError && yesterdayError.code !== 'PGRST116') {
          console.log('No yesterday data found');
        }

        // Set yesterday's tomorrow_focus as suggestion
        if (yesterdayData?.tomorrow_focus) {
          setYesterdayFocus(yesterdayData.tomorrow_focus);
        }

        if (data) {
          setForm({
            deep_work: !!data.deep_work,
            ship: !!data.ship,
            health_min: !!data.health_min,
            bad_day: !!data.bad_day,
            output_name: data.output_name || '',
            noise: data.noise || '',
            tomorrow_focus: data.tomorrow_focus || '',
          });
          setMode(data.bad_day ? 'bad' : 'standard');
        }
      } catch (err) {
        console.error('Load daily error:', err);
        setMessage({ tone: 'error', text: 'โหลดข้อมูลวันนี้ไม่สำเร็จ' });
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchDaily();
  }, [todayStr, yesterdayStr, user]);

  function updateLocal(field: keyof DailyRecord, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function upsert(payload: Partial<DailyRecord>, options?: { showSuccess?: boolean }) {
    if (!user) return;
    const showSuccess = options?.showSuccess ?? false;
    if (showSuccess) {
      setSaving(true);
      setMessage(null);
    }
    try {
      const { error } = await supabase.from('daily_executions').upsert(
        {
          user_id: user.id,
          date: todayStr,
          ...form,
          ...payload,
        },
        { onConflict: 'user_id,date' }
      );
      if (error) throw error;
      if (showSuccess) {
        setMessage({ tone: 'success', text: 'บันทึกแล้ว' });
      }
    } catch (err: any) {
      console.error('Save daily error:', err);
      setMessage({ tone: 'error', text: err?.message || 'บันทึกไม่สำเร็จ' });
    } finally {
      if (showSuccess) setSaving(false);
    }
  }

  async function handleToggle(field: keyof Pick<DailyRecord, 'deep_work' | 'ship' | 'health_min' | 'bad_day'>) {
    const next = !form[field];
    updateLocal(field, next);
    if (field === 'bad_day') {
      setMode(next ? 'bad' : 'standard');
    }
    await upsert({ [field]: next });
  }

  async function handleMode(nextMode: 'standard' | 'bad') {
    setMode(nextMode);
    const isBad = nextMode === 'bad';
    updateLocal('bad_day', isBad);
    await upsert({ bad_day: isBad });
  }

  async function handleSaveAll() {
    await upsert({}, { showSuccess: true });
  }
  
  if (!user) return null;

  return (
    <Shell
      title="Daily Execution"
      subtitle="ใช้ 2-3 นาที | เช็คตอนจบวันเท่านั้น"
      icon="📝"
      active="daily"
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
        <div className="text-sm text-white/50 uppercase tracking-wider">วันที่</div>
        <div className="text-xl font-bold text-white mt-1">{todayLabel}</div>
      </div>

      {message && <Alert tone={message.tone} title={message.text} />}

      {loading ? (
        <div className="glass-strong rounded-3xl border border-white/15 p-8 fade-up-4">
          <Spinner label="กำลังโหลดข้อมูลวันนี้" />
        </div>
      ) : (
        <div className="glass-strong rounded-3xl border border-white/15 p-6 lg:p-8 space-y-6 fade-up-4">
          {/* Yesterday's Focus Suggestion */}
          {yesterdayFocus && !form.output_name && (
            <div className="glass rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <div className="font-semibold text-indigo-300 text-sm">เมื่อวานวางแผนไว้ว่า</div>
              </div>
              <div className="text-white/90 font-medium">{yesterdayFocus}</div>
              <button
                onClick={() => {
                  updateLocal('output_name', yesterdayFocus);
                  upsert({ output_name: yesterdayFocus });
                }}
                className="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg font-semibold transition-all"
              >
                ✨ ใช้เป็น Output วันนี้
              </button>
            </div>
          )}

          {/* Mode Selection */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleMode('standard')}
              className={`rounded-full px-5 py-3 text-sm font-semibold border transition-all ${
                mode === 'standard'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-200 border-emerald-400/60 shadow-lg shadow-emerald-500/20'
                  : 'glass text-white/70 border-white/20 hover:bg-white/10'
              }`}
            >
              🟢 Standard Day
            </button>
            <button
              onClick={() => handleMode('bad')}
              className={`rounded-full px-5 py-3 text-sm font-semibold border transition-all ${
                mode === 'bad'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border-amber-400/60 shadow-lg shadow-amber-500/20'
                  : 'glass text-white/70 border-white/20 hover:bg-white/10'
              }`}
            >
              🔴 Bad Day Mode
            </button>
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            <CheckRow
              label="Deep Work ≥ 45 นาที"
              description={mode === 'bad' ? 'โหมดพัง: 25 นาทีถือว่าผ่าน' : 'มี focused work ที่ทำงานจริง'}
              checked={form.deep_work}
              onToggle={() => handleToggle('deep_work')}
              mode={mode}
            />
            <CheckRow
              label="Ship อะไรบางอย่าง"
              description="มี output ที่จับต้องได้ ✅ draft / note / framework = นับ"
              checked={form.ship}
              onToggle={() => handleToggle('ship')}
              mode={mode}
              inputPlaceholder={mode === 'bad' ? 'Output เล็กที่สุด' : 'ชื่อ output (3-5 คำ)'}
              inputValue={form.output_name || ''}
              onInputBlur={async (val) => {
                updateLocal('output_name', val);
                await upsert({ output_name: val });
              }}
            />
            <CheckRow
              label="Noise วันนี้"
              description="สิ่งที่ไม่พาไป Win 2026"
              checked={!!form.noise}
              onToggle={() => {}}
              mode={mode}
              inputPlaceholder="คือ: ________"
              inputValue={form.noise || ''}
              onInputBlur={async (val) => {
                updateLocal('noise', val);
                await upsert({ noise: val });
              }}
            />
            <CheckRow
              label="สุขภาพผ่านขั้นต่ำ"
              description="นอนพอ / เคลื่อนไหว / ไม่พัง"
              checked={form.health_min}
              onToggle={() => handleToggle('health_min')}
              mode={mode}
            />
            <CheckRow
              label="Tomorrow Focus"
              description="พรุ่งนี้ ถ้าชนะได้เรื่องเดียว คือ"
              checked={!!form.tomorrow_focus}
              onToggle={() => {}}
              mode={mode}
              inputPlaceholder="→ ___________"
              inputValue={form.tomorrow_focus || ''}
              onInputBlur={async (val) => {
                updateLocal('tomorrow_focus', val);
                await upsert({ tomorrow_focus: val });
              }}
            />
            {mode === 'bad' && (
              <CheckRow
                label="ใช้ Bad Day Mode"
                description="ติ๊กเพื่อบันทึกว่าใช้โหมดนี้"
                checked={form.bad_day}
                onToggle={() => handleToggle('bad_day')}
                mode={mode}
              />
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full btn-primary rounded-2xl py-4 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
          >
            {saving ? 'กำลังบันทึก...' : '💾 บันทึก Daily Execution'}
          </button>
        </div>
      )}
    </Shell>
  );
}

interface CheckRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
  mode?: 'standard' | 'bad';
  inputPlaceholder?: string;
  inputValue?: string;
  onInputBlur?: (value: string) => Promise<void> | void;
}

function CheckRow({
  label,
  description,
  checked,
  onToggle,
  mode = 'standard',
  inputPlaceholder,
  inputValue,
  onInputBlur,
}: CheckRowProps) {
  const isBadDay = mode === 'bad';
  
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all ${
        checked 
          ? isBadDay
            ? 'bg-gradient-to-br from-amber-500/15 to-orange-500/10 border-amber-400/40 shadow-lg shadow-amber-500/10' 
            : 'metric-success border-emerald-400/30 shadow-lg' 
          : isBadDay
            ? 'bg-slate-800/40 border-slate-600/30 hover:border-slate-500/40'
            : 'glass border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center text-xl transition-all ${
            checked 
              ? isBadDay
                ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/30' 
                : 'bg-emerald-500 border-emerald-400 text-white shadow-lg' 
              : isBadDay
                ? 'border-slate-500/40 text-transparent hover:border-slate-400/60'
                : 'border-white/30 text-transparent hover:border-white/50'
          }`}
        >
          ✓
        </button>
        <div className="flex-1">
          <div className={`text-base font-bold ${isBadDay && !checked ? 'text-white/70' : 'text-white'}`}>
            {label}
          </div>
          {description && (
            <div className={`text-sm mt-1 ${isBadDay && !checked ? 'text-white/40' : 'text-white/60'}`}>
              {description}
            </div>
          )}
        </div>
      </div>

      {typeof inputPlaceholder === 'string' && onInputBlur && (
        <input
          className={`w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none transition-all ${
            isBadDay
              ? 'border-amber-400/20 bg-slate-800/60 focus:border-amber-400/50 focus:bg-slate-800/80'
              : 'border-white/20 bg-white/5 focus:border-sky-400/50 focus:bg-white/10'
          }`}
          placeholder={inputPlaceholder}
          defaultValue={inputValue}
          onBlur={(e) => onInputBlur(e.target.value.trim())}
        />
      )}
    </div>
  );
}
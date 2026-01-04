import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Spinner } from '../components/Spinner';
import { Shell } from '../components/Shell';
import { useAuth } from '../context/AuthContext';

interface TodayStats {
  deep_work: boolean;
  ship: boolean;
  health_min: boolean;
  tomorrow_focus: string | null;
}

interface WeekStats {
  deepWorkRate: number;
  shipCount: number;
  healthRate: number;
}

interface WarningSignals {
  shipStreak: number;     // consecutive days without shipping
  deepWorkStreak: number; // consecutive days without deep work
  healthStreak: number;   // consecutive days without health
  badDayStreak: number;   // consecutive bad days
}

export function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<TodayStats | null>(null);
  const [week, setWeek] = useState<WeekStats>({ deepWorkRate: 0, shipCount: 0, healthRate: 0 });
  const [warnings, setWarnings] = useState<WarningSignals>({ shipStreak: 0, deepWorkStreak: 0, healthStreak: 0, badDayStreak: 0 });

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
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];

        const [{ data: todayData, error: todayError }, { data: weekData, error: weekError }] = await Promise.all([
          supabase
            .from('daily_executions')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', todayStr)
            .single(),
          supabase
            .from('daily_executions')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', weekAgoStr)
            .order('date', { ascending: false }),
        ]);

        if (todayError && todayError.code !== 'PGRST116') throw todayError;
        if (!todayError) setToday(todayData as TodayStats | null);

        if (weekError && weekError.code !== 'PGRST116') throw weekError;
        if (weekData && weekData.length > 0) {
          const total = weekData.length;
          const deepWorkCount = weekData.filter((d: any) => d.deep_work).length;
          const shipCount = weekData.filter((d: any) => d.ship).length;
          const healthCount = weekData.filter((d: any) => d.health_min).length;
          setWeek({
            deepWorkRate: Math.round((deepWorkCount / total) * 100),
            shipCount,
            healthRate: Math.round((healthCount / total) * 100),
          });

          // Calculate warning streaks (data is sorted descending by date)
          let shipStreak = 0;
          let deepWorkStreak = 0;
          let healthStreak = 0;
          let badDayStreak = 0;

          for (const d of weekData) {
            if (!d.ship) shipStreak++;
            else break;
          }
          for (const d of weekData) {
            if (!d.deep_work) deepWorkStreak++;
            else break;
          }
          for (const d of weekData) {
            if (!d.health_min) healthStreak++;
            else break;
          }
          for (const d of weekData) {
            if (d.bad_day) badDayStreak++;
            else break;
          }

          setWarnings({ shipStreak, deepWorkStreak, healthStreak, badDayStreak });
        } else {
          setWeek({ deepWorkRate: 0, shipCount: 0, healthRate: 0 });
          setWarnings({ shipStreak: 0, deepWorkStreak: 0, healthStreak: 0, badDayStreak: 0 });
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  return (
    <Shell
      title="Control Panel"
      subtitle="ดูวันละ 30 วินาที | อัปเดตอัตโนมัติ"
      icon="🏆"
      active="dashboard"
    >
      {loading ? (
        <div className="glass-strong rounded-3xl border border-white/15 p-8 fade-up-3">
          <Spinner label="กำลังโหลดข้อมูลวันนี้" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Today Section */}
          <section className="space-y-4 fade-up-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 uppercase tracking-wider">
              <span>📍</span>
              Today
            </div>

            <div className="glass-strong glass-shimmer rounded-3xl p-6 lg:p-8 space-y-6 border border-white/15">
              <div className="text-xs text-white/50 uppercase tracking-wider">{todayLabel}</div>

              {/* Today Metrics */}
              <div className="grid md:grid-cols-3 gap-4">
                <MetricCard
                  title="Deep Work"
                  value={today?.deep_work ? '✅' : '❌'}
                  desc={today?.deep_work ? 'เสร็จสมบูรณ์' : 'ยังไม่ผ่าน'}
                  tone="success"
                  active={!!today?.deep_work}
                />
                <MetricCard
                  title="Ship Status"
                  value={today?.ship ? '✅' : '❌'}
                  desc={today?.ship ? 'ส่งมอบแล้ว' : 'ยังไม่ส่ง'}
                  tone="info"
                  active={!!today?.ship}
                />
                <MetricCard
                  title="Health"
                  value={today?.health_min ? '✅' : '❌'}
                  desc={today?.health_min ? 'สุขภาพดี' : 'ยังไม่ถึงขั้นต่ำ'}
                  tone="warning"
                  active={!!today?.health_min}
                />
              </div>

              {/* Tomorrow Focus */}
              <div className="glass rounded-2xl p-5 border border-white/10">
                <div className="text-sm text-white/60 font-semibold mb-2">Tomorrow Focus:</div>
                <div className="text-2xl font-bold font-manrope gradient-text">
                  {today?.tomorrow_focus || 'ยังไม่ได้กำหนด'}
                </div>
              </div>
            </div>
          </section>

          {/* This Week Section */}
          <section className="space-y-4 fade-up-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-400 uppercase tracking-wider">
              <span>📊</span>
              This Week
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <WeekCard 
                label="Deep Work Rate" 
                value={`${week.deepWorkRate}%`} 
                tone="success" 
                hint="ทุกวันสำเร็จ" 
              />
              <WeekCard 
                label="Ship Count" 
                value={`${week.shipCount}`} 
                tone="info" 
                hint="วัน" 
              />
              <WeekCard 
                label="Health Rate" 
                value={`${week.healthRate}%`} 
                tone="warning" 
                hint="สุขภาพเต็ม" 
              />
            </div>
          </section>

          {/* Warning & Tools Section */}
          <section className="grid lg:grid-cols-2 gap-6 fade-up-5">
            {/* Warning Signals */}
            <div className="glass-strong rounded-3xl p-6 lg:p-8 border border-rose-500/30">
              <div className="flex items-center gap-2 text-lg font-bold text-rose-400 mb-6">
                <span>🚨</span>
                WARNING SIGNALS
              </div>
              
              {/* Dynamic Warnings */}
              <ul className="space-y-3 text-sm mb-6">
                <WarningItem
                  streak={warnings.shipStreak}
                  threshold={2}
                  text={`${warnings.shipStreak} วันติด Ship = No`}
                />
                <WarningItem
                  streak={warnings.deepWorkStreak}
                  threshold={3}
                  text={`${warnings.deepWorkStreak} วันติด Deep Work = No`}
                />
                <WarningItem
                  streak={warnings.healthStreak}
                  threshold={2}
                  text={`${warnings.healthStreak} วันติด Health Min = No`}
                />
                {warnings.badDayStreak > 0 && (
                  <li className="flex items-center gap-3 text-amber-400 font-medium">
                    <span className="text-lg">⚠️</span>
                    <span>{warnings.badDayStreak} วันติดใช้ Bad Day Mode</span>
                  </li>
                )}
              </ul>

              {/* Alert when danger */}
              {(warnings.shipStreak >= 2 || warnings.deepWorkStreak >= 3 || warnings.healthStreak >= 2) ? (
                <div className="glass rounded-2xl p-4 border border-rose-500/40 bg-rose-500/10">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-xl">🔥</span>
                    <div>
                      <span className="font-bold text-rose-300">แก้ไขทันที:</span>
                      <span className="text-white/80"> ใช้ Bad Day Mode / ลด workload ตอนนี้เลย</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5">✅</span>
                    <div className="text-emerald-300">สถานะปกติ — ไม่มี warning ที่ต้องแก้ไข</div>
                  </div>
                </div>
              )}
            </div>

            {/* Decision Tools */}
            <div className="glass-strong rounded-3xl p-6 lg:p-8 border border-sky-500/30 space-y-4">
              <div className="flex items-center gap-2 text-lg font-bold text-sky-400">
                <span>🧠</span>
                Decision Tools
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wide">(Use Only When Stuck)</div>

              <Callout title="CEO Decision Prompt">
                <div className="space-y-1 text-white/80 text-sm">
                  <div>คุณคือ CEO ของชีวิตฉัน</div>
                  <div>ตัวเลือกที่ฉันลังเลคือ: _______</div>
                  <div>ช่วยตัดสินใจให้เด็ดขาดโดย:</div>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>บอกว่าเลือกอะไร</li>
                    <li>เหตุผลเชิงระบบ (ไม่ใช่อารมณ์)</li>
                    <li>สิ่งที่ต้องยอมเสีย</li>
                  </ol>
                </div>
              </Callout>

              <Callout title="Execution Unblock Prompt">
                <div className="space-y-1 text-white/80 text-sm">
                  <div>คุณคือ Performance Coach</div>
                  <div>งานที่ฉันต้องทำวันนี้คือ: _______</div>
                  <div>ช่วย:</div>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>แตกให้เล็กที่สุด</li>
                    <li>บอก first action ที่ทำได้ใน 5 นาที</li>
                    <li>บอกข้ออ้างที่ฉันกำลังใช้หลบ</li>
                  </ol>
                </div>
              </Callout>

              <div className="glass rounded-2xl p-4 border border-sky-500/20 text-sm text-white/80">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">💬</span>
                  <span>ถ้ายังติด ให้ขอ feedback จากคนที่มี stake ภายในวันนี้</span>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="fade-up-6 text-center text-white/40 text-sm py-8">
            <p>Win 2026 OS © 2026 — ระบบติดตามความสำเร็จส่วนตัว</p>
          </div>
        </div>
      )}
    </Shell>
  );
}

function MetricCard({ 
  title, 
  value, 
  desc, 
  tone,
  active 
}: { 
  title: string; 
  value: string; 
  desc: string; 
  tone: 'success' | 'info' | 'warning';
  active: boolean;
}) {
  const toneClass = {
    success: 'metric-success',
    info: 'metric-info',
    warning: 'metric-warning',
  }[tone];

  const glowClass = active ? {
    success: 'glow-emerald',
    info: 'glow-sky',
    warning: 'glow-amber',
  }[tone] : '';

  return (
    <div className={`${toneClass} ${glowClass} status-badge rounded-2xl p-6 card-hover`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-white/80">{title}</div>
        <div className={`w-2 h-2 rounded-full bg-white/70 ${active ? 'pulse-dot' : ''}`}></div>
      </div>
      <div className="text-5xl font-black mb-2">{value}</div>
      <div className="text-xs text-white/60">{desc}</div>
    </div>
  );
}

function WeekCard({ 
  label, 
  value, 
  tone, 
  hint 
}: { 
  label: string; 
  value: string; 
  tone: 'success' | 'info' | 'warning'; 
  hint: string;
}) {
  const toneClass = {
    success: 'metric-success',
    info: 'metric-info',
    warning: 'metric-warning',
  }[tone];

  return (
    <div className={`${toneClass} glass-shimmer rounded-2xl p-6 card-hover border border-white/10`}>
      <div className="text-sm font-semibold text-white/70 mb-4">{label}</div>
      <div className="text-5xl font-black font-manrope mb-2">{value}</div>
      <div className="text-xs text-white/60">{hint}</div>
    </div>
  );
}

function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="glass rounded-2xl overflow-hidden border border-white/10">
      <summary className="px-5 py-4 font-semibold cursor-pointer hover:bg-white/5 transition-all flex items-center justify-between text-white">
        <span className="text-sm">{title}</span>
        <span className="text-white/60 text-xs">▾</span>
      </summary>
      <div className="px-5 pb-5 pt-2 border-t border-white/10">{children}</div>
    </details>
  );
}

function WarningItem({ 
  streak, 
  threshold, 
  text 
}: { 
  streak: number; 
  threshold: number; 
  text: string;
}) {
  const isDanger = streak >= threshold;
  const isWarning = streak > 0 && streak < threshold;
  
  return (
    <li className={`flex items-center gap-3 transition-all ${
      isDanger ? 'text-rose-400 font-bold' : 
      isWarning ? 'text-amber-400' : 
      'text-white/50'
    }`}>
      <span className="text-lg">
        {isDanger ? '🔴' : isWarning ? '🟡' : '⚪'}
      </span>
      <span>{text}</span>
      {isDanger && <span className="text-xs bg-rose-500/20 px-2 py-0.5 rounded-full">⚠️ เกินเกณฑ์</span>}
    </li>
  );
}
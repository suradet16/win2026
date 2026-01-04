import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Spinner } from '../components/Spinner';
import { Shell } from '../components/Shell';
import clsx from 'clsx';

interface DailyRecord {
  date: string;
  deep_work: boolean;
  ship: boolean;
  health_min: boolean;
  bad_day: boolean;
  output_name: string | null;
  tomorrow_focus: string | null;
}

interface WeeklyRecord {
  week_start_date: string;
  win_reason: string | null;
  lose_reason: string | null;
  cut_next: string | null;
  outputs: string | null;
}

export function HistoryPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<WeeklyRecord[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        setLoading(true);

        const [{ data: dailyData, error: dailyError }, { data: weeklyData, error: weeklyError }] = await Promise.all([
          supabase
            .from('daily_executions')
            .select('date, deep_work, ship, health_min, bad_day, output_name, tomorrow_focus')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(30),
          supabase
            .from('weekly_reviews')
            .select('week_start_date, win_reason, lose_reason, cut_next, outputs')
            .eq('user_id', user.id)
            .order('week_start_date', { ascending: false })
            .limit(12),
        ]);

        if (dailyError) throw dailyError;
        if (weeklyError) throw weeklyError;

        setDailyRecords(dailyData || []);
        setWeeklyRecords(weeklyData || []);
      } catch (err) {
        console.error('Load history error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatWeekRange(startStr: string) {
    const start = new Date(startStr);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    return `${fmt(start)} - ${fmt(end)}`;
  }

  return (
    <Shell
      title="History"
      subtitle="ดูประวัติย้อนหลัง"
      icon="📜"
      active="dashboard"
    >
      {/* Tabs */}
      <div className="flex gap-2 fade-up-3">
        <button
          onClick={() => setTab('daily')}
          className={clsx(
            'px-6 py-3 rounded-xl font-semibold text-sm transition-all',
            tab === 'daily'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
              : 'glass border border-white/10 text-white/70 hover:bg-white/10'
          )}
        >
          📝 Daily ({dailyRecords.length})
        </button>
        <button
          onClick={() => setTab('weekly')}
          className={clsx(
            'px-6 py-3 rounded-xl font-semibold text-sm transition-all',
            tab === 'weekly'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
              : 'glass border border-white/10 text-white/70 hover:bg-white/10'
          )}
        >
          📅 Weekly ({weeklyRecords.length})
        </button>
      </div>

      {loading ? (
        <div className="glass-strong rounded-3xl border border-white/15 p-8 fade-up-4">
          <Spinner label="กำลังโหลดประวัติ" />
        </div>
      ) : (
        <div className="space-y-4 fade-up-4">
          {tab === 'daily' ? (
            dailyRecords.length === 0 ? (
              <div className="glass-strong rounded-3xl border border-white/15 p-8 text-center">
                <div className="text-4xl mb-4">📭</div>
                <div className="text-white/60">ยังไม่มีประวัติรายวัน</div>
              </div>
            ) : (
              dailyRecords.map((record) => (
                <div
                  key={record.date}
                  className={clsx(
                    'glass-strong rounded-2xl border p-5 space-y-3',
                    record.bad_day ? 'border-red-500/30 bg-red-500/5' : 'border-white/15'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white">{formatDate(record.date)}</div>
                    {record.bad_day && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-lg font-semibold">
                        Bad Day
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className={clsx(
                      'flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg',
                      record.deep_work ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'
                    )}>
                      <span>{record.deep_work ? '✅' : '❌'}</span>
                      <span>Deep Work</span>
                    </div>
                    <div className={clsx(
                      'flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg',
                      record.ship ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'
                    )}>
                      <span>{record.ship ? '✅' : '❌'}</span>
                      <span>Ship</span>
                    </div>
                    <div className={clsx(
                      'flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg',
                      record.health_min ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'
                    )}>
                      <span>{record.health_min ? '✅' : '❌'}</span>
                      <span>Health</span>
                    </div>
                  </div>

                  {record.output_name && (
                    <div className="text-sm">
                      <span className="text-white/50">Output: </span>
                      <span className="text-white/90">{record.output_name}</span>
                    </div>
                  )}

                  {record.tomorrow_focus && (
                    <div className="text-sm">
                      <span className="text-white/50">Tomorrow Focus: </span>
                      <span className="text-indigo-300">{record.tomorrow_focus}</span>
                    </div>
                  )}
                </div>
              ))
            )
          ) : (
            weeklyRecords.length === 0 ? (
              <div className="glass-strong rounded-3xl border border-white/15 p-8 text-center">
                <div className="text-4xl mb-4">📭</div>
                <div className="text-white/60">ยังไม่มีประวัติรายสัปดาห์</div>
              </div>
            ) : (
              weeklyRecords.map((record) => (
                <div
                  key={record.week_start_date}
                  className="glass-strong rounded-2xl border border-white/15 p-5 space-y-4"
                >
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span className="text-xl">📅</span>
                    {formatWeekRange(record.week_start_date)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {record.win_reason && (
                      <div className="glass rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5">
                        <div className="text-xs uppercase text-emerald-400 font-semibold mb-2">🏆 ชนะเพราะ</div>
                        <div className="text-sm text-white/80">{record.win_reason}</div>
                      </div>
                    )}
                    {record.lose_reason && (
                      <div className="glass rounded-xl p-4 border border-red-500/20 bg-red-500/5">
                        <div className="text-xs uppercase text-red-400 font-semibold mb-2">❌ แพ้เพราะ</div>
                        <div className="text-sm text-white/80">{record.lose_reason}</div>
                      </div>
                    )}
                  </div>

                  {record.cut_next && (
                    <div className="text-sm">
                      <span className="text-white/50">ตัดทิ้งสัปดาห์หน้า: </span>
                      <span className="text-amber-300">{record.cut_next}</span>
                    </div>
                  )}

                  {record.outputs && (
                    <div className="text-sm">
                      <span className="text-white/50">Outputs: </span>
                      <span className="text-white/90">{record.outputs}</span>
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      )}
    </Shell>
  );
}

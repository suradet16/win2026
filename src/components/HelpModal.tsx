interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-strong rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 glass-strong border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
              🏆
            </div>
            <h2 className="text-2xl font-black font-manrope gradient-text">วิธีใช้งาน Win 2026 OS</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg glass hover:bg-white/20 flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Intro */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              ระบบติดตามความสำเร็จส่วนตัว
            </h3>
            <p className="text-white/70 leading-relaxed">
              Win 2026 OS ออกแบบมาเพื่อให้คุณชนะทุกวัน ด้วยระบบที่เรียบง่าย ใช้เวลาไม่เกิน 30 วินาที และอัปเดตอัตโนมัติ
            </p>
          </div>

          {/* 3 Pages */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-emerald-400 font-semibold">3 หน้าจอหลัก</h3>
            
            <div className="glass rounded-2xl p-5 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                  📊
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-2">Control Panel</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    ภาพรวมวันนี้และสัปดาห์นี้ ดูในเวลา 30 วินาที มี Warning Signals และ Decision Tools
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                  📝
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-2">Daily Execution</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    บันทึกรายวัน: Deep Work, Ship, Health, Tomorrow Focus (2-3 นาที)
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                  📅
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-2">Weekly Review</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    รีวิวสัปดาห์: ชนะหรือแพ้? เพราะอะไร? จะแก้ไขอย่างไร? (10 นาที)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="glass rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/5">
            <h3 className="text-base font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              เคล็ดลับการใช้งาน
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>เปิด Control Panel ทุกเช้า ใช้เวลา 30 วินาที</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>กรอก Daily Execution ก่อนนอน 2-3 นาที</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Weekly Review ทุกวันอาทิตย์ 10 นาที</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>ข้อมูลอัปเดตอัตโนมัติทันที ไม่ต้องกด refresh</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass-strong border-t border-white/10 px-6 py-4 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl px-6 py-3 font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>
    </div>
  );
}

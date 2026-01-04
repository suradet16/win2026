import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll Reveal Animation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Grid Overlay */}
      <div className="grid-overlay"></div>
      
      {/* Hero Background Image with Zoom Animation */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&q=80" 
          alt="Productivity Background" 
          className="w-full h-full object-cover hero-image"
          style={{
            animation: 'heroZoom 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-800/95"></div>
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] md:w-[95%] max-w-7xl fade-up-1">
        <div className="glass-strong rounded-2xl md:rounded-full px-4 md:px-8 py-3 md:py-4 flex items-center justify-between border border-white/15">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl md:rounded-full flex items-center justify-center text-lg md:text-xl shadow-lg">
              🏆
            </div>
            <span className="font-manrope font-bold text-sm md:text-lg text-white">Win 2026 OS</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-sm">
            <a href="#features" className="text-white/70 hover:text-white transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors font-medium">How It Works</a>
            <a href="#testimonials" className="text-white/70 hover:text-white transition-colors font-medium">Testimonials</a>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-xs md:text-sm font-semibold text-white/80 hover:text-white transition-colors px-2 md:px-4 py-2 hidden sm:block"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl md:rounded-full px-4 md:px-6 py-2 text-xs md:text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center pt-24 md:pt-0 md:justify-end pb-12 md:pb-20 px-4 md:px-12">
        <div className="max-w-7xl mx-auto w-full">
          {/* Live Indicator */}
          <div className="mb-4 md:mb-8 fade-up-2">
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs uppercase tracking-wider border border-white/10">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full pulse-dot"></span>
              <span className="text-white/60">Performance Tracking System</span>
            </div>
          </div>
          
          {/* Hero Title */}
          <h1 className="font-manrope font-black text-[18vw] md:text-[10rem] leading-[0.85] mb-4 md:mb-6 fade-up-3">
            <span className="gradient-text">WIN</span><br/>
            <span className="text-white">2026</span>
          </h1>
          
          {/* Hero Description */}
          <p className="text-base md:text-2xl text-white/70 max-w-3xl mb-6 md:mb-8 leading-relaxed fade-up-4">
            ระบบติดตามความสำเร็จส่วนตัวที่ออกแบบมาเพื่อให้คุณชนะทุกวัน<br className="hidden md:block"/>
            ดูแค่ 30 วินาที อัปเดตอัตโนมัติ และไม่มีอะไรซับซ้อน
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 fade-up-5">
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl md:rounded-2xl px-6 md:px-8 py-3.5 md:py-4 text-sm md:text-base font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-2xl w-full sm:w-auto text-center"
            >
              เริ่มต้นใช้งานฟรี
            </button>
            <button
              onClick={() => navigate('/login')}
              className="glass border border-white/20 text-white rounded-xl md:rounded-2xl px-6 md:px-8 py-3.5 md:py-4 text-sm md:text-base font-semibold hover:bg-white/10 transition-all w-full sm:w-auto text-center"
            >
              เข้าสู่ระบบ
            </button>
          </div>
          
          {/* Stats - Mobile inline, Desktop absolute */}
          <div className="mt-8 md:mt-0 md:absolute md:bottom-20 md:right-12 fade-up-5">
            <div className="glass-strong border border-white/15 rounded-2xl p-4 md:p-6 inline-block">
              <div className="flex gap-6 md:gap-8">
                <div>
                  <div className="text-3xl md:text-4xl font-black font-manrope gradient-text mb-1">30</div>
                  <div className="text-[10px] md:text-xs uppercase tracking-wider text-white/40">วินาที/วัน</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-black font-manrope gradient-text mb-1">3</div>
                  <div className="text-[10px] md:text-xs uppercase tracking-wider text-white/40">หน้าจอ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator - Hidden on mobile */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-10 fade-up-6 hidden md:block">
          <div className="flex flex-col items-center gap-2 scroll-indicator">
            <span className="text-xs uppercase tracking-wider text-white/40">Scroll</span>
            <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="relative z-10 bg-slate-950/50 backdrop-blur-xl py-24 px-6 md:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 scroll-reveal">
            <div className="text-sm uppercase tracking-wider text-indigo-400 mb-4 font-semibold">Features</div>
            <h2 className="text-5xl md:text-6xl font-black font-manrope gradient-text mb-4">
              ทำไมต้อง Win 2026?
            </h2>
            <p className="text-white/60 text-lg max-w-2xl">
              ออกแบบมาเพื่อคนที่ไม่มีเวลาเสียกับระบบซับซ้อน
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-strong border border-white/15 rounded-3xl p-8 card-hover scroll-reveal" style={{transitionDelay: '0.1s'}}>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg">
                ⚡
              </div>
              <h3 className="text-2xl font-bold font-manrope text-white mb-3">ดูแค่ 30 วินาที</h3>
              <p className="text-white/60 leading-relaxed">
                เช็คความคืบหน้าได้ในเวลาไม่ถึงนาที ไม่ต้องเสียเวลากับแดชบอร์ดที่ซับซ้อน
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="glass-strong border border-white/15 rounded-3xl p-8 card-hover scroll-reveal" style={{transitionDelay: '0.2s'}}>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg">
                🎯
              </div>
              <h3 className="text-2xl font-bold font-manrope text-white mb-3">3 หน้าจอเท่านั้น</h3>
              <p className="text-white/60 leading-relaxed">
                Control Panel, Daily Execution, Weekly Review - เท่านี้พอ ไม่มีฟีเจอร์ที่ไม่เคยใช้
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="glass-strong border border-white/15 rounded-3xl p-8 card-hover scroll-reveal" style={{transitionDelay: '0.3s'}}>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg">
                🔄
              </div>
              <h3 className="text-2xl font-bold font-manrope text-white mb-3">อัปเดตอัตโนมัติ</h3>
              <p className="text-white/60 leading-relaxed">
                กรอกข้อมูลครั้งเดียว ระบบจะคำนวณและแสดงผลให้เองทันที ไม่ต้องกด refresh
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 scroll-reveal">
            <div className="text-sm uppercase tracking-wider text-indigo-400 mb-4 font-semibold">How It Works</div>
            <h2 className="text-5xl md:text-6xl font-black font-manrope gradient-text mb-4">
              เริ่มต้นง่ายๆ 3 ขั้นตอน
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="scroll-reveal" style={{transitionDelay: '0.1s'}}>
              <div className="text-8xl font-black text-white/10 mb-4 font-manrope">01</div>
              <h3 className="text-2xl font-bold text-white mb-3 font-manrope">สมัครฟรี</h3>
              <p className="text-white/60 leading-relaxed">
                ใช้เวลาแค่ 1 นาที ไม่ต้องใส่บัตรเครดิต ไม่มีค่าใช้จ่าย
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="scroll-reveal" style={{transitionDelay: '0.2s'}}>
              <div className="text-8xl font-black text-white/10 mb-4 font-manrope">02</div>
              <h3 className="text-2xl font-bold text-white mb-3 font-manrope">บันทึกทุกวัน</h3>
              <p className="text-white/60 leading-relaxed">
                ใช้เวลาแค่ 2-3 นาที ติ๊กถูก/ผิด กรอกข้อมูลสั้นๆ เสร็จแล้ว
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="scroll-reveal" style={{transitionDelay: '0.3s'}}>
              <div className="text-8xl font-black text-white/10 mb-4 font-manrope">03</div>
              <h3 className="text-2xl font-bold text-white mb-3 font-manrope">Review ทุกสัปดาห์</h3>
              <p className="text-white/60 leading-relaxed">
                ใช้เวลา 10 นาที วิเคราะห์ว่าชนะหรือแพ้ เพราะอะไร แก้ไขอย่างไร
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 md:px-12 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border-y border-white/10">
        <div className="max-w-4xl mx-auto text-center scroll-reveal">
          <h2 className="text-5xl md:text-6xl font-black font-manrope text-white mb-6">
            พร้อมชนะทุกวันหรือยัง?
          </h2>
          <p className="text-xl text-white/70 mb-8">
            เริ่มต้นฟรี ไม่มีค่าใช้จ่าย ไม่ต้องใส่บัตรเครดิต
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl px-10 py-5 text-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-2xl"
          >
            เริ่มต้นใช้งานเลย
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 md:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-xl shadow-lg">
                🏆
              </div>
              <div>
                <div className="font-manrope font-bold text-white">Win 2026 OS</div>
                <div className="text-xs text-white/40">Performance Tracking System</div>
              </div>
            </div>
            
            <div className="text-sm text-white/40">
              © 2026 Win 2026 OS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Add scroll indicator animation
const styles = `
@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}

.scroll-indicator {
  animation: scrollBounce 2s ease-in-out infinite;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
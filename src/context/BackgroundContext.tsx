import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface BackgroundOption {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
}

export const backgroundOptions: BackgroundOption[] = [
  {
    id: 'mountain',
    name: 'เทือกเขา',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=60',
  },
  {
    id: 'ocean',
    name: 'มหาสมุทร',
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=200&q=60',
  },
  {
    id: 'forest',
    name: 'ป่าไม้',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=60',
  },
  {
    id: 'aurora',
    name: 'แสงเหนือ',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&q=60',
  },
  {
    id: 'stars',
    name: 'ดวงดาว',
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=200&q=60',
  },
  {
    id: 'none',
    name: 'ไม่มีพื้นหลัง',
    url: '',
    thumbnail: '',
  },
];

interface BackgroundContextType {
  backgroundId: string;
  setBackgroundId: (id: string) => void;
  backgroundUrl: string;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [backgroundId, setBackgroundIdState] = useState<string>(() => {
    return localStorage.getItem('win2026-bg') || 'mountain';
  });

  const setBackgroundId = (id: string) => {
    setBackgroundIdState(id);
    localStorage.setItem('win2026-bg', id);
  };

  const backgroundUrl = backgroundOptions.find(b => b.id === backgroundId)?.url || '';

  // Apply background to body
  useEffect(() => {
    if (backgroundUrl) {
      document.body.style.background = `
        linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.90) 50%, rgba(51, 65, 85, 0.88) 100%),
        url('${backgroundUrl}') center/cover fixed no-repeat
      `;
    } else {
      document.body.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)';
    }
  }, [backgroundUrl]);

  return (
    <BackgroundContext.Provider value={{ backgroundId, setBackgroundId, backgroundUrl }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { DarkVeilBackground } from './dark-veil-background';
import { LiquidChromeBackground } from './liquid-chrome-background';

export function ThemeBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {theme === 'dark' ? (
        <DarkVeilBackground
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
      ) : (
        <LiquidChromeBackground
          baseColor={[0.95, 0.95, 0.95]}
          speed={0.2}
          amplitude={0.5}
          frequencyX={3}
          frequencyY={2}
          interactive={true}
        />
      )}
    </div>
  );
}

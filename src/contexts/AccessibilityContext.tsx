import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  underlineLinks: boolean;
  focusIndicators: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  underlineLinks: false,
  focusIndicators: true,
  colorBlindMode: 'none',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    // Save to localStorage whenever settings change
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));

    // Apply settings to document
    const root = document.documentElement;

    // Font size
    root.setAttribute('data-font-size', settings.fontSize);

    // High contrast
    if (settings.highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }

    // Underline links
    if (settings.underlineLinks) {
      root.setAttribute('data-underline-links', 'true');
    } else {
      root.removeAttribute('data-underline-links');
    }

    // Focus indicators
    if (settings.focusIndicators) {
      root.setAttribute('data-focus-indicators', 'true');
    } else {
      root.removeAttribute('data-focus-indicators');
    }

    // Color blind mode
    if (settings.colorBlindMode !== 'none') {
      root.setAttribute('data-color-blind-mode', settings.colorBlindMode);
    } else {
      root.removeAttribute('data-color-blind-mode');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const increaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: prev.fontSize === 'normal' ? 'large' : prev.fontSize === 'large' ? 'extra-large' : 'extra-large',
    }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: prev.fontSize === 'extra-large' ? 'large' : prev.fontSize === 'large' ? 'normal' : 'normal',
    }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings, increaseFontSize, decreaseFontSize }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

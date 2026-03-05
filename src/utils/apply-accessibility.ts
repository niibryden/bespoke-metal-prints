// Apply saved accessibility settings on page load
export function applyAccessibilitySettings() {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Load and apply settings from localStorage
  const fontSize = localStorage.getItem('a11y-fontSize') || 'normal';
  const contrast = localStorage.getItem('a11y-contrast') || 'normal';
  const focusIndicators = localStorage.getItem('a11y-focusIndicators') !== 'false';
  const reducedMotion = localStorage.getItem('a11y-reducedMotion') === 'true';
  const textSpacing = localStorage.getItem('a11y-textSpacing') || 'normal';
  const colorScheme = localStorage.getItem('a11y-colorScheme') || 'auto';
  
  root.setAttribute('data-font-size', fontSize);
  root.setAttribute('data-contrast', contrast);
  root.setAttribute('data-focus-indicators', focusIndicators ? 'true' : 'false');
  root.setAttribute('data-reduced-motion', reducedMotion ? 'true' : 'false');
  root.setAttribute('data-text-spacing', textSpacing);
  root.setAttribute('data-color-scheme', colorScheme);
}

// Call immediately to prevent flash of unstyled content
if (typeof window !== 'undefined') {
  // Apply as early as possible
  applyAccessibilitySettings();
  
  // Also apply after DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAccessibilitySettings);
  }
}

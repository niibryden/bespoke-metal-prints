import { useEffect } from 'react';

/**
 * Global accessibility enhancements
 * Adds missing ARIA attributes and improves keyboard navigation
 */
export function AccessibilityFixes() {
  useEffect(() => {
    // Add lang attribute to html if missing
    if (!document.documentElement.lang) {
      document.documentElement.lang = 'en';
    }

    // Fix all icon-only buttons without aria-label
    const fixIconButtons = () => {
      const buttons = document.querySelectorAll('button:not([aria-label])');
      buttons.forEach((button) => {
        // Check if button only contains icons (no text)
        const hasText = button.textContent?.trim().length || 0;
        const hasIcon = button.querySelector('svg');
        
        if (hasIcon && hasText === 0) {
          // Try to infer label from icon class or title
          const iconTitle = button.getAttribute('title');
          const svgTitle = button.querySelector('title')?.textContent;
          
          if (iconTitle) {
            button.setAttribute('aria-label', iconTitle);
          } else if (svgTitle) {
            button.setAttribute('aria-label', svgTitle);
          } else {
            // Generic fallback based on common patterns
            const className = button.className;
            if (className.includes('close')) {
              button.setAttribute('aria-label', 'Close');
            } else if (className.includes('menu')) {
              button.setAttribute('aria-label', 'Toggle menu');
            } else if (className.includes('search')) {
              button.setAttribute('aria-label', 'Search');
            } else if (className.includes('cart')) {
              button.setAttribute('aria-label', 'View cart');
            }
          }
        }
      });
    };

    // Fix inputs without labels
    const fixUnlabeledInputs = () => {
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      inputs.forEach((input) => {
        const placeholder = input.getAttribute('placeholder');
        const type = input.getAttribute('type');
        const name = input.getAttribute('name');
        
        // Check if there's a label element associated
        const id = input.id;
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (label) return; // Already has label
        }

        // Add aria-label based on available info
        if (placeholder) {
          input.setAttribute('aria-label', placeholder);
        } else if (name) {
          const formattedName = name
            .replace(/[-_]/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .trim();
          input.setAttribute('aria-label', formattedName);
        } else if (type) {
          input.setAttribute('aria-label', `${type} input`);
        }
      });
    };

    // Fix images without alt text
    const fixImageAlts = () => {
      const images = document.querySelectorAll('img:not([alt])');
      images.forEach((img) => {
        // Check if image is decorative (in background, or has role="presentation")
        const role = img.getAttribute('role');
        if (role === 'presentation' || role === 'none') {
          img.setAttribute('alt', '');
        } else {
          // Try to get alt from src filename
          const src = img.getAttribute('src') || '';
          const filename = src.split('/').pop()?.split('?')[0] || '';
          const altText = filename
            .replace(/\.[^.]+$/, '') // Remove extension
            .replace(/[-_]/g, ' ')
            .trim();
          img.setAttribute('alt', altText || 'Image');
        }
      });
    };

    // Add focus-visible polyfill behavior
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    // Apply fixes on mount and when DOM changes
    fixIconButtons();
    fixUnlabeledInputs();
    fixImageAlts();

    // Re-apply when DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
      fixIconButtons();
      fixUnlabeledInputs();
      fixImageAlts();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Keyboard navigation tracking
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return null; // This component doesn't render anything
}

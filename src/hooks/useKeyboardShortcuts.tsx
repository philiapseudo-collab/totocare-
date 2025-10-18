import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'h',
        ctrl: true,
        action: () => navigate('/'),
        description: 'Go to Home/Dashboard'
      },
      {
        key: 'j',
        ctrl: true,
        action: () => navigate('/journal'),
        description: 'Go to Journal'
      },
      {
        key: 'm',
        ctrl: true,
        action: () => navigate('/medications'),
        description: 'Go to Medications'
      },
      {
        key: 'v',
        ctrl: true,
        action: () => navigate('/vaccinations'),
        description: 'Go to Vaccinations'
      },
      {
        key: 'u',
        ctrl: true,
        action: () => navigate('/upcoming'),
        description: 'Go to Upcoming Events'
      },
      {
        key: 'a',
        ctrl: true,
        action: () => navigate('/analytics'),
        description: 'Go to Analytics'
      },
      {
        key: 'p',
        ctrl: true,
        action: () => navigate('/profile'),
        description: 'Go to Profile'
      },
      {
        key: '?',
        shift: true,
        action: () => {
          // Show keyboard shortcuts help
          const shortcutsHelp = shortcuts
            .map(s => {
              const modifiers = [];
              if (s.ctrl) modifiers.push('Ctrl');
              if (s.shift) modifiers.push('Shift');
              if (s.alt) modifiers.push('Alt');
              const keyCombo = [...modifiers, s.key.toUpperCase()].join('+');
              return `${keyCombo}: ${s.description}`;
            })
            .join('\n');
          alert(`Keyboard Shortcuts:\n\n${shortcutsHelp}`);
        },
        description: 'Show keyboard shortcuts help'
      }
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}

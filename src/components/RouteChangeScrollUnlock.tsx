/**
 * RouteChangeScrollUnlock - Failsafe to clear stuck scroll locks on route change
 * 
 * Some overlay libraries (Radix, Vaul) can leave the body in a scroll-locked state
 * if components unmount unexpectedly. This component ensures scroll is restored
 * on every route change as a safety net.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Known attributes that overlay libraries use to lock scroll
const SCROLL_LOCK_ATTRIBUTES = [
  'data-scroll-locked',
  'data-vaul-drawer',
  'data-radix-dialog-overlay',
];

export function RouteChangeScrollUnlock() {
  const location = useLocation();

  useEffect(() => {
    // Clear any stuck scroll locks on route change
    const cleanup = () => {
      const html = document.documentElement;
      const body = document.body;

      // Reset inline styles that might lock scrolling
      const styleProps = ['overflow', 'position', 'top', 'width', 'height'] as const;
      
      styleProps.forEach(prop => {
        if (body.style[prop]) {
          body.style[prop] = '';
        }
        if (html.style[prop]) {
          html.style[prop] = '';
        }
      });

      // Remove known scroll lock attributes
      SCROLL_LOCK_ATTRIBUTES.forEach(attr => {
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr);
        }
        if (html.hasAttribute(attr)) {
          html.removeAttribute(attr);
        }
      });

      // Remove any data-scroll-locked numbered attributes (vaul uses data-scroll-locked="1")
      Array.from(body.attributes).forEach(attr => {
        if (attr.name.startsWith('data-scroll-locked')) {
          body.removeAttribute(attr.name);
        }
      });
      Array.from(html.attributes).forEach(attr => {
        if (attr.name.startsWith('data-scroll-locked')) {
          html.removeAttribute(attr.name);
        }
      });

      // Ensure body is scrollable
      body.style.overflow = '';
      html.style.overflow = '';
    };

    // Run cleanup on route change
    cleanup();

    // Also run cleanup on a slight delay to catch any post-render locks
    const timeout = setTimeout(cleanup, 100);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return null;
}

/**
 * Hook to manually trigger scroll unlock (for use in modals/drawers on close)
 */
export function useScrollUnlock() {
  return () => {
    const body = document.body;
    const html = document.documentElement;
    
    body.style.overflow = '';
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';
    html.style.overflow = '';
    
    // Remove scroll lock attributes
    SCROLL_LOCK_ATTRIBUTES.forEach(attr => {
      body.removeAttribute(attr);
      html.removeAttribute(attr);
    });
  };
}

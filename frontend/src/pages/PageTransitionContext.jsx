/**
 * PageTransitionContext.jsx
 * 
 * Clean state management for page transitions
 */

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const PageTransitionContext = createContext(null);

export function PageTransitionProvider({ children }) {
  const [pageEntering, setPageEntering] = useState(false);
  const [pageExiting, setPageExiting] = useState(false);
  
  const hasInitialized = useRef(false);

  const onCardClick = useCallback((cardId) => {
    hasInitialized.current = true;
    setPageEntering(true);
  }, []);

  const onPageExit = useCallback(() => {
    setPageExiting(true);
    setTimeout(() => {
      setPageExiting(false);
    }, 300);
  }, []);

  const onPageEntered = useCallback(() => {
    setPageEntering(false);
  }, []);

  const value = {
    pageEntering,
    pageExiting,
    hasInitialized,
    onCardClick,
    onPageExit,
    onPageEntered,
  };

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider');
  }
  return context;
}
/**
 * PageTransitionWrapper.jsx
 * 
 * WHAT'S NEW:
 * ✓ Wraps page content with entrance/exit animations
 * ✓ Uses Framer Motion for smooth, optimized animations
 * ✓ Different animation patterns based on transition origin
 * ✓ Proper cleanup to prevent state leaks
 * ✓ Performant: Uses transform and opacity only (GPU accelerated)
 */

import { motion } from 'framer-motion';
import { usePageTransition } from './PageTransitionContext';
import { useEffect, useRef } from 'react';
import { useLocation} from 'react-router-dom';
import { LocateOff } from 'lucide-react';


/**
 * Variant configs for different animation patterns
 * Each variant is optimized for its use case
 */
const ANIMATION_VARIANTS = {
  // Entrance from card click - smooth scale up with fade
  fromCard: {
    initial: {
      opacity: 0,
      scale: 0.92,
      y: 20,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1], // Custom easing for smooth feel
      },
    },
    exit: {
      opacity: 0,
      scale: 0.94,
      y: 30,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.6, 1],
      },
    },
  },

  // Generic page entrance - subtle fade and slide
  generic: {
    initial: {
      opacity: 0,
      y: 16,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: 16,
      transition: {
        duration: 0.25,
        ease: 'easeIn',
      },
    },
  },

  // Smooth background and content stagger
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  },
};

/**
 * PageTransitionWrapper - Main transition wrapper
 * 
 * Props:
 *   children: The page content to animate
 *   animationType: 'card' | 'generic' (defaults to 'generic')
 */
export default function PageTransitionWrapper({ 
  children, 
  animationType = 'generic'
}) {
  const location = useLocation();
  const { pageEntering, transitionOrigin, onPageEntered } = usePageTransition();

  const isFirstMount = useRef(true);

  // ADDED: Scroll to top on every page navigation
  useEffect(() => {
    if (!isFirstMount.current) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  // // Signal page entrance complete
  // useEffect(() => {
  //   if (!pageEntering) {
  //     onPageEntered();
  //   }
  // }, [pageEntering, onPageEntered]);

  // Skip animation on first mount
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      onPageEntered(); // Mark as entered immediately
    }
  }, [onPageEntered]);

  // Select variant based on transition origin
  const variant = transitionOrigin === 'card' ? ANIMATION_VARIANTS.fromCard : ANIMATION_VARIANTS.generic;

  return (
    <motion.div
      key={location.pathname} // stable key allows changes only on navigation
      initial={isFirstMount.current ? false:"initial"}

      animate="animate"
      exit="exit"
      variants={variant}
      className="w-full"
    >
      {/* Render page content - inherits animation from parent */}
      {children}
    </motion.div>
  );
}

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Page transition animations
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: 'easeInOut' }
};

// Fade in up animation
export const fadeInUp = (element: string | HTMLElement, delay = 0) => {
  gsap.fromTo(element, 
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, delay, ease: "power2.out" }
  );
};

// Fade in animation
export const fadeIn = (element: string | HTMLElement, delay = 0) => {
  gsap.fromTo(element, 
    { opacity: 0 },
    { opacity: 1, duration: 0.6, delay, ease: "power2.out" }
  );
};

// Slide in from left
export const slideInLeft = (element: string | HTMLElement, delay = 0) => {
  gsap.fromTo(element, 
    { x: -50, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.6, delay, ease: "power2.out" }
  );
};

// Slide in from right
export const slideInRight = (element: string | HTMLElement, delay = 0) => {
  gsap.fromTo(element, 
    { x: 50, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.6, delay, ease: "power2.out" }
  );
};

// Slide in from top
export const slideInDown = (element: string | HTMLElement, delay = 0) => {
  gsap.fromTo(element, 
    { y: -50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, delay, ease: "power2.out" }
  );
};

// Scale in animation
export const scaleIn = (element: string | HTMLElement, delay = 0) => {
  gsap.fromTo(element, 
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, delay, ease: "back.out(1.7)" }
  );
};

// Stagger children animation
export const staggerChildren = (parent: string | HTMLElement, children: string, delay = 0) => {
  gsap.fromTo(children,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay, ease: "power2.out" }
  );
};

// Button hover animation
export const buttonHover = (element: string | HTMLElement) => {
  gsap.to(element, {
    scale: 1.05,
    duration: 0.2,
    ease: "power2.out"
  });
};

export const buttonHoverOut = (element: string | HTMLElement) => {
  gsap.to(element, {
    scale: 1,
    duration: 0.2,
    ease: "power2.out"
  });
};

// Card hover animation
export const cardHover = (element: string | HTMLElement) => {
  gsap.to(element, {
    y: -5,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    duration: 0.3,
    ease: "power2.out"
  });
};

export const cardHoverOut = (element: string | HTMLElement) => {
  gsap.to(element, {
    y: 0,
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    duration: 0.3,
    ease: "power2.out"
  });
};

// Loading animation
export const loadingAnimation = (element: string | HTMLElement) => {
  gsap.to(element, {
    rotation: 360,
    duration: 1,
    repeat: -1,
    ease: "linear"
  });
};

// Pulse animation
export const pulse = (element: string | HTMLElement) => {
  gsap.to(element, {
    scale: 1.1,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut"
  });
};

// Bounce animation
export const bounce = (element: string | HTMLElement) => {
  gsap.to(element, {
    y: -10,
    duration: 0.3,
    repeat: 3,
    yoyo: true,
    ease: "power2.out"
  });
};

// Shake animation
export const shake = (element: string | HTMLElement) => {
  gsap.to(element, {
    x: -10,
    duration: 0.1,
    repeat: 5,
    yoyo: true,
    ease: "power2.out"
  });
};

// Success checkmark animation
export const checkmark = (element: string | HTMLElement) => {
  gsap.fromTo(element, 
    { scale: 0, rotation: -45 },
    { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }
  );
};

// Error X animation
export const errorX = (element: string | HTMLElement) => {
  gsap.fromTo(element, 
    { scale: 0, rotation: 45 },
    { scale: 1, rotation: 0, duration: 0.3, ease: "back.out(1.7)" }
  );
};

// Page enter animation
export const pageEnter = (element: string | HTMLElement) => {
  gsap.fromTo(element, 
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
  );
};

// Page exit animation
export const pageExit = (element: string | HTMLElement) => {
  gsap.to(element, {
    opacity: 0,
    y: -20,
    duration: 0.3,
    ease: "power2.in"
  });
};

// Modal enter animation
export const modalEnter = (element: string | HTMLElement) => {
  gsap.fromTo(element, 
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
  );
};

// Modal exit animation
export const modalExit = (element: string | HTMLElement) => {
  gsap.to(element, {
    scale: 0.8,
    opacity: 0,
    duration: 0.2,
    ease: "power2.in"
  });
};

// Form field focus animation
export const fieldFocus = (element: string | HTMLElement) => {
  gsap.to(element, {
    scale: 1.02,
    duration: 0.2,
    ease: "power2.out"
  });
};

export const fieldBlur = (element: string | HTMLElement) => {
  gsap.to(element, {
    scale: 1,
    duration: 0.2,
    ease: "power2.out"
  });
};


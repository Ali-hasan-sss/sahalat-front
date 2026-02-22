"use client";

import React, { useRef, useEffect, useState, type ReactNode } from "react";

type AnimationType =
  | "fadeUp"
  | "fadeIn"
  | "slideLeft"
  | "slideRight"
  | "scaleUp"
  | "blurIn"
  | "zoomIn"
  | "slideUpBounce";

type AnimateSectionProps = {
  children: ReactNode;
  animation?: AnimationType;
  className?: string;
  as?: "div" | "section" | "article";
  delay?: number;
  rootMargin?: string;
} & Omit<React.HTMLAttributes<HTMLElement>, "className">;

const BASE = "animate-on-scroll";
const ANIMATION_CLASSES: Record<AnimationType, string> = {
  fadeUp: "anim-fade-up",
  fadeIn: "anim-fade-in",
  slideLeft: "anim-slide-left",
  slideRight: "anim-slide-right",
  scaleUp: "anim-scale-up",
  blurIn: "anim-blur-in",
  zoomIn: "anim-zoom-in",
  slideUpBounce: "anim-slide-up-bounce",
};

export function AnimateSection({
  children,
  animation = "fadeUp",
  className = "",
  as: Tag = "section",
  delay = 0,
  rootMargin = "0px 0px -60px 0px",
  ...rest
}: AnimateSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            timeoutId = setTimeout(() => setInView(true), delay);
          } else {
            setInView(true);
          }
        }
      },
      { rootMargin, threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [delay, rootMargin]);

  const animClass = ANIMATION_CLASSES[animation];
  const props = {
    ref,
    className: `${BASE} ${animClass} ${inView ? "in-view" : ""} ${className}`,
    ...rest,
  };
  return React.createElement(Tag, props, children);
}

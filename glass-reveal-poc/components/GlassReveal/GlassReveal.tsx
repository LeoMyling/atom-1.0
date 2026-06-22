"use client";

import { PointerEvent, useState } from "react";
import styles from "./GlassReveal.module.css";

type GlassRevealProps = {
  exteriorSrc: string;
  interiorSrc: string;
};

type CssVars = React.CSSProperties & Record<string, string | number>;

export function GlassReveal({ exteriorSrc, interiorSrc }: GlassRevealProps) {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: "50%", y: "50%" });

  const updatePosition = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setPosition({
      x: `${event.clientX - rect.left}px`,
      y: `${event.clientY - rect.top}px`
    });
    setIsActive(true);
  };

  return (
    <section className={styles.shell} aria-label="Image reveal preview">
      <div
        className={styles.frame}
        data-active={isActive}
        onPointerEnter={updatePosition}
        onPointerMove={updatePosition}
        onPointerLeave={() => setIsActive(false)}
        style={
          {
            "--reveal-x": position.x,
            "--reveal-y": position.y
          } as CssVars
        }
      >
        <img className={styles.backImage} src={interiorSrc} alt="" draggable={false} />
        <img className={styles.frontImage} src={exteriorSrc} alt="" draggable={false} />
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { works } from "../data/content";
import { Image, spring } from "./UI";
export function HeroGallery() {
  const [active, setActive] = useState(0);
  const [width, setWidth] = useState(1200);
  const wrap = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const reduce = useReducedMotion();
  const pointer = useMotionValue(0);
  const smooth = useSpring(pointer, { stiffness: 150, damping: 28 });
  const rotate = useTransform(smooth, [-1, 1], [-3, 3]);
  const shift = useTransform(smooth, [-1, 1], [-9, 9]);
  useEffect(() => {
    if (!wrap.current) return;
    const observer = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width),
    );
    observer.observe(wrap.current);
    return () => observer.disconnect();
  }, []);
  const move = (n: number) =>
    setActive((i) => (i + n + works.length) % works.length);
  return (
    <div className="gallery-root" ref={wrap}>
      <motion.div
        className="hero-gallery"
        aria-label="作品封面画廊"
        onDragStartCapture={(e) => e.preventDefault()}
        onPointerMove={(e) => {
          if (
            reduce ||
            e.pointerType !== "mouse" ||
            !matchMedia("(hover:hover) and (pointer:fine)").matches
          )
            return;
          const r = e.currentTarget.getBoundingClientRect();
          pointer.set(((e.clientX - r.left) / r.width) * 2 - 1);
        }}
        onPointerLeave={() => pointer.set(0)}
        onPanStart={() => {
          dragged.current = true;
        }}
        onPanEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 45) move(info.offset.x < 0 ? 1 : -1);
          window.setTimeout(() => {
            dragged.current = false;
          }, 100);
        }}
        style={reduce ? {} : { rotateY: rotate, x: shift }}
      >
        {works.map((work, i) => {
          let offset = (i - active + works.length) % works.length;
          if (offset > works.length / 2) offset -= works.length;
          const visible = Math.abs(offset) <= 2;
          const front = offset === 0;
          return (
            <motion.div
              key={work.id}
              className={"hero-art " + (front ? "is-front" : "")}
              initial={false}
              animate={{
                x: offset * Math.min(width * 0.235, 257),
                y: Math.abs(offset) * 30,
                rotate: offset * 9,
                scale: 1 - Math.abs(offset) * 0.105,
                opacity: visible ? 1 : 0,
                zIndex: 10 - Math.abs(offset),
              }}
              transition={reduce ? { duration: 0 } : spring}
              aria-hidden={!visible}
            >
              {front ? (
                <Link
                  draggable={false}
                  className="hero-art-select"
                  to={"/works/" + work.id}
                  aria-label={"查看" + work.title}
                  onClick={(e) => {
                    if (dragged.current) e.preventDefault();
                  }}
                >
                  <Image
                    name={work.image}
                    alt={work.title + "视觉占位封面"}
                    eager
                  />
                  <span className="art-caption">
                    <span>{work.title}</span>
                    <ArrowUpRight size={18} />
                  </span>
                </Link>
              ) : (
                <button
                  className="hero-art-select"
                  onClick={() => {
                    if (!dragged.current) setActive(i);
                  }}
                  tabIndex={visible ? 0 : -1}
                  aria-label={"居中查看" + work.title}
                >
                  <Image name={work.image} alt="" eager />
                  <span className="art-caption">
                    <span>{work.title}</span>
                    <ArrowUpRight size={18} />
                  </span>
                </button>
              )}
            </motion.div>
          );
        })}
      </motion.div>
      <div className="gallery-controls">
        <div className="gallery-dots" aria-label="选择作品">
          {works.map((w, i) => (
            <button
              key={w.id}
              className={active === i ? "active" : ""}
              aria-label={"选择" + w.title}
              aria-pressed={active === i}
              onClick={() => setActive(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <span className="gallery-live sr-only" aria-live="polite">
          {works[active].title}
        </span>
        <div className="gallery-arrows">
          <button
            className="icon-button"
            onClick={() => move(-1)}
            aria-label="上一件作品"
          >
            <ArrowLeft size={19} />
          </button>
          <button
            className="icon-button"
            onClick={() => move(1)}
            aria-label="下一件作品"
          >
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}

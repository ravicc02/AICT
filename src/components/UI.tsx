import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { assetUrl } from "../lib/paths";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, X, ImageIcon, Check } from "lucide-react";
export const spring = {
  type: "spring" as const,
  stiffness: 220,
  damping: 25,
  mass: 1,
};
export function ArrowLink({
  to,
  children,
  className = "",
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link className={"arrow-link " + className} to={to}>
      {children}
      <ArrowUpRight size={18} aria-hidden="true" />
    </Link>
  );
}
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduce ? {} : { y: [20, 0] }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
  className = "",
  onAfterClose,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
  className?: string;
  onAfterClose?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const id = useId();
  useEffect(() => {
    if (!open || !ref.current) return;
    const el = ref.current;
    const previous = document.activeElement as HTMLElement;
    previousFocus.current = previous;
    el.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      el.close();
      document.body.style.overflow = before;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={"modal " + (wide ? "modal-wide " : "") + className}
      aria-labelledby={id}
      onClose={() => {
        // The native close event runs after React commits the closed state.
        // Reapply focus here so DOM updates and history navigation cannot clear it.
        if (previousFocus.current?.isConnected)
          previousFocus.current.focus({ preventScroll: true });
        onAfterClose?.();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const elements = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])',
          ),
        ].filter((element) => element.getClientRects().length > 0);
        const first = elements[0];
        const last = elements.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-head">
        <h2 id={id}>{title}</h2>
        <button
          autoFocus
          className="icon-button"
          onClick={onClose}
          aria-label="关闭弹窗"
        >
          <X size={21} />
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
export function Placeholder({
  title = "内容待补充",
  detail,
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <div className="placeholder">
      <ImageIcon size={32} strokeWidth={1.2} />
      <p>{title}</p>
      {detail && <span>{detail}</span>}
    </div>
  );
}
export function Image({
  name,
  alt,
  className = "",
  eager = false,
}: {
  name: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <Placeholder title="图片暂时无法加载" />
  ) : (
    <img
      draggable={false}
      className={className}
      src={assetUrl("/art/" + name + ".svg")}
      alt={alt}
      width="800"
      height="600"
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState("");
  return (
    <>
      <button
        className="button secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setStatus("链接已复制");
          } catch {
            setStatus("复制失败，请从地址栏复制链接");
          }
        }}
      >
        {status === "链接已复制" ? <Check size={16} /> : null}分享作品
      </button>
      <span className="copy-status" role="status">
        {status}
      </span>
    </>
  );
}
export function ContactCTA() {
  return (
    <section className="contact-cta">
      <div className="container contact-cta-inner">
        <h2>聊聊你的想法。</h2>
        <ArrowLink to="/contact">预约免费体验</ArrowLink>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
export function Brand() {
  return (
    <>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 28 28" fill="none">
          <path
            d="M4 22 13.5 5 23 22"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M8 16h11" stroke="currentColor" strokeWidth="3.5" />
          <circle cx="24" cy="5" r="2.5" fill="currentColor" />
        </svg>
      </span>
      <span>AI 创造营</span>
    </>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <header className="site-header">
        <div className="nav-inner">
          <Link to="/" className="wordmark" aria-label="AI 创造营首页">
            <Brand />
          </Link>
          <nav
            className={"main-nav " + (open ? "is-open" : "")}
            aria-label="主导航"
            id="main-navigation"
          >
            <NavLink to="/" end>
              首页
            </NavLink>
            <NavLink to="/courses">课程与方案</NavLink>
            <NavLink to="/works">作品墙</NavLink>
          </nav>
          <div className="nav-actions">
            <Link className="nav-contact" to="/contact">
              联系我们 <ArrowUpRight size={14} />
            </Link>
            <button
              ref={toggle}
              className="menu-toggle icon-button"
              aria-label={open ? "收起菜单" : "打开菜单"}
              aria-expanded={open}
              aria-controls="main-navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <Link to="/" className="wordmark">
          <Brand />
        </Link>
        <nav aria-label="页脚导航">
          <Link to="/courses">课程与方案</Link>
          <Link to="/works">作品墙</Link>
          <Link to="/contact">联系我们</Link>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 AI 创造营</span>
        <span>7–15 岁 · AI 项目式创作</span>
      </div>
    </footer>
  );
}
export function RouteEffects() {
  const location = useLocation();
  const first = useRef(true);
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "有想法，去创造",
      "/courses": "课程与方案",
      "/works": "作品墙",
      "/contact": "联系我们",
    };
    document.title =
      (titles[location.pathname] ||
        document.querySelector("h1")?.textContent ||
        "页面未找到") + " · AI 创造营";
    if (location.hash) {
      requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(location.hash.slice(1)))
          ?.scrollIntoView({ behavior: "instant" }),
      );
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    if (!first.current) {
      const h = document.querySelector<HTMLElement>("h1");
      h?.setAttribute("tabindex", "-1");
      h?.focus({ preventScroll: true });
    }
    first.current = false;
  }, [location.pathname, location.hash]);
  return null;
}

import { useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Gamepad2,
  Play,
} from "lucide-react";
import { processProject, processSteps } from "../data/process";
import { ArrowLink, Image, Modal } from "./UI";
import { ProjectRadar, RecordDialog, RecordPhoto } from "./CreationArchive";
import { projectDossiers } from "../data/dossiers";

function mediaStore(query: string, serverValue = false) {
  return {
    subscribe: (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    snapshot: () => window.matchMedia(query).matches,
    serverSnapshot: () => serverValue,
  };
}
const reducedMotion = mediaStore("(prefers-reduced-motion: reduce)", true);
const compactLayout = mediaStore("(max-width: 767px)");
export function Process() {
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<
    "record" | "experience" | "presentation" | null
  >(null);
  const reduce = useSyncExternalStore(
    reducedMotion.subscribe,
    reducedMotion.snapshot,
    reducedMotion.serverSnapshot,
  );
  const compact = useSyncExternalStore(
    compactLayout.subscribe,
    compactLayout.snapshot,
    compactLayout.serverSnapshot,
  );
  const current = processSteps[active];

  return (
    <section
      className="course-sop section-space"
      id="process"
      aria-labelledby="sop-title"
    >
      <div className="container">
        <div className="sop-heading">
          <h2 id="sop-title">从想法，到作品。</h2>
          <ArrowLink to="/courses">了解课程</ArrowLink>
        </div>
        <div className="sop-project-heading">
          <div>
            <p className="sop-sample">示例档案 · 对标站参考图片</p>
            <h3>{processProject.title}。</h3>
          </div>
          <div
            className="sop-project-actions"
            role="group"
            aria-label={`${processProject.title}示例作品`}
          >
            <Link to={`/works/${processProject.id}`}>
              作品 <ArrowUpRight size={15} />
            </Link>
            <button onClick={() => setPreview("experience")}>
              体验 <Gamepad2 size={16} />
            </button>
            <button onClick={() => setPreview("presentation")}>
              路演 <Play size={14} />
            </button>
          </div>
        </div>
        <div className="sop-workbench">
          <div
            className="sop-directory"
            role="tablist"
            aria-orientation={compact ? "horizontal" : "vertical"}
            aria-label="课程创作记录"
          >
            {processSteps.map((step, i) => (
              <button
                key={step.title}
                role="tab"
                id={`sop-tab-${i}`}
                aria-label={`第 ${i + 1} 步：${step.title}`}
                aria-controls="sop-record"
                aria-selected={active === i}
                tabIndex={active === i ? 0 : -1}
                className="sop-step"
                onClick={() => setActive(i)}
                onKeyDown={(event) => {
                  let next = i;
                  if (event.key === "ArrowRight")
                    next = (i + 1) % processSteps.length;
                  else if (event.key === "ArrowLeft")
                    next = (i + processSteps.length - 1) % processSteps.length;
                  else if (event.key === "ArrowDown")
                    next = (i + (compact ? 5 : 1)) % processSteps.length;
                  else if (event.key === "ArrowUp")
                    next =
                      (i + processSteps.length - (compact ? 5 : 1)) %
                      processSteps.length;
                  else if (event.key === "Home") next = 0;
                  else if (event.key === "End") next = processSteps.length - 1;
                  else return;
                  event.preventDefault();
                  setActive(next);
                  document
                    .getElementById(`sop-tab-${next}`)
                    ?.focus({ preventScroll: true });
                }}
              >
                <span className="sop-step-number" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="sop-step-title">{step.title}</span>
                <ArrowRight size={15} aria-hidden="true" />
                {active === i &&
                  (reduce ? (
                    <span className="sop-active-mark" />
                  ) : (
                    <motion.span
                      className="sop-active-mark"
                      layoutId="sop-active-mark"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  ))}
              </button>
            ))}
          </div>
          <div className="sop-content">
            <div
              className="sop-record"
              id="sop-record"
              role="tabpanel"
              aria-labelledby={`sop-tab-${active}`}
              tabIndex={0}
            >
              <button
                className="sop-record-photo"
                aria-label={`查看${current.title}创作记录`}
                aria-haspopup="dialog"
                onClick={() => setPreview("record")}
              >
                <div className="sop-photo-frame" key={active}>
                  <RecordPhoto
                    media={current.media[0]}
                    alt={`${current.title}：创作过程参考图片`}
                  />
                </div>
                <span className="sop-photo-expand" aria-hidden="true">
                  查看记录 <ArrowUpRight size={16} />
                </span>
              </button>
              <div className="sop-record-meta">
                <span className="sop-record-count" aria-hidden="true">
                  {String(active + 1).padStart(2, "0")} <span>/ 10</span>
                </span>
                <span>{current.media.length} 张记录图片</span>
                <div className="sop-record-controls">
                  <button
                    className="icon-button"
                    aria-label="上一条创作记录"
                    disabled={active === 0}
                    onClick={() => setActive(active - 1)}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="下一条创作记录"
                    disabled={active === processSteps.length - 1}
                    onClick={() => setActive(active + 1)}
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="sop-record-copy" key={active}>
                <h4>{current.heading}</h4>
                <p>{current.description}</p>
              </div>
            </div>
            <aside className="sop-growth" aria-labelledby="sop-growth-title">
              <h3 id="sop-growth-title">能力总览。</h3>
              <ProjectRadar
                dimensions={projectDossiers.mech.dimensions}
                compact
              />
              <p className="sop-growth-caption">项目总览 · 示例数值 / 10</p>
              <Link className="sop-growth-link" to="/works/mech#project-growth">
                查看成长记录 <ArrowUpRight size={14} />
              </Link>
            </aside>
          </div>
        </div>
      </div>
      <RecordDialog
        projectTitle={processProject.title}
        records={projectDossiers.mech.records}
        active={preview === "record" ? active : null}
        onChange={setActive}
        onClose={() => setPreview(null)}
      />
      <Modal
        open={preview === "experience" || preview === "presentation"}
        onClose={() => setPreview(null)}
        title={`${processProject.title} · ${preview === "presentation" ? "作品路演" : "作品体验"}`}
        wide
      >
        <div className="preview-art">
          <Image
            name={processProject.id}
            alt={`${processProject.title}作品示意`}
          />
          <span className="preview-play" aria-hidden="true">
            {preview === "presentation" ? (
              <Play size={32} fill="currentColor" />
            ) : (
              <Gamepad2 size={32} />
            )}
          </span>
        </div>
        <p className="preview-note">
          {preview === "presentation" ? "路演视频待补充" : "作品体验待补充"}
        </p>
      </Modal>
    </section>
  );
}

import { useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import type {
  CreationRecord,
  ProjectDimension,
  RecordMedia,
} from "../data/dossiers";
import { Modal, Placeholder } from "./UI";
import { assetUrl } from "../lib/paths";

const subscribeMotion = (notify: () => void) => {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", notify);
  return () => preference.removeEventListener("change", notify);
};
export function useArchiveMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
}

export function RecordPhoto({
  media,
  alt,
  eager = false,
}: {
  media: RecordMedia;
  alt?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState<string>();
  return failed === media.src ? (
    <Placeholder title="记录图片暂时无法加载" />
  ) : (
    <img
      src={assetUrl(media.src)}
      alt={alt ?? `${media.caption} · 外部参考素材`}
      width="650"
      height="480"
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onError={() => setFailed(media.src)}
    />
  );
}
const point = (index: number, radius: number) => {
  const angle = ((index * 60 - 90) * Math.PI) / 180;
  return [180 + Math.cos(angle) * radius, 180 + Math.sin(angle) * radius];
};
const polygon = (radii: number[]) =>
  radii.map((radius, i) => point(i, radius).join(",")).join(" ");

export function ProjectRadar({
  dimensions,
  selected,
  onSelect,
  compact = false,
}: {
  dimensions: ProjectDimension[];
  selected?: number;
  onSelect?: (index: number) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`project-radar ${compact ? "radar-compact sop-growth-diagram" : ""}`}
    >
      <svg
        viewBox="0 0 360 360"
        fill="none"
        role="img"
        aria-label={`项目六维总览，示例数值，满量程10：${dimensions.map((d) => `${d.name}${d.value}`).join("，")}。非真实测评。`}
      >
        {[22, 44, 66, 88, 110].map((radius) => (
          <polygon
            key={radius}
            points={polygon(Array(6).fill(radius))}
            stroke="var(--radar-grid)"
          />
        ))}
        {dimensions.map((dimension, i) => {
          const [x, y] = point(i, 110);
          return (
            <path
              key={dimension.name}
              d={`M180 180 L${x} ${y}`}
              stroke="var(--radar-grid)"
            />
          );
        })}
        <polygon
          className="radar-profile sop-growth-profile"
          points={polygon(dimensions.map((d) => d.value * 11))}
          fill="var(--blue)"
          fillOpacity="0.1"
          stroke="var(--blue)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {dimensions.map((dimension, i) => {
          const [x, y] = point(i, dimension.value * 11);
          return (
            <g key={dimension.name}>
              {selected === i && (
                <circle
                  cx={x}
                  cy={y}
                  r="10"
                  fill="var(--blue)"
                  fillOpacity="0.12"
                />
              )}
              <circle
                className="radar-point sop-growth-point"
                cx={x}
                cy={y}
                r={selected === i ? 4.5 : 3.5}
                fill={selected === i ? "var(--blue)" : "var(--ground)"}
                stroke="var(--blue)"
                strokeWidth="1.8"
              />
            </g>
          );
        })}
      </svg>
      <div
        className="radar-labels"
        role={onSelect ? "group" : undefined}
        aria-label={onSelect ? "查看各维度的过程依据" : undefined}
      >
        {dimensions.map((dimension, i) =>
          onSelect ? (
            <button
              type="button"
              key={dimension.name}
              className={`radar-dimension radar-dimension-${i}`}
              aria-pressed={selected === i}
              onClick={() => onSelect(i)}
            >
              <span>{dimension.name}</span>
              <b>{dimension.value}</b>
            </button>
          ) : (
            <span
              key={dimension.name}
              className={`radar-dimension radar-dimension-${i}`}
            >
              <span>{dimension.name}</span>
              <b>{dimension.value}</b>
            </span>
          ),
        )}
      </div>
    </div>
  );
}

function RecordGallery({ record }: { record: CreationRecord }) {
  const [photo, setPhoto] = useState(0);
  const reduce = useArchiveMotion();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="dossier-gallery">
      <figure>
        <motion.div
          className="dossier-main-photo"
          key={photo}
          initial={false}
          animate={reduce ? {} : { opacity: [0.5, 1], x: [8, 0] }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <RecordPhoto media={record.media[photo]} eager />
        </motion.div>
        <figcaption aria-live="polite">
          <span>{record.media[photo].caption}</span>
          <span>
            {String(photo + 1).padStart(2, "0")} /{" "}
            {String(record.media.length).padStart(2, "0")}
          </span>
        </figcaption>
      </figure>
      <div
        className="dossier-thumbnails"
        role="group"
        aria-label="记录图片"
        onKeyDown={(e) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
            return;
          e.preventDefault();
          const next =
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? record.media.length - 1
                : (photo +
                    (e.key === "ArrowRight" ? 1 : record.media.length - 1)) %
                  record.media.length;
          setPhoto(next);
          buttons.current[next]?.focus();
        }}
      >
        {record.media.map((media, i) => (
          <button
            key={i}
            type="button"
            ref={(el) => {
              buttons.current[i] = el;
            }}
            aria-label={`图片 ${i + 1}：${media.caption}`}
            aria-pressed={photo === i}
            onClick={() => setPhoto(i)}
          >
            <RecordPhoto media={media} alt="" />
            <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function RecordDialog({
  projectTitle,
  records,
  active,
  onChange,
  onClose,
  onAfterClose,
}: {
  projectTitle: string;
  records: CreationRecord[];
  active: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
  onAfterClose?: () => void;
}) {
  const record = active === null ? null : records[active];
  return (
    <Modal
      open={!!record}
      onClose={onClose}
      onAfterClose={onAfterClose}
      title={`${projectTitle} · 创作档案`}
      wide
      className="record-dialog"
    >
      {record && active !== null && (
        <>
          <div className="dossier-toolbar">
            <span>示例记录 · 参考图片与占位文字</span>
            <div className="dossier-navigation">
              <button
                className="icon-button"
                type="button"
                aria-label="查看上一条记录"
                disabled={active === 0}
                onClick={() => onChange(active - 1)}
              >
                <ArrowLeft size={18} />
              </button>
              <span role="status">
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(records.length).padStart(2, "0")}
              </span>
              <button
                className="icon-button"
                type="button"
                aria-label="查看下一条记录"
                disabled={active === records.length - 1}
                onClick={() => onChange(active + 1)}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <div className="dossier-spread" key={record.id}>
            <RecordGallery record={record} />
            <div className="dossier-writing">
              <div className="dossier-title">
                <span>
                  {record.kind} / {String(active + 1).padStart(2, "0")}
                </span>
                <h3>{record.title}</h3>
              </div>
              <section className="dossier-observation">
                <h4>老师观察</h4>
                <p>{record.teacher}</p>
              </section>
              <section className="dossier-voice">
                <h4>孩子说</h4>
                <blockquote>{record.child}</blockquote>
              </section>
              <section className="dossier-change">
                <h4>这次的变化</h4>
                <p>{record.outcome}</p>
              </section>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

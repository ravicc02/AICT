import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Link,
  useSearchParams,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { works } from "../data/content";
import { projectDossiers, type CreationRecord } from "../data/dossiers";
import { Image, Modal, ContactCTA, CopyButton } from "../components/UI";
import {
  ProjectRadar,
  RecordDialog,
  RecordPhoto,
  useArchiveMotion,
} from "../components/CreationArchive";
import { NotFound } from "./Other";

function RecordTrack({
  records,
  onOpen,
}: {
  records: CreationRecord[];
  onOpen: (index: number) => void;
}) {
  const track = useRef<HTMLOListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const reduce = useArchiveMotion();
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setEdges({
        start: el.scrollLeft < 3,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 3,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [records]);
  const move = (direction: number) => {
    const el = track.current;
    if (el)
      el.scrollBy({
        left: direction * Math.max(250, el.clientWidth * 0.8),
        behavior: reduce ? "instant" : "smooth",
      });
  };
  return (
    <>
      <div className="records-heading">
        <div>
          <h2>创作记录。</h2>
          <span>{records.length} 次尝试，按发生顺序留下。</span>
        </div>
        <div className="track-navigation">
          <button
            className="icon-button"
            aria-label="向前浏览创作记录"
            disabled={edges.start}
            onClick={() => move(-1)}
          >
            <ArrowLeft size={21} />
          </button>
          <button
            className="icon-button"
            aria-label="向后浏览创作记录"
            disabled={edges.end}
            onClick={() => move(1)}
          >
            <ArrowRight size={21} />
          </button>
        </div>
      </div>
      <ol
        className="creation-track"
        ref={track}
        aria-label="项目创作记录"
        tabIndex={0}
      >
        {records.map((record, index) => (
          <li key={record.id}>
            <button
              className="creation-entry"
              onClick={() => onOpen(index)}
              aria-haspopup="dialog"
              aria-label={`打开第 ${index + 1} 条记录：${record.title}`}
            >
              <span className="creation-entry-meta">
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>{record.kind}</span>
                <i />
              </span>
              <span className="creation-entry-photo">
                <RecordPhoto
                  media={record.media[0]}
                  alt={`${record.title} · 过程参考图片`}
                />
                <span className="creation-photo-count">
                  {record.media.length} 张图
                </span>
              </span>
              <span className="creation-entry-heading">
                <strong>{record.title}</strong>
                <ArrowUpRight size={18} />
              </span>
              <span className="creation-entry-summary">{record.summary}</span>
              <span className="creation-entry-action">
                查看这次记录 <ArrowRight size={15} />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}

const subscribeHydration = () => () => {};

export function WorkDetail() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  const { id } = useParams();
  const work = works.find((item) => item.id === id);
  const [search] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(false);
  const [dimension, setDimension] = useState(0);
  const reduce = useArchiveMotion();
  const dossier = work ? projectDossiers[work.id] : null;
  const requestedRecord =
    dossier?.records.findIndex((entry) => entry.id === search.get("record")) ??
    -1;
  const active = !hydrated || requestedRecord < 0 ? null : requestedRecord;
  const openedFromPage = useRef(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    setPreview(false);
    setDimension(0);
    openedFromPage.current = false;
  }, [id]);
  if (!work || !dossier) return <NotFound />;
  const openRecord = (index: number) => {
    if (active === null) {
      returnFocus.current = document.activeElement as HTMLElement;
      openedFromPage.current = true;
    }
    const params = new URLSearchParams(search);
    params.set("record", dossier.records[index].id);
    // First open creates a history entry; moving between records replaces it.
    navigate(
      { search: params.toString() ? `?${params}` : "", hash: location.hash },
      { replace: active !== null, preventScrollReset: true },
    );
  };
  const closeRecord = () => {
    const params = new URLSearchParams(search);
    params.delete("record");
    if (openedFromPage.current) navigate(-1);
    else
      navigate(
        { search: params.toString() ? `?${params}` : "", hash: location.hash },
        { replace: true, preventScrollReset: true },
      );
  };
  const restoreRecordFocus = () => {
    if (openedFromPage.current && returnFocus.current?.isConnected)
      returnFocus.current.focus({ preventScroll: true });
    else
      document
        .querySelector<HTMLElement>(".creation-entry")
        ?.focus({ preventScroll: true });
  };
  const observed = dossier.dimensions[dimension];
  return (
    <>
      <section className="detail-hero container dossier-hero">
        <Link className="back-link" to="/works">
          <ArrowLeft size={15} /> 全部作品
        </Link>
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="sample-label">{work.category} · 示例档案</span>
            <h1>{work.title}</h1>
            <p>{work.description}</p>
            <div className="detail-actions">
              <button
                className="button primary"
                onClick={() => setPreview(true)}
              >
                <Play size={16} fill="currentColor" />
                作品预览
              </button>
              <CopyButton
                text={
                  typeof window !== "undefined"
                    ? window.location.href
                    : "/works/" + work.id
                }
              />
            </div>
            <div className="dossier-jump-links">
              <a href="#creation-records">
                {dossier.records.length} 条创作记录 <ArrowUpRight size={16} />
              </a>
              <a href="#project-growth">
                项目成长总览 <ArrowUpRight size={16} />
              </a>
            </div>
            <p className="dossier-sample-note">
              图片来自对标站，文字与数值为视觉占位。
            </p>
          </div>
          <motion.div
            className="detail-art"
            initial={false}
            animate={reduce ? {} : { scale: [0.97, 1], rotate: [-2, 0] }}
            transition={{ duration: 0.6 }}
          >
            <Image name={work.image} alt={work.title + "封面示意"} eager />
          </motion.div>
        </div>
      </section>
      <section className="dossier-records container" id="creation-records">
        <RecordTrack records={dossier.records} onOpen={openRecord} />
      </section>
      <section
        className="project-growth container"
        id="project-growth"
        aria-labelledby="project-growth-title"
      >
        <div className="project-growth-heading">
          <h2 id="project-growth-title">这个项目里的成长。</h2>
          <span>六维总览 · 示例数值 / 10</span>
        </div>
        <div className="project-growth-layout">
          <div className="project-growth-chart">
            <ProjectRadar
              dimensions={dossier.dimensions}
              selected={dimension}
              onSelect={setDimension}
            />
            <p>选择一个维度，回看过程中的具体表现。</p>
          </div>
          <div className="growth-evidence" aria-live="polite">
            <motion.div
              key={dimension}
              initial={false}
              animate={reduce ? {} : { x: [10, 0], opacity: [0.4, 1] }}
              transition={{ duration: 0.25 }}
            >
              <span className="growth-evidence-index">
                {String(dimension + 1).padStart(2, "0")} / 06
              </span>
              <h3>{observed.name}</h3>
              <p className="growth-observation">{observed.observation}</p>
              <div className="growth-sources">
                {observed.recordIds.map((recordId) => {
                  const index = dossier.records.findIndex(
                    (record) => record.id === recordId,
                  );
                  const record = dossier.records[index];
                  return (
                    <button
                      key={recordId}
                      onClick={() => openRecord(index)}
                      aria-haspopup="dialog"
                      aria-label={`查看${observed.name}的依据：${record.title}`}
                    >
                      <span className="growth-source-photo">
                        <RecordPhoto media={record.media[0]} alt="" />
                      </span>
                      <span>
                        <small>记录 {String(index + 1).padStart(2, "0")}</small>
                        <strong>{record.title}</strong>
                      </span>
                      <ArrowUpRight size={18} />
                    </button>
                  );
                })}
              </div>
              <p className="growth-note">
                记录这一次项目中的表现，不给孩子下定论。
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <ContactCTA />
      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        title={work.title + " · 作品预览"}
        wide
      >
        <div className="preview-art">
          <Image name={work.image} alt={work.title + "作品演示占位"} />
          <span className="preview-play">
            <Play size={32} fill="currentColor" />
          </span>
        </div>
        <p className="preview-note">作品演示待补充</p>
      </Modal>
      <RecordDialog
        projectTitle={work.title}
        records={dossier.records}
        active={active}
        onChange={openRecord}
        onClose={closeRecord}
        onAfterClose={restoreRecordFocus}
      />
    </>
  );
}

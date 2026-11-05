import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Search, X, ArrowRight } from "lucide-react";
import { works } from "../data/content";
import { Image, ContactCTA, spring } from "../components/UI";
import { projectDossiers, recordHref } from "../data/dossiers";
import { RecordPhoto, useArchiveMotion } from "../components/CreationArchive";
export function Works() {
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("精选");
  const reduce = useArchiveMotion();
  const filtered = useMemo(() => {
    const list = works.filter(
      (w) =>
        (category === "全部" || w.category === category) &&
        [w.title, w.description, w.english]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    );
    return sort === "名称"
      ? list.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"))
      : list;
  }, [category, query, sort]);
  return (
    <>
      <section className="page-heading works-heading archive-heading container">
        <h1>
          孩子们的
          <br />
          <span>创作档案。</span>
        </h1>
      </section>
      <section className="works-section container">
        <div className="works-toolbar">
          <div className="filter-tabs" aria-label="作品分类">
            {["全部", "互动游戏", "创意工具"].map((c) => (
              <button
                className={category === c ? "active" : ""}
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="search-sort">
            <div className="search-field">
              <Search size={17} />
              <input
                aria-label="搜索作品"
                placeholder="找一个有趣的想法"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="search-clear"
                  aria-label="清除搜索"
                  onClick={() => setQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="作品排序"
            >
              <option>精选</option>
              <option>名称</option>
            </select>
          </div>
        </div>
        <div className="works-result-line">
          <span role="status">{filtered.length} 件作品</span>
          <span>参考图片 · 示例档案</span>
        </div>
        <motion.div layout={!reduce} className="archive-index">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((w) => {
              const dossier = projectDossiers[w.id];
              const previews = [
                0,
                Math.floor(dossier.records.length / 2),
                dossier.records.length - 1,
              ];
              return (
                <motion.article
                  layout={!reduce}
                  key={w.id}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          layout: spring,
                          opacity: { duration: 0.16 },
                          y: { duration: 0.24 },
                        }
                  }
                  className="archive-row"
                >
                  <Link className="archive-project" to={"/works/" + w.id}>
                    <div className="archive-cover">
                      <Image name={w.image} alt={w.title + "视觉占位封面"} />
                    </div>
                    <div className="archive-project-copy">
                      <span className="archive-category">{w.category}</span>
                      <h2>{w.title}</h2>
                      <p>{dossier.records.length} 条创作记录</p>
                      <span className="archive-open">
                        查看档案 <ArrowUpRight size={17} />
                      </span>
                    </div>
                  </Link>
                  <div
                    className="archive-records"
                    aria-label={w.title + "的过程记录"}
                  >
                    {previews.map((index) => {
                      const record = dossier.records[index];
                      return (
                        <Link
                          className="archive-record-link"
                          key={record.id}
                          to={recordHref(w.id, record.id)}
                          aria-label={`${w.title}，第 ${index + 1} 条：${record.title}`}
                        >
                          <span className="archive-record-position">
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            <i />
                          </span>
                          <div className="archive-record-photo">
                            <RecordPhoto
                              media={record.media[0]}
                              alt={`${record.title} · 过程参考图片`}
                            />
                          </div>
                          <span className="archive-record-caption">
                            {record.title}
                            <ArrowUpRight size={14} />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <Search size={34} strokeWidth={1} />
            <h2>还没有找到这个想法。</h2>
            <button
              className="arrow-link"
              onClick={() => {
                setQuery("");
                setCategory("全部");
              }}
            >
              看看全部作品 <ArrowRight size={18} />
            </button>
          </div>
        )}
      </section>
      <ContactCTA />
    </>
  );
}

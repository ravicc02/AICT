import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, Plus, Minus, ArrowRight } from "lucide-react";
import { plans, faqs, type Plan, type PlanKey } from "../data/content";
import { Modal, ContactCTA } from "../components/UI";
function Switch({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (s: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <div className="segmented" aria-label={label}>
      {options.map((s) => (
        <button key={s} onClick={() => onChange(s)} aria-pressed={value === s}>
          {value === s && <span className="segment-selection" />}
          <span>{s}</span>
        </button>
      ))}
    </div>
  );
}
function PlanCard({
  plan,
  kind,
  onDetails,
  children,
}: {
  plan: Plan;
  kind: string;
  onDetails: () => void;
  children?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <article className={"plan-card plan-" + kind}>
      <div className="plan-top">
        <span className="plan-symbol" aria-hidden="true">
          {kind === "trial" ? (
            <i className="symbol-dot" />
          ) : kind === "term" ? (
            <i className="symbol-stack" />
          ) : (
            <i className="symbol-orbit" />
          )}
        </span>
        <h2>{plan.name}</h2>
        <p>{plan.summary}</p>
      </div>
      <div className="plan-options">
        {children || (
          <span className="plan-free-label">第一次创造，从这里开始</span>
        )}
      </div>
      <motion.div
        className="plan-price"
        key={plan.key}
        initial={false}
        animate={reduce ? {} : { opacity: [0.55, 1] }}
        transition={{ duration: 0.25 }}
      >
        {plan.price === "待补充" ? (
          <strong className="price-pending">咨询价格</strong>
        ) : (
          <>
            <span className="currency">¥</span>
            <strong>{plan.price}</strong>
          </>
        )}
        <span className="price-unit">
          {plan.price === "待补充" ? "服务内容待确认" : plan.unit}
        </span>
      </motion.div>
      <p className="plan-duration">{plan.duration}</p>
      <Link
        className={"button " + (kind === "term" ? "primary" : "secondary")}
        to={"/contact?plan=" + plan.key}
      >
        {kind === "trial" ? "预约体验" : "咨询方案"}
        <ArrowUpRight size={17} />
      </Link>
      <ul className="plan-features">
        {plan.features.map((f) => (
          <li key={f}>
            <Check size={17} />
            {f}
          </li>
        ))}
      </ul>
      {plan.key === "year-60" && (
        <p className="plan-note">可按 ¥5,000 / 10 次独立购买</p>
      )}
      <button className="plan-details" onClick={onDetails}>
        服务细则 <Plus size={17} />
      </button>
    </article>
  );
}
export function Courses() {
  const [term, setTerm] = useState("一对一");
  const [year, setYear] = useState("60 次");
  const [detail, setDetail] = useState<PlanKey | null>(null);
  const [faq, setFaq] = useState<number | null>(0);
  const termKey = term === "一对一" ? "term-one" : "term-two";
  const yearKey = year === "60 次" ? "year-60" : "year-100";
  return (
    <>
      <section className="page-heading container">
        <p className="page-intro">7–15 岁 · 无需编程基础</p>
        <h1>
          给想法，
          <br />
          一点成长的时间。
        </h1>
        <p>从第一次尝试，到持续创造。</p>
      </section>
      <section className="plans-section container" aria-label="课程与方案">
        <div className="plans-grid">
          <PlanCard
            plan={plans.trial}
            kind="trial"
            onDetails={() => setDetail("trial")}
          />
          <PlanCard
            plan={plans[termKey]}
            kind="term"
            onDetails={() => setDetail(termKey)}
          >
            <Switch
              value={term}
              onChange={setTerm}
              options={["一对一", "一对二"]}
              label="按期班型"
            />
          </PlanCard>
          <PlanCard
            plan={plans[yearKey]}
            kind="year"
            onDetails={() => setDetail(yearKey)}
          >
            <Switch
              value={year}
              onChange={setYear}
              options={["60 次", "100 次"]}
              label="年度次数"
            />
          </PlanCard>
        </div>
      </section>
      <section className="course-path section-space container">
        <h2>
          一个作品，
          <br />
          不止一种收获。
        </h2>
        <div className="path-list">
          {[
            ["把想法说清楚", "从「我想要」到能被理解的需求。"],
            ["把问题拆开来", "一步步制作，观察，再调整。"],
            ["把作品讲给别人", "理解使用者，也练习表达自己。"],
          ].map(([h, p], i) => (
            <div key={h}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
              <ArrowRight size={24} />
            </div>
          ))}
        </div>
      </section>
      <section className="faq-section container">
        <h2>你可能还想知道。</h2>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div className="faq-item" key={f.q}>
              <h3>
                <button
                  aria-expanded={faq === i}
                  aria-controls={"faq-" + i}
                  onClick={() => setFaq(faq === i ? null : i)}
                >
                  {f.q}
                  {faq === i ? <Minus size={20} /> : <Plus size={20} />}
                </button>
              </h3>
              <div id={"faq-" + i} className="faq-answer" hidden={faq !== i}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <ContactCTA />
      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={
          detail
            ? plans[detail].name + " · " + plans[detail].variant
            : "服务细则"
        }
      >
        {detail && (
          <div className="terms-list">
            {plans[detail].sections.map((s) => (
              <section key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </section>
            ))}
            <Link className="button primary" to={"/contact?plan=" + detail}>
              咨询这个方案 <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </Modal>
    </>
  );
}

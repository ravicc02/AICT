import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, ArrowLeft, Check, RotateCcw } from "lucide-react";
import { plans, type PlanKey } from "../data/content";
export function Contact() {
  const [params] = useSearchParams();
  const requested = params.get("plan") as PlanKey;
  const [chosen, setChosen] = useState<PlanKey>("trial");
  const [success, setSuccess] = useState(false);
  useEffect(
    () => setChosen(plans[requested] ? requested : "trial"),
    [requested],
  );
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(true);
  };
  return (
    <section className="contact-page container">
      <div className="contact-copy">
        <Link className="back-link" to="/courses">
          <ArrowLeft size={16} />
          课程与方案
        </Link>
        <h1>
          每个创造，
          <br />
          从一个想法开始。
        </h1>
        <p>
          来聊聊孩子的兴趣，
          <br />
          一起找到适合的第一步。
        </p>
        <div className="contact-mini-art" aria-hidden="true">
          <span className="mini-a">a</span>
          <span className="mini-i">i</span>
          <span className="mini-dot" />
        </div>
      </div>
      <div className="contact-form-panel">
        {success && (
          <div className="form-success" role="status">
            <span className="success-mark">
              <Check size={32} />
            </span>
            <h2>期待这个想法。</h2>
            <p>
              预约效果预览完成。
              <br />
              信息未发送，也未保存。
            </p>
            <button
              className="button secondary"
              onClick={() => setSuccess(false)}
            >
              <RotateCcw size={16} />
              返回编辑
            </button>
          </div>
        )}
        <noscript>
          <p>预约预览需要启用 JavaScript。</p>
        </noscript>
        <form hidden={success} onSubmit={submit} method="post">
          <h2>
            {chosen === "trial" ? "预约创作体验" : "咨询" + plans[chosen].name}
          </h2>
          <label htmlFor="plan">感兴趣的方案</label>
          <select
            id="plan"
            value={chosen}
            onChange={(e) => setChosen(e.target.value as PlanKey)}
          >
            {Object.values(plans).map((p) => (
              <option key={p.key} value={p.key}>
                {p.name} · {p.variant}
              </option>
            ))}
          </select>
          <div className="form-row">
            <div>
              <label htmlFor="parent">怎么称呼您</label>
              <input
                id="parent"
                name="parent"
                autoComplete="name"
                placeholder="您的称呼"
                required
                maxLength={30}
              />
            </div>
            <div>
              <label htmlFor="age">孩子年龄</label>
              <select id="age" name="age" defaultValue="" required>
                <option value="" disabled>
                  请选择
                </option>
                {Array.from({ length: 9 }, (_, i) => (
                  <option key={i} value={i + 7}>
                    {i + 7} 岁
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label htmlFor="contact">联系方式</label>
          <input
            id="contact"
            name="contact"
            placeholder="手机号 / 微信号"
            autoComplete="off"
            required
            maxLength={80}
          />
          <label htmlFor="idea">
            孩子喜欢什么 <span>选填</span>
          </label>
          <textarea
            id="idea"
            name="idea"
            placeholder="游戏、绘画、太空，或者一个天马行空的想法……"
            rows={3}
            maxLength={500}
          />
          <button className="button primary form-submit" type="submit">
            预览预约 <ArrowUpRight size={18} />
          </button>
          <p className="form-note">当前为视觉预览，填写内容不会提交。</p>
        </form>
      </div>
    </section>
  );
}
export function NotFound() {
  return (
    <section className="not-found container">
      <p className="error-number">404</p>
      <h1>这个想法，还在路上。</h1>
      <Link className="button primary" to="/">
        回到首页 <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}

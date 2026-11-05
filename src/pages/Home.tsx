import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { HeroGallery } from "../components/HeroGallery";
import { Process } from "../components/Process";
import { ArrowLink, ContactCTA } from "../components/UI";
export function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="hero-intro">7–15 岁的 AI 创造营</p>
          <h1>
            有想法，<span>去创造。</span>
          </h1>
          <p className="hero-description">和 AI 一起，做出自己的第一个作品。</p>
          <div className="hero-actions">
            <Link className="button primary" to="/contact?plan=trial">
              开启免费体验 <ArrowUpRight size={17} />
            </Link>
            <ArrowLink to="/works">探索作品</ArrowLink>
          </div>
        </div>
        <HeroGallery />
      </section>
      <Process />
      <section className="trial-section">
        <div className="container trial-layout">
          <div>
            <h2>
              从一次
              <br />
              <span>免费体验开始。</span>
            </h2>
            <p>90 分钟，认识 AI，动手做一个小作品。</p>
            <Link className="button primary" to="/contact?plan=trial">
              预约免费体验 <ArrowRight size={17} />
            </Link>
            <ArrowLink to="/courses">了解课程与方案</ArrowLink>
          </div>
          <div className="trial-art" aria-hidden="true">
            <span className="trial-orbit orbit-one" />
            <span className="trial-orbit orbit-two" />
            <div className="trial-ticket">
              <span className="ticket-name">AI 创造营</span>
              <span className="ticket-time">
                90<span>分钟</span>
              </span>
              <span className="ticket-bottom">
                创作体验 <Play size={20} />
              </span>
            </div>
            <span className="trial-ball" />
          </div>
        </div>
      </section>
      <ContactCTA />
    </>
  );
}

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Header, Footer, RouteEffects } from "./components/Layout";
import { assetUrl } from "./lib/paths";
import { Home } from "./pages/Home";
import { Courses } from "./pages/Courses";
import { Works } from "./pages/Works";
import { WorkDetail } from "./pages/WorkDetail";
import { Contact, NotFound } from "./pages/Other";
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }
  render() {
    return this.state.failed ? (
      <div className="not-found container">
        <h1>页面暂时没准备好。</h1>
        <a className="button primary" href={assetUrl("/")}>
          重新打开首页
        </a>
      </div>
    ) : (
      this.props.children
    );
  }
}
export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <Boundary>
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/works" element={<Works />} />
            <Route path="/works/:id" element={<WorkDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Boundary>
      <Footer />
      <RouteEffects />
    </MotionConfig>
  );
}

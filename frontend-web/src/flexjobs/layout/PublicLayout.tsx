import { Outlet } from "react-router";
import AnimatedPage from "../../components/motion/AnimatedPage";
import Footer from "./Footer";
import Header from "./Header";

export default function PublicLayout() {
  return (
    <div className="fj-root flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AnimatedPage>
          <Outlet />
        </AnimatedPage>
      </main>
      <Footer />
    </div>
  );
}

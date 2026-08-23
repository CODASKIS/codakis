import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import MotionProvider from "./components/motion/MotionProvider.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <MotionProvider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </MotionProvider>
    </ThemeProvider>
  </StrictMode>,
);

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SheetProvider } from "@/components/ui/stackable-sheet";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SheetProvider>
      <App />
    </SheetProvider>
  </React.StrictMode>
);

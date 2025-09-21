import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Polyfill for Buffer used by Solana web3.js
import { Buffer } from "buffer";
window.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(<App />);

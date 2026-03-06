import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA with auto-update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        // Check for updates every 60 minutes
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SKIP_WAITING') {
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      })
      .catch(() => {
        // Service worker registration failed, but app still works
      });
  });
}

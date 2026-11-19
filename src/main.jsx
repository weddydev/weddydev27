import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

/* Performance: the liquid-gold shimmer animates background-position, which the GPU cannot
   composite, so every visible gold word repaints each frame. Pause it while off-screen
   (nobody can see it there). Also picks up elements React/SplitText create later. */
function pauseOffscreenGold() {
  if (!('IntersectionObserver' in window) || !('MutationObserver' in window)) return;
  const SEL = '.gold-text, .btn-gold, .gold-bg';
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => (e.isIntersecting ? e.target.removeAttribute('data-offscreen') : e.target.setAttribute('data-offscreen', ''))),
    { rootMargin: '120px 0px' }
  );
  const seen = new WeakSet();
  const watch = (el) => { if (!seen.has(el)) { seen.add(el); io.observe(el); } };
  const scan = (node) => {
    if (node.nodeType !== 1) return;
    if (node.matches(SEL)) watch(node);
    node.querySelectorAll(SEL).forEach(watch);
  };
  scan(document.body);
  new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach(scan);
      m.removedNodes.forEach((n) => { if (n.nodeType === 1) { if (n.matches(SEL)) io.unobserve(n); n.querySelectorAll(SEL).forEach((el) => io.unobserve(el)); } });
    }
  }).observe(document.body, { childList: true, subtree: true });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
pauseOffscreenGold();

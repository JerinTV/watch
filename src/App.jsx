import { useEffect, useMemo, useRef, useState } from "react";

const collections = [
  {
    name: "Tourbillon I",
    ref: "MV-001",
    desc: "Flying tourbillon, 72h reserve",
    accent: "#d6b36a",
  },
  {
    name: "Perpetuel",
    ref: "MV-002",
    desc: "Perpetual calendar, moonphase",
    accent: "#9fb8bd",
  },
  {
    name: "Chronographe",
    ref: "MV-003",
    desc: "Split-second chronograph",
    accent: "#d79b86",
  },
  {
    name: "Minute Repetiteur",
    ref: "MV-004",
    desc: "Grand sonnerie chimework",
    accent: "#a8c497",
  },
];

const stats = [
  ["139", "Years of mastery"],
  ["1,847", "Components per movement"],
  ["6", "Master watchmakers"],
  ["∞", "Hours of passion"],
];

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return progress;
}

function useInView(threshold = 0.18) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function usePointerParallax(strength = 1) {
  const [point, setPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * strength;
      const y = (event.clientY / window.innerHeight - 0.5) * strength;
      setPoint({ x, y });
    };

    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [strength]);

  return point;
}

function Reveal({ children, delay = 0, className = "", style }) {
  const [ref, visible] = useInView();

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--delay": `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

function AnimatedCounter({ value }) {
  const [ref, visible] = useInView(0.4);
  const [display, setDisplay] = useState(value === "∞" ? "∞" : "0");

  useEffect(() => {
    if (!visible || value === "∞") return;

    const numeric = Number(value.replace(/,/g, ""));
    let frame = 0;
    const totalFrames = 70;

    const animate = () => {
      frame += 1;
      const eased = 1 - Math.pow(1 - frame / totalFrames, 3);
      const next = Math.round(numeric * eased).toLocaleString("en-US");
      setDisplay(next);
      if (frame < totalFrames) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, visible]);

  return (
    <span ref={ref} className="counter">
      {display}
    </span>
  );
}

function MagneticButton({ children, className = "", ...props }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  const move = (event) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
    setStyle({ transform: `translate(${x}px, ${y}px)` });
  };

  return (
    <button
      ref={ref}
      className={`magnetic ${className}`}
      data-hover
      onMouseMove={move}
      onMouseLeave={() => setStyle({ transform: "translate(0, 0)" })}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}

function WatchDial({ size = 330, live = true, accent = "#d6b36a", speed = 1 }) {
  const [time, setTime] = useState(() => new Date());
  const id = useMemo(() => Math.random().toString(36).slice(2), []);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;

  useEffect(() => {
    if (!live) return;
    const interval = setInterval(() => setTime(new Date()), 1000 / speed);
    return () => clearInterval(interval);
  }, [live, speed]);

  const hour = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5;
  const minute = time.getMinutes() * 6 + time.getSeconds() * 0.1;
  const second = time.getSeconds() * 6;

  return (
    <svg
      className="watch-dial"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`dial-${id}`} cx="38%" cy="28%">
          <stop offset="0%" stopColor="#362818" />
          <stop offset="52%" stopColor="#18120d" />
          <stop offset="100%" stopColor="#070604" />
        </radialGradient>
        <linearGradient id={`case-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0dcae" />
          <stop offset="30%" stopColor="#a98b54" />
          <stop offset="62%" stopColor="#5c4c33" />
          <stop offset="100%" stopColor="#e2c889" />
        </linearGradient>
        <linearGradient id={`hand-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9c6d25" />
          <stop offset="45%" stopColor="#ffe7a8" />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
        <filter id={`soft-${id}`}>
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle className="case-glow" cx={cx} cy={cy} r={r + 9} fill="none" stroke={accent} />
      <circle cx={cx} cy={cy} r={r + 8} fill={`url(#case-${id})`} />
      <circle cx={cx} cy={cy} r={r + 1} fill="#080705" stroke="rgba(255,232,184,0.28)" />
      <circle cx={cx} cy={cy} r={r - 5} fill={`url(#dial-${id})`} />

      <g className="bezel-spin">
        {[...Array(72)].map((_, i) => {
          const angle = (i * 5 * Math.PI) / 180;
          const len = i % 6 === 0 ? 10 : 5;
          return (
            <line
              key={i}
              x1={cx + (r - len) * Math.cos(angle)}
              y1={cy + (r - len) * Math.sin(angle)}
              x2={cx + (r - 1) * Math.cos(angle)}
              y2={cy + (r - 1) * Math.sin(angle)}
              stroke={i % 6 === 0 ? accent : "rgba(225,190,125,0.32)"}
              strokeWidth={i % 6 === 0 ? 1.6 : 0.7}
            />
          );
        })}
      </g>

      <circle cx={cx} cy={cy} r={r - 34} fill="none" stroke="rgba(214,179,106,0.12)" />
      <circle cx={cx} cy={cy} r={r - 52} fill="none" stroke="rgba(214,179,106,0.08)" />

      <text x={cx} y={cy - 34} textAnchor="middle" className="dial-brand">
        MAISON VERNE
      </text>
      <text x={cx} y={cy - 19} textAnchor="middle" className="dial-subbrand">
        GENEVE · EST. 1887
      </text>

      <g className="tourbillon" style={{ transformOrigin: `${cx}px ${cy + 46}px` }}>
        <circle cx={cx} cy={cy + 46} r={21} fill="rgba(0,0,0,0.38)" stroke="rgba(214,179,106,0.3)" />
        {[...Array(6)].map((_, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy + 46}
            x2={cx + 17 * Math.cos((i * 60 * Math.PI) / 180)}
            y2={cy + 46 + 17 * Math.sin((i * 60 * Math.PI) / 180)}
            stroke={accent}
            strokeWidth="0.8"
            opacity="0.7"
          />
        ))}
        <circle cx={cx} cy={cy + 46} r={4} fill={accent} />
      </g>

      <g className="hand hour-hand" transform={`rotate(${hour}, ${cx}, ${cy})`} filter={`url(#soft-${id})`}>
        <path d={`M${cx} ${cy - r * 0.46} L${cx - 5} ${cy + 13} L${cx} ${cy + 21} L${cx + 5} ${cy + 13} Z`} fill={`url(#hand-${id})`} />
      </g>
      <g className="hand minute-hand" transform={`rotate(${minute}, ${cx}, ${cy})`} filter={`url(#soft-${id})`}>
        <path d={`M${cx} ${cy - r * 0.68} L${cx - 3} ${cy + 16} L${cx} ${cy + 25} L${cx + 3} ${cy + 16} Z`} fill={`url(#hand-${id})`} />
      </g>
      <g className="hand second-hand" transform={`rotate(${second}, ${cx}, ${cy})`}>
        <line x1={cx} y1={cy - r * 0.74} x2={cx} y2={cy + r * 0.22} stroke="#d34b36" strokeWidth="1.4" />
        <circle cx={cx} cy={cy} r={5} fill="#d34b36" />
        <circle cx={cx} cy={cy} r={2.5} fill="#ffe7a8" />
      </g>
    </svg>
  );
}

function CollectionReel() {
  const [active, setActive] = useState(0);
  const activeItem = collections[active];

  const step = (dir) => {
    setActive((current) => (current + dir + collections.length) % collections.length);
  };

  useEffect(() => {
    const interval = setInterval(() => step(1), 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="reel-shell">
      <div
        className="collection-track"
        style={{ transform: `translateX(calc(${active * -1} * min(420px, 82vw)))` }}
      >
        {collections.map((item, index) => (
          <article
            key={item.ref}
            className={`collection-card ${index === active ? "is-active" : ""}`}
            data-hover
            style={{ "--accent": item.accent }}
            onClick={() => setActive(index)}
          >
            <span className="card-ref">{item.ref}</span>
            <div className="card-dial">
              <WatchDial size={210} live={index === active} accent={item.accent} speed={index === active ? 1 : 0.5} />
            </div>
            <div className="card-line" />
            <h3>{item.name}</h3>
            <p>{item.desc}</p>
          </article>
        ))}
      </div>

      <div className="reel-footer">
        <div>
          <span>{activeItem.ref}</span>
          <strong>{activeItem.name}</strong>
        </div>
        <div className="arrow-row">
          <MagneticButton className="arrow-button" onClick={() => step(-1)}>
            ←
          </MagneticButton>
          <MagneticButton className="arrow-button" onClick={() => step(1)}>
            →
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const scrollProgress = useScrollProgress();
  const pointer = usePointerParallax(44);
  const [cursorVariant, setCursorVariant] = useState("idle");
  const cursorRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    let cx = 0;
    let cy = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let frame = 0;

    const move = (event) => {
      tx = event.clientX;
      ty = event.clientY;
    };
    const over = (event) => {
      if (event.target.closest("[data-hover]")) setCursorVariant("hover");
    };
    const out = () => setCursorVariant("idle");
    const animate = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${cx - 24}px, ${cy - 24}px)`;
      if (dotRef.current) dotRef.current.style.transform = `translate(${tx - 3}px, ${ty - 3}px)`;
      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
    };
  }, []);

  return (
    <main className="site">
      <style>{styles}</style>
      <div className="scrollbar" style={{ transform: `scaleX(${scrollProgress})` }} />
      <div className="grain" />
      <div className="cursor-ring" data-state={cursorVariant} ref={cursorRef} />
      <div className="cursor-dot" ref={dotRef} />

      <nav className={`nav ${scrollProgress > 0.03 ? "is-scrolled" : ""}`}>
        <a className="brand" href="#" data-hover>
          <span>Maison Verne</span>
          <small>Geneve · Est. 1887</small>
        </a>
        <div className="nav-links">
          {["Maison", "Collections", "Savoir-Faire", "Heritage", "Boutiques"].map((item) => (
            <a href={`#${item.toLowerCase()}`} key={item} data-hover>
              {item}
            </a>
          ))}
        </div>
        <MagneticButton className="ghost small">Reserve</MagneticButton>
      </nav>

      <section className="hero" id="maison">
        <div className="hero-bg" style={{ transform: `translate(${pointer.x * -0.12}px, ${pointer.y * -0.12}px)` }} />
        <div className="hero-copy">
          <Reveal>
            <p className="eyebrow">Nouvelle Collection 2026</p>
          </Reveal>
          <Reveal delay={120}>
            <h1>
              The Art of <em>Measured</em> Perfection
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="lede">
              Swiss haute horlogerie built like a living mechanism. Every dial, bridge, and hand moves with the patience of a master watchmaker.
            </p>
          </Reveal>
          <Reveal delay={360}>
            <div className="hero-actions">
              <MagneticButton className="primary">
                <span>Discover Collection</span>
                <span>→</span>
              </MagneticButton>
              <MagneticButton className="ghost">Our Ateliers</MagneticButton>
            </div>
          </Reveal>
        </div>

        <div
          className="hero-watch"
          style={{
            transform: `translate(${pointer.x}px, ${pointer.y}px) rotateX(${pointer.y * -0.08}deg) rotateY(${pointer.x * 0.08}deg)`,
          }}
        >
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-dot" />
          <WatchDial size={380} live accent="#d6b36a" />
        </div>

        <div className="scroll-cue">
          <span>Scroll</span>
          <i />
        </div>
      </section>

      <section className="stats-strip">
        {stats.map(([number, label], index) => (
          <Reveal key={label} delay={index * 80} className="stat">
            <AnimatedCounter value={number} />
            <span>{label}</span>
          </Reveal>
        ))}
      </section>

      <section className="section collections" id="collections">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">Les Collections</p>
            <h2>
              Timepieces born <em>from motion.</em>
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <a className="text-link" href="#boutiques" data-hover>
              View private allocation →
            </a>
          </Reveal>
        </div>
        <Reveal delay={220}>
          <CollectionReel />
        </Reveal>
      </section>

      <section className="editorial section" id="savoir-faire">
        <Reveal className="feature-card tall">
          <div className="large-watermark">
            <WatchDial size={430} live={false} accent="#d6b36a" />
          </div>
          <p className="eyebrow">Tourbillon Extraordinaire</p>
          <h2>
            Caliber MV-7 <em>Flying Tourbillon</em>
          </h2>
          <p>
            72 hours of power reserve, 25 jewels, and a cage machined to 0.001mm. Hover the panel and the movement wakes beneath the crystal.
          </p>
          <MagneticButton className="ghost">Explore →</MagneticButton>
        </Reveal>

        <Reveal delay={120} className="feature-card compact">
          <p className="eyebrow">Savoir-Faire</p>
          <h3>
            Every hand, <em>finished by eye.</em>
          </h3>
          <p>Anglage, polishing, Geneva stripes, and the almost invisible choices that make the watch feel alive.</p>
        </Reveal>

        <Reveal delay={220} className="feature-card compact dark">
          <div className="mini-dial">
            <WatchDial size={170} live accent="#d79b86" />
          </div>
          <p className="eyebrow">Limited Edition</p>
          <h3>
            12 pieces. <em>No exceptions.</em>
          </h3>
          <MagneticButton className="primary slim">Request Allocation</MagneticButton>
        </Reveal>
      </section>

      <section className="manifesto section" id="heritage">
        <Reveal>
          <p className="eyebrow">Notre Philosophie</p>
          <blockquote>
            We do not make watches for those who merely wish to know the time. <em>We make them for those who feel it.</em>
          </blockquote>
          <span>Henri Verne, Fondateur, 1887</span>
        </Reveal>
      </section>

      <section className="boutiques section" id="boutiques">
        <Reveal>
          <p className="eyebrow">Nos Boutiques</p>
          <h2>
            Where time <em>begins.</em>
          </h2>
          <p>Seven maisons across Geneva, Paris, Tokyo, New York, Dubai, Hong Kong, and London.</p>
        </Reveal>
        <div className="city-grid">
          {["Geneva", "Paris", "Tokyo", "New York"].map((city, index) => (
            <Reveal key={city} delay={index * 90} className="city-card">
              <span>{city}</span>
              <small>Flagship Maison</small>
            </Reveal>
          ))}
        </div>
      </section>

      <footer>
        <div>
          <strong>Maison Verne</strong>
          <span>Geneve · Est. 1887</span>
        </div>
        <p>© 2026 Maison Verne SA. All rights reserved.</p>
      </footer>
    </main>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Tenor+Sans&display=swap');

* { box-sizing: border-box; }
html { scroll-behavior: smooth; background: #090806; }
body { margin: 0; min-width: 320px; background: #090806; }
button, a { font: inherit; }
a { color: inherit; text-decoration: none; }
::selection { background: rgba(214,179,106,0.26); color: #ffe8bd; }

@keyframes grainMove { to { transform: translate3d(8%, -6%, 0); } }
@keyframes pulseRing { 0%, 100% { opacity: .18; scale: 1; } 50% { opacity: .48; scale: 1.045; } }
@keyframes orbitSpin { to { rotate: 360deg; } }
@keyframes tourbillonSpin { to { rotate: 360deg; } }
@keyframes breathe { 0%,100% { filter: drop-shadow(0 36px 76px rgba(0,0,0,.68)); } 50% { filter: drop-shadow(0 44px 92px rgba(214,179,106,.22)); } }
@keyframes shimmer { to { transform: translateX(135%); } }
@keyframes scrollPulse { 0% { transform: scaleY(0); transform-origin: top; } 45% { transform: scaleY(1); transform-origin: top; } 100% { transform: scaleY(0); transform-origin: bottom; } }
@keyframes handTick { 0% { scale: 1; } 50% { scale: 1.01; } 100% { scale: 1; } }

.site {
  min-height: 100vh;
  overflow-x: hidden;
  color: #eadfc9;
  background:
    radial-gradient(circle at 78% 12%, rgba(112,76,34,.28), transparent 34rem),
    radial-gradient(circle at 16% 46%, rgba(214,179,106,.12), transparent 30rem),
    linear-gradient(135deg, #0b0907 0%, #15100b 42%, #090806 100%);
  font-family: 'Tenor Sans', system-ui, sans-serif;
  cursor: none;
}

.scrollbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  transform-origin: left;
  background: linear-gradient(90deg, #8b6b33, #ffe1a0, #b78d3e);
  z-index: 2000;
}

.grain {
  position: fixed;
  inset: -160%;
  width: 360%;
  height: 360%;
  pointer-events: none;
  z-index: 1900;
  opacity: .032;
  animation: grainMove .36s steps(2) infinite;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='360'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='360' height='360' filter='url(%23n)'/%3E%3C/svg%3E");
}

.cursor-ring, .cursor-dot {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 2500;
}

.cursor-ring {
  width: 48px;
  height: 48px;
  border: 1px solid rgba(214,179,106,.55);
  border-radius: 50%;
  transition: width .28s ease, height .28s ease, border-color .28s ease, background .28s ease;
  mix-blend-mode: difference;
}

.cursor-ring[data-state='hover'] {
  width: 68px;
  height: 68px;
  border-color: rgba(255,225,160,.92);
  background: rgba(214,179,106,.08);
}

.cursor-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d6b36a;
}

.nav {
  position: fixed;
  inset: 0 0 auto;
  z-index: 1000;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 0 6vw;
  border-bottom: 1px solid transparent;
  transition: background .5s ease, border-color .5s ease, backdrop-filter .5s ease;
}

.nav.is-scrolled {
  background: rgba(9,8,6,.72);
  border-color: rgba(214,179,106,.12);
  backdrop-filter: blur(22px);
}

.brand {
  display: grid;
  gap: .18rem;
  text-transform: uppercase;
}

.brand span {
  color: #ffe3aa;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.35rem;
  letter-spacing: .22em;
}

.brand small {
  color: rgba(214,179,106,.48);
  font-size: .48rem;
  letter-spacing: .46em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: clamp(1rem, 3vw, 2.8rem);
}

.nav-links a, .text-link {
  position: relative;
  color: rgba(234,223,201,.55);
  font-size: .63rem;
  letter-spacing: .24em;
  text-transform: uppercase;
  transition: color .35s ease;
}

.nav-links a::after, .text-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -.45rem;
  width: 100%;
  height: 1px;
  transform: scaleX(0);
  transform-origin: right;
  background: #d6b36a;
  transition: transform .45s cubic-bezier(.16,1,.3,1);
}

.nav-links a:hover, .text-link:hover { color: #ffe3aa; }
.nav-links a:hover::after, .text-link:hover::after { transform: scaleX(1); transform-origin: left; }

.hero {
  min-height: 100svh;
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 44vw);
  align-items: center;
  gap: 2rem;
  padding: 7rem 6vw 4rem;
  isolation: isolate;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(90deg, rgba(9,8,6,.95) 0%, rgba(9,8,6,.72) 42%, rgba(9,8,6,.18) 100%),
    radial-gradient(ellipse at 76% 50%, rgba(214,179,106,.18), transparent 38rem),
    repeating-linear-gradient(0deg, rgba(214,179,106,.055) 0 1px, transparent 1px 82px);
  transition: transform .2s ease-out;
}

.hero-copy {
  position: relative;
  z-index: 2;
  max-width: 680px;
}

.eyebrow {
  margin: 0 0 1.4rem;
  color: rgba(214,179,106,.58);
  font-size: .66rem;
  letter-spacing: .42em;
  text-transform: uppercase;
}

h1, h2, h3, blockquote {
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 300;
  color: #f4ead7;
}

h1 {
  max-width: 720px;
  font-size: clamp(4rem, 8vw, 8.7rem);
  line-height: .88;
  letter-spacing: 0;
}

h2 {
  font-size: clamp(2.6rem, 5vw, 5.3rem);
  line-height: .98;
}

h3 {
  font-size: clamp(2rem, 3vw, 3.1rem);
  line-height: 1.05;
}

em { color: #d6b36a; font-style: italic; }

.lede {
  max-width: 520px;
  margin: 2rem 0 2.7rem;
  color: rgba(234,223,201,.58);
  font-size: .92rem;
  line-height: 1.95;
  letter-spacing: .04em;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.magnetic {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .9rem;
  min-height: 48px;
  border: 0;
  border-radius: 0;
  padding: 1rem 2rem;
  overflow: hidden;
  color: inherit;
  background: transparent;
  cursor: none;
  transition: transform .2s ease, border-color .35s ease, color .35s ease, box-shadow .35s ease;
}

.magnetic::before {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-120%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.26), transparent);
}

.magnetic:hover::before { animation: shimmer .85s ease; }

.primary {
  color: #100c08;
  background: linear-gradient(135deg, #b98a36, #ffe5a7 50%, #a97828);
  box-shadow: 0 18px 54px rgba(214,179,106,.18);
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .28em;
  text-transform: uppercase;
}

.primary:hover { box-shadow: 0 22px 70px rgba(214,179,106,.32); }

.ghost {
  border: 1px solid rgba(214,179,106,.27);
  color: rgba(255,225,160,.76);
  font-size: .66rem;
  letter-spacing: .26em;
  text-transform: uppercase;
}

.ghost:hover {
  border-color: rgba(255,225,160,.68);
  color: #ffe3aa;
  background: rgba(214,179,106,.055);
}

.small { min-height: 38px; padding: .7rem 1.15rem; font-size: .56rem; }
.slim { min-height: 42px; padding: .82rem 1.35rem; font-size: .58rem; }

.hero-watch {
  position: relative;
  justify-self: center;
  display: grid;
  place-items: center;
  transform-style: preserve-3d;
  transition: transform .18s ease-out;
  animation: breathe 4.6s ease-in-out infinite;
}

.orbit {
  position: absolute;
  border: 1px solid rgba(214,179,106,.13);
  border-radius: 50%;
  animation: pulseRing 4.8s ease-in-out infinite;
}

.orbit-one { width: 500px; height: 500px; }
.orbit-two { width: 620px; height: 620px; animation-delay: 1.1s; opacity: .6; }

.orbit-dot {
  position: absolute;
  width: 620px;
  height: 620px;
  border-radius: 50%;
  animation: orbitSpin 13s linear infinite;
}

.orbit-dot::after {
  content: '';
  position: absolute;
  top: 42px;
  left: 50%;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ffe1a0;
  box-shadow: 0 0 22px rgba(255,225,160,.8);
}

.watch-dial {
  overflow: visible;
  filter: drop-shadow(0 40px 82px rgba(0,0,0,.66));
}

.case-glow {
  opacity: .24;
  stroke-width: 2;
  animation: pulseRing 3.2s ease-in-out infinite;
  transform-origin: center;
}

.bezel-spin {
  transform-origin: center;
  animation: orbitSpin 70s linear infinite;
}

.dial-brand {
  fill: rgba(255,226,166,.76);
  font-family: 'Tenor Sans', sans-serif;
  font-size: 9px;
  letter-spacing: 4px;
}

.dial-subbrand {
  fill: rgba(214,179,106,.48);
  font-family: 'Tenor Sans', sans-serif;
  font-size: 5.5px;
  letter-spacing: 2.4px;
}

.tourbillon {
  animation: tourbillonSpin 4.5s linear infinite;
}

.hand {
  transform-origin: center;
  transition: transform .35s cubic-bezier(.2, 1.85, .3, 1);
}

.second-hand {
  animation: handTick 1s steps(1) infinite;
}

.scroll-cue {
  position: absolute;
  left: 50%;
  bottom: 2.5rem;
  display: grid;
  justify-items: center;
  gap: .85rem;
  transform: translateX(-50%);
  color: rgba(214,179,106,.42);
  font-size: .58rem;
  letter-spacing: .34em;
  text-transform: uppercase;
}

.scroll-cue i {
  width: 1px;
  height: 54px;
  background: linear-gradient(to bottom, #d6b36a, transparent);
  animation: scrollPulse 1.8s ease-in-out infinite;
}

.reveal {
  opacity: 0;
  transform: translateY(34px);
  transition: opacity .9s ease var(--delay), transform 1s cubic-bezier(.16,1,.3,1) var(--delay);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.stats-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-block: 1px solid rgba(214,179,106,.12);
  background: rgba(255,255,255,.015);
}

.stat {
  display: grid;
  justify-items: center;
  gap: .6rem;
  padding: 2.1rem 1rem;
  border-right: 1px solid rgba(214,179,106,.1);
  text-align: center;
}

.stat:last-child { border-right: 0; }

.counter {
  color: #ffe1a0;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3rem, 5vw, 5rem);
  line-height: .8;
}

.stat span:last-child {
  color: rgba(214,179,106,.46);
  font-size: .62rem;
  letter-spacing: .22em;
  text-transform: uppercase;
}

.section {
  padding: clamp(5rem, 9vw, 8rem) 6vw;
}

.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: clamp(3rem, 6vw, 5rem);
}

.reel-shell { overflow: hidden; }

.collection-track {
  display: flex;
  gap: 1.4rem;
  transition: transform .9s cubic-bezier(.16,1,.3,1);
  will-change: transform;
}

.collection-card {
  position: relative;
  min-width: min(420px, 82vw);
  padding: 2.1rem;
  overflow: hidden;
  border: 1px solid rgba(214,179,106,.13);
  background: linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.012));
  transition: transform .55s cubic-bezier(.16,1,.3,1), border-color .55s ease, background .55s ease, box-shadow .55s ease;
}

.collection-card::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  background: radial-gradient(circle at 50% 22%, color-mix(in srgb, var(--accent) 24%, transparent), transparent 22rem);
  transition: opacity .55s ease;
}

.collection-card:hover, .collection-card.is-active {
  transform: translateY(-12px);
  border-color: color-mix(in srgb, var(--accent) 62%, transparent);
  box-shadow: 0 26px 80px rgba(0,0,0,.28);
}

.collection-card:hover::before, .collection-card.is-active::before { opacity: 1; }

.card-ref {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  color: rgba(214,179,106,.42);
  font-size: .62rem;
  letter-spacing: .24em;
}

.card-dial {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  min-height: 230px;
}

.card-line {
  position: relative;
  z-index: 1;
  height: 1px;
  margin: 1.4rem 0;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: .45;
}

.collection-card h3 {
  position: relative;
  z-index: 1;
  margin-bottom: .7rem;
  font-size: 1.7rem;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.collection-card p {
  position: relative;
  z-index: 1;
  margin: 0;
  color: rgba(234,223,201,.48);
  font-size: .7rem;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.reel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2.5rem;
}

.reel-footer div:first-child {
  display: grid;
  gap: .35rem;
}

.reel-footer span {
  color: rgba(214,179,106,.42);
  font-size: .64rem;
  letter-spacing: .22em;
}

.reel-footer strong {
  color: #ffe1a0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.65rem;
  font-weight: 300;
}

.arrow-row { display: flex; gap: .7rem; }
.arrow-button {
  width: 52px;
  height: 52px;
  padding: 0;
  border: 1px solid rgba(214,179,106,.3);
  color: #d6b36a;
  font-size: 1.2rem;
}

.editorial {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: minmax(290px, auto);
  gap: 2px;
}

.feature-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 300px;
  padding: clamp(2rem, 4vw, 3.4rem);
  border: 1px solid rgba(214,179,106,.08);
  background: #15100b;
  transition: transform .7s cubic-bezier(.16,1,.3,1), border-color .5s ease, background .5s ease;
}

.feature-card::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  background: linear-gradient(135deg, rgba(214,179,106,.1), transparent 58%);
  transition: opacity .5s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(214,179,106,.35);
  background: #1a130d;
}

.feature-card:hover::after { opacity: 1; }
.feature-card > * { position: relative; z-index: 1; }
.feature-card.tall { grid-row: span 2; min-height: 610px; }
.feature-card.dark { background: #0d0b08; }
.feature-card p:not(.eyebrow) {
  max-width: 440px;
  color: rgba(234,223,201,.48);
  line-height: 1.85;
}

.large-watermark {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  opacity: .2;
  transform: translateY(-1rem);
}

.feature-card:hover .large-watermark {
  opacity: .32;
}

.mini-dial {
  position: absolute;
  right: -18px;
  bottom: -30px;
  opacity: .24;
}

.manifesto {
  position: relative;
  text-align: center;
  overflow: hidden;
}

.manifesto::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(760px, 86vw);
  aspect-ratio: 1;
  border: 1px solid rgba(214,179,106,.07);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulseRing 5s ease-in-out infinite;
}

blockquote {
  max-width: 980px;
  margin: 0 auto 2rem;
  font-size: clamp(2rem, 4.3vw, 5rem);
  line-height: 1.2;
}

.manifesto span {
  color: rgba(214,179,106,.38);
  font-size: .62rem;
  letter-spacing: .28em;
  text-transform: uppercase;
}

.boutiques {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(320px, 1fr);
  gap: clamp(3rem, 8vw, 7rem);
  align-items: center;
}

.boutiques p:not(.eyebrow) {
  max-width: 440px;
  color: rgba(234,223,201,.5);
  line-height: 1.9;
}

.city-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .8rem;
}

.city-card {
  padding: 2rem;
  border: 1px solid rgba(214,179,106,.12);
  transition: transform .45s cubic-bezier(.16,1,.3,1), border-color .45s ease, background .45s ease;
}

.city-card:hover {
  transform: translateY(-8px);
  border-color: rgba(214,179,106,.42);
  background: rgba(214,179,106,.045);
}

.city-card span {
  display: block;
  margin-bottom: .55rem;
  color: #ffe1a0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.7rem;
}

.city-card small {
  color: rgba(214,179,106,.42);
  font-size: .62rem;
  letter-spacing: .18em;
  text-transform: uppercase;
}

footer {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding: 4rem 6vw;
  border-top: 1px solid rgba(214,179,106,.12);
  color: rgba(214,179,106,.35);
  font-size: .7rem;
  letter-spacing: .12em;
}

footer div {
  display: grid;
  gap: .35rem;
}

footer strong {
  color: #ffe1a0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  font-weight: 300;
  letter-spacing: .18em;
  text-transform: uppercase;
}

@media (max-width: 980px) {
  .site { cursor: auto; }
  .cursor-ring, .cursor-dot { display: none; }
  .nav { padding: 0 1.25rem; }
  .nav-links { display: none; }
  .hero {
    grid-template-columns: 1fr;
    padding: 6.5rem 1.25rem 5rem;
  }
  .hero-watch {
    width: min(88vw, 390px);
    margin: 1rem auto 0;
  }
  .hero-watch .watch-dial { width: 100%; height: auto; }
  .orbit-one { width: 112%; height: 112%; }
  .orbit-two, .orbit-dot { width: 136%; height: 136%; }
  .stats-strip { grid-template-columns: repeat(2, 1fr); }
  .section { padding-inline: 1.25rem; }
  .section-head, .boutiques, footer {
    display: grid;
    grid-template-columns: 1fr;
  }
  .editorial { grid-template-columns: 1fr; }
  .feature-card.tall { min-height: 520px; }
}

@media (max-width: 560px) {
  .brand span { font-size: 1rem; }
  .brand small { letter-spacing: .3em; }
  .small { display: none; }
  h1 { font-size: clamp(3.2rem, 16vw, 4.6rem); }
  .hero-actions { align-items: stretch; }
  .magnetic { width: 100%; }
  .stats-strip { grid-template-columns: 1fr; }
  .stat { border-right: 0; border-bottom: 1px solid rgba(214,179,106,.1); }
  .city-grid { grid-template-columns: 1fr; }
  .reel-footer { align-items: start; flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .001ms !important;
  }
}
`;

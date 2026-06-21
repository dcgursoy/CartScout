import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Database,
  FileText,
  Flame,
  Gauge,
  Image as ImageIcon,
  LineChart,
  PackageSearch,
  Pause,
  Play,
  RefreshCcw,
  RotateCcw,
  Scissors,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Target,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState, type FormEvent } from 'react'
import './App.css'
import { stackPartners } from './data/stack'
import {
  componentScores,
  resultCharts,
  solvedTasks,
  stageSummaries,
  trainingRun,
  trainingStages,
} from './data/training'

const contextStreams = [
  { label: 'DOM', base: 18000, color: 'var(--blue)' },
  { label: 'Screens', base: 32000, color: 'var(--teal)' },
  { label: 'Chat', base: 22000, color: 'var(--amber)' },
  { label: 'Tools', base: 15000, color: 'var(--red)' },
]

const noisyContext = [
  'Sponsored card row, 41 links, 19 repeated labels',
  'Cookie banner markup and hidden nav menus',
  'Legacy chat turns about batteries and soap',
  'Image alt text for unrelated products',
  'Filter controls that mutate the result page',
  'Product title snippets with missing specs',
  'Scroll position, viewport events, timing logs',
  'Checkout and sign-in affordances to avoid',
]

const retainedContext = [
  'Task: compact USB-C wall charger',
  'Budget: under $35',
  'Must have: PPS, >=45W, wall plug',
  'Reject: cable, power bank, Lightning-only',
  'Evidence needed: title, price, specs, URL',
  'Next action: inspect candidate product page',
]

const loopSteps = [
  { icon: Target, title: 'Generate tasks', body: 'Diverse HUD shopping tasks with explicit constraints.' },
  { icon: Zap, title: 'Run episodes', body: 'Qwen agent acts through Fireworks inference.' },
  { icon: Database, title: 'Capture traces', body: 'Observation, action, context, and reward per step.' },
  { icon: Scissors, title: 'Compress context', body: 'compressr keeps what matters for the task.' },
  { icon: BrainCircuit, title: 'Improve policy', body: 'High-quality trajectories become training signal.' },
  { icon: BarChart3, title: 'Re-evaluate', body: 'Run held-out hard evals and repeat the loop.' },
]

const sponsoredSuggestionCatalog = [
  {
    tag: 'Sponsored',
    title: 'Wireless charger stand, cable not included',
    price: '$41.99',
    image: '/product-images/wireless-charger.svg',
    imageAlt: 'Wireless charger stand on a desk',
    reason: (requestLabel: string) =>
      `Ignores the actual "${requestLabel}" request and jumps to a promoted accessory.`,
  },
  {
    tag: 'Popular',
    title: 'Assorted home starter bundle',
    price: '$68.00',
    image: '/product-images/home-starter-bundle.svg',
    imageAlt: 'Home goods and storage items',
    reason: () => 'Looks plausible but misses the required product, budget, and evidence.',
  },
  {
    tag: 'Fast ship',
    title: 'Refurbished electronics multipack',
    price: '$29.50',
    image: '/product-images/refurbished-electronics.svg',
    imageAlt: 'Mixed electronics on a table',
    reason: () => 'Optimizes for delivery text instead of matching constraints.',
  },
  {
    tag: 'Trending',
    title: 'Premium leather travel organizer',
    price: '$54.95',
    image: '/product-images/leather-travel-organizer.svg',
    imageAlt: 'Travel accessory product photography',
    reason: () => 'Confuses adjacent shopping context with the user goal.',
  },
  {
    tag: 'Limited deal',
    title: 'Smart mug warmer kit',
    price: '$64.00',
    image: '/product-images/mug-warmer.svg',
    imageAlt: 'Coffee mug on a desk',
    reason: () => 'Optimizes for click appeal while ignoring the requested product category.',
  },
  {
    tag: 'Recommended',
    title: 'Designer desk lamp bundle',
    price: '$72.99',
    image: '/product-images/desk-lamp.svg',
    imageAlt: 'Desk lamp in a workspace',
    reason: () => 'Looks useful, but does not satisfy the search constraints.',
  },
  {
    tag: 'High rating',
    title: 'Portable smoothie blender',
    price: '$39.95',
    image: '/product-images/smoothie-blender.svg',
    imageAlt: 'Small blender with fruit',
    reason: () => 'Overweights rating signals instead of the requested item.',
  },
  {
    tag: 'Bundle',
    title: 'Cable organizer and adapter pack',
    price: '$22.00',
    image: '/product-images/cable-organizer.svg',
    imageAlt: 'Charging cables and adapters',
    reason: () => 'Matches the shopping vibe but not the user intent.',
  },
]

function getSponsoredSuggestions(requestLabel: string, seed: number) {
  return sponsoredSuggestionCatalog
    .map((item, index) => ({
      ...item,
      reason: item.reason(requestLabel),
      rank: Math.sin(seed + index * 17.17),
    }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 4)
}

function App() {
  const [showProject, setShowProject] = useState(false)

  if (!showProject) {
    return <ShoppingIntro onContinue={() => setShowProject(true)} />
  }

  return (
    <main className="app-shell">
      <TopNav />
      <HeroProblem />
      <CompressrSection />
      <ImprovementLoop />
      <ReplaySection />
      <TrainingArtifactsSection />
      <StackSection />
    </main>
  )
}

function ShoppingIntro({ onContinue }: { onContinue: () => void }) {
  const [productRequest, setProductRequest] = useState('')
  const [submittedRequest, setSubmittedRequest] = useState('')
  const [suggestionSeed, setSuggestionSeed] = useState(1)
  const hasRunSearch = submittedRequest.trim().length > 0
  const requestLabel = submittedRequest.trim() || 'your product'
  const badSuggestions = getSponsoredSuggestions(requestLabel, suggestionSeed)

  const runSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = productRequest.trim()
    if (!normalized) return
    setSubmittedRequest(normalized)
    setSuggestionSeed(Date.now() + Math.random())
  }

  return (
    <main className="shopping-intro">
      <section className="shopping-stage" aria-label="Shopping search demo">
        <div className="shopping-copy">
          <span className="eyebrow">
            <ShoppingCart size={16} />
            Try a shopping request
          </span>
          <h1>Search for a Product</h1>
          <form className="shopping-search" onSubmit={runSearch}>
            <Search size={19} />
            <input
              autoFocus
              aria-label="Product request"
              onChange={(event) => setProductRequest(event.currentTarget.value)}
              placeholder="headphones less than 50$"
              value={productRequest}
            />
            <button type="submit">Enter</button>
          </form>
        </div>

        <div className="shopping-browser" aria-live="polite">
          <div className="shopping-browser-top">
            <span />
            <span />
            <span />
            <strong>shop.local/search</strong>
          </div>
          <div className="shopping-query-row">
            <PackageSearch size={18} />
            <span>{hasRunSearch ? submittedRequest : 'Waiting for a product request...'}</span>
          </div>

          {hasRunSearch ? (
            <>
              <div className="shopping-results active">
                {badSuggestions.map((item, index) => (
                  <motion.article
                    animate={{ opacity: 1, y: 0 }}
                    className="bad-suggestion"
                    initial={{ opacity: 0, y: 18 }}
                    key={item.title}
                    transition={{ delay: index * 0.12, duration: 0.35 }}
                  >
                    <div className="suggestion-image">
                      <img alt={item.imageAlt} src={item.image} />
                    </div>
                    <div>
                      <span>{item.tag}</span>
                      <strong>{item.title}</strong>
                      <p>{item.reason}</p>
                    </div>
                    <small>{item.price}</small>
                  </motion.article>
                ))}
              </div>

              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="intro-cta-panel"
                initial={{ opacity: 0, y: 18 }}
                transition={{ delay: 0.55 }}
              >
                <div>
                  <strong>That mismatch is the problem CartScout trains against</strong>
                </div>
                <button onClick={onContinue} type="button">
                  <span>Open CartScout project</span>
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  )
}

function TopNav() {
  return (
    <header className="top-nav">
      <a className="brand-lockup" href="#top" aria-label="CartScout home">
        <span className="brand-mark">C</span>
        <span>
          <strong>CartScout</strong>
          <small>browser agent demo</small>
        </span>
      </a>
      <nav aria-label="Demo sections">
        <a href="#compressr">compressr</a>
        <a href="#loop">loop</a>
        <a href="#replay">replay</a>
        <a href="#artifacts">artifacts</a>
      </nav>
    </header>
  )
}

function HeroProblem() {
  const [pressure, setPressure] = useState(72)
  const tokenTotal = Math.round(28000 + pressure * 1450)
  const costIndex = Math.round(18 + pressure * 1.15)
  const frontierWall = Math.round(69 - pressure * 0.08)
  const qwenFootprint = 8
  const frontierFootprint = 180

  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <h1>Recursive self-improving browser agents without frontier-model burn</h1>
        <p>
          Browser work creates huge context: DOM, screenshots, tool logs, chat history, and
          constraint-heavy product evidence. Frontier systems still hit an accuracy wall on
          real browser tasks, and long chat context makes each attempt expensive.
        </p>
        <div className="hero-claims" aria-label="Core claims">
          <div>
            <strong>&lt;60-70%</strong>
            <span>common accuracy wall on broad browser automation</span>
          </div>
          <div>
            <strong>Qwen3-VL-8B</strong>
            <span>orders smaller than frontier-class policies</span>
          </div>
          <div>
            <strong>self improving</strong>
            <span>episodes become context-action training data</span>
          </div>
        </div>
      </div>

      <div className="problem-console" aria-label="Interactive context pressure visualizer">
        <div className="console-header">
          <span>Browser task pressure</span>
          <span>{pressure}%</span>
        </div>
        <label className="range-control">
          <span>Context load</span>
          <input
            type="range"
            min="25"
            max="100"
            value={pressure}
            onChange={(event) => setPressure(Number(event.currentTarget.value))}
            aria-label="Context load"
          />
        </label>

        <div className="context-bars">
          {contextStreams.map((stream, index) => {
            const height = Math.min(100, 20 + pressure * (0.42 + index * 0.08))
            return (
              <div className="context-column" key={stream.label}>
                <motion.div
                  className="context-bar"
                  style={{ background: stream.color, height: `${height}%` }}
                  animate={{ height: `${height}%` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                />
                <span>{stream.label}</span>
                <small>{Math.round(stream.base + pressure * 420).toLocaleString()} tok</small>
              </div>
            )
          })}
        </div>

        <div className="console-metrics">
          <MetricDial label="Context tokens" value={`${tokenTotal.toLocaleString()}`} icon={Gauge} />
          <MetricDial label="Cost index" value={`${costIndex}x`} icon={Flame} />
          <MetricDial label="Accuracy wall" value={`${frontierWall}%`} icon={ShieldCheck} />
        </div>

        <div className="model-scale">
          <div>
            <span>frontier-scale agent</span>
            <div className="scale-track">
              <motion.i
                style={{ width: `${Math.min(100, frontierFootprint / 2)}%` }}
                animate={{ width: `${Math.min(100, frontierFootprint / 2)}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <div>
            <span>Qwen3-VL-8B policy</span>
            <div className="scale-track small">
              <motion.i
                style={{ width: `${qwenFootprint * 2}%` }}
                animate={{ width: `${qwenFootprint * 2}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricDial({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  return (
    <div className="metric-dial">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function CompressrSection() {
  const [compression, setCompression] = useState(64)
  const inputTokens = 128000
  const outputTokens = Math.round(inputTokens * (1 - compression / 100) + 4200)
  const saved = Math.round(((inputTokens - outputTokens) / inputTokens) * 100)
  const compressionProgress = (compression - 20) / (88 - 20)
  const retainedCount = Math.max(
    2,
    Math.round(2 + (1 - compressionProgress) * (retainedContext.length - 2)),
  )

  return (
    <section className="section-block" id="compressr">
      <div className="section-heading">
        <span className="eyebrow">
          <Scissors size={16} />
          compressr
        </span>
        <h2>Task-aware context compression before every action.</h2>
        <p>
          compressr squashes large browser context into the constraints, evidence, action
          candidates, and failure risks that matter for the current task.
        </p>
      </div>

      <div className="compressor-app">
        <div className="compressor-toolbar">
          <div>
            <strong>Compression</strong>
            <span>{compression}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="88"
            value={compression}
            onChange={(event) => setCompression(Number(event.currentTarget.value))}
            aria-label="Compression"
          />
        </div>

        <div className="compressor-grid">
          <ContextPane title="Raw browser context" items={noisyContext} tone="raw" />
          <div className="compression-core" aria-hidden="true">
            <motion.div
              className="compression-blade"
              animate={{ rotate: [0, 12, -8, 0], scale: 0.92 + compression / 600 }}
              transition={{ repeat: Infinity, duration: 2.6 }}
            >
              <Scissors size={28} />
            </motion.div>
            <ArrowRight size={22} />
          </div>
          <ContextPane
            title="Retained task state"
            items={retainedContext.slice(0, retainedCount)}
            tone="kept"
          />
        </div>

        <div className="compression-stats">
          <StatPill label="Input" value={`${inputTokens.toLocaleString()} tokens`} />
          <StatPill label="Output" value={`${outputTokens.toLocaleString()} tokens`} />
          <StatPill label="Saved" value={`${saved}%`} />
          <StatPill label="Retained" value={`${retainedCount}/${retainedContext.length}`} />
        </div>
      </div>
    </section>
  )
}

function ContextPane({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: 'raw' | 'kept'
}) {
  return (
    <article className={`context-pane ${tone}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <motion.li layout key={item}>
            {tone === 'kept' ? <CheckCircle2 size={15} /> : <ChevronRight size={15} />}
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    </article>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ImprovementLoop() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % loopSteps.length)
    }, 1900)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="section-block loop-section" id="loop">
      <div className="section-heading">
        <span className="eyebrow">
          <RefreshCcw size={16} />
          Self-improving loop
        </span>
        <h2>Every rollout is training data, not just a pass/fail.</h2>
        <p>
          The agent produces high-quality context and action traces at each step. The loop turns
          those traces into a continually improving small browser policy.
        </p>
      </div>

      <div className="loop-stage">
        <div className="loop-orbit">
          {loopSteps.map((step, index) => {
            const Icon = step.icon
            const angle = (index / loopSteps.length) * Math.PI * 2 - Math.PI / 2
            const x = 50 + Math.cos(angle) * 39
            const y = 50 + Math.sin(angle) * 39
            const isActive = active === index
            return (
              <button
                className={`loop-node ${isActive ? 'active' : ''}`}
                key={step.title}
                style={{ left: `${x}%`, top: `${y}%` }}
                type="button"
                onClick={() => setActive(index)}
                aria-label={step.title}
              >
                <Icon size={22} />
              </button>
            )
          })}
          <div className="loop-center">
            <Workflow size={30} />
            <strong>CartScout</strong>
            <span>repeatable RL loop</span>
          </div>
        </div>

        <motion.article
          className="loop-detail"
          key={loopSteps[active].title}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>{String(active + 1).padStart(2, '0')}</span>
          <h3>{loopSteps[active].title}</h3>
          <p>{loopSteps[active].body}</p>
        </motion.article>
      </div>
    </section>
  )
}

const hudTraceDemos = [
  {
    label: 'AA batteries',
    title: 'AA batteries trace',
    id: '7f0d44d3-e247-4b98-9d3b-52808542a71c',
    traceUrl: 'https://www.hud.ai/shared/trace/7f0d44d3-e247-4b98-9d3b-52808542a71c',
    model: 'cart-scout-qwen3-8b-grpo',
    reward: '0.875',
    task: 'Find AA batteries under $25. Must be AA, 24 pack, no AAA or charger bundle.',
    frames: [
      {
        label: 'Scroll Amazon results',
        time: '0:16',
        src: '/hud-trace/frame-01.png',
        action: 'structured_cdp.scroll',
        detail: 'Amazon result page already contains AA battery packs, including 24-count candidates.',
      },
      {
        label: 'Try Target search',
        time: '0:37',
        src: '/hud-trace/frame-02.png',
        action: 'structured_cdp.search_retailer',
        detail: 'Target is unavailable, so the agent does not force the blocked page.',
      },
      {
        label: 'Return to Amazon',
        time: '1:05',
        src: '/hud-trace/frame-03.png',
        action: 'structured_cdp.search_retailer',
        detail: 'The agent finds a KODAK 24-pack AA result under the $25 budget.',
      },
      {
        label: 'Emit recommendation',
        time: '1:30',
        src: '/hud-trace/frame-04.png',
        action: 'structured_cdp.emit_packet',
        detail: 'The final packet recommends KODAK AA Alkaline Batteries, 24 pack, at $13.49.',
      },
    ],
  },
  {
    label: 'Cutting board',
    title: 'Cutting board trace',
    id: '735bcd37-d50f-4ea8-8f98-047284130ff0',
    traceUrl: 'https://www.hud.ai/shared/trace/735bcd37-d50f-4ea8-8f98-047284130ff0',
    model: 'Qwen/Qwen3.5-4B',
    reward: '0.95',
    task: 'Find a cutting board for a dorm room under $20. Must have BPA-free and cutting board. Must not be wood or glass.',
    frames: [
      {
        label: 'Open Target result',
        time: '0:18',
        src: '/hud-trace/cutting-board/frame-01.png',
        action: 'structured_cdp.click_ref',
        detail: 'Target opens to an unavailable page, so the agent has to recover.',
      },
      {
        label: 'Search Target directly',
        time: '0:42',
        src: '/hud-trace/cutting-board/frame-02.png',
        action: 'structured_cdp.search_retailer',
        detail: 'The agent searches Target for BPA-free plastic cutting boards under $20.',
      },
      {
        label: 'Inspect product page',
        time: '1:06',
        src: '/hud-trace/cutting-board/frame-03.png',
        action: 'structured_cdp.click_ref',
        detail: 'The product page shows a Figmint recycled poly cutting board for $6.00.',
      },
      {
        label: 'Emit recommendation',
        time: '1:20',
        src: '/hud-trace/cutting-board/frame-04.png',
        action: 'structured_cdp.emit_packet',
        detail: 'The final packet recommends the BPA-free recycled poly Target cutting board.',
      },
    ],
  },
]

function ReplaySection() {
  return (
    <section className="section-block replay-section" id="replay">
      <div className="section-heading">
        <span className="eyebrow">
          <Play size={16} />
          HUD trace replay
        </span>
        <h2>Watch the actual browser rollout.</h2>
        <p>
          These are shared HUD traces, played back from the real browser frames captured during
          rollouts.
        </p>
      </div>

      <div className="hud-demo-list">
        {hudTraceDemos.map((demo, index) => (
          <HudTraceDemo demo={demo} key={demo.id} number={index + 1} />
        ))}
      </div>
    </section>
  )
}

function HudTraceDemo({
  demo,
  number,
}: {
  demo: (typeof hudTraceDemos)[number]
  number: number
}) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(number === 1)
  const current = demo.frames[step]

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setStep((currentStep) => {
        return currentStep >= demo.frames.length - 1 ? 0 : currentStep + 1
      })
    }, 3000)
    return () => window.clearInterval(id)
  }, [demo.frames.length, playing])

  return (
    <article className="hud-demo-block">
      <div className="hud-demo-heading">
        <div>
          <span>Demo {number}</span>
          <h3>{demo.label}</h3>
          <p>{demo.task}</p>
        </div>
        <a className="icon-button secondary" href={demo.traceUrl} rel="noreferrer" target="_blank">
          <ArrowRight size={18} />
          <span>Open HUD trace</span>
        </a>
      </div>

      <div className="replay-controls">
        <button className="icon-button" type="button" onClick={() => setPlaying((value) => !value)}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
          <span>{playing ? 'Pause' : 'Play'}</span>
        </button>
        <button
          className="icon-button secondary"
          type="button"
          onClick={() => {
            setStep(0)
            setPlaying(false)
          }}
        >
          <RotateCcw size={18} />
          <span>Reset</span>
        </button>
      </div>

      <div className="hud-replay-grid">
        <article className="hud-replay-player">
          <div className="hud-replay-top">
            <span />
            <span />
            <span />
            <strong>hud.ai/shared/trace/{demo.id.slice(0, 8)}...</strong>
          </div>
          <div className="hud-frame-wrap">
            {demo.frames.map((frame, index) => (
              <motion.img
                alt={`${frame.label} screenshot`}
                animate={{ opacity: index === step ? 1 : 0 }}
                className="hud-frame"
                initial={false}
                key={`${demo.id}-${frame.src}`}
                src={frame.src}
                transition={{ duration: 0.35 }}
              />
            ))}
          </div>
          <div className="hud-replay-progress" aria-label="HUD replay frames">
            {demo.frames.map((frame, index) => (
              <button
                aria-label={`Jump to ${frame.label}`}
                className={index === step ? 'active' : ''}
                key={`${demo.id}-${frame.src}`}
                onClick={() => {
                  setStep(index)
                  setPlaying(false)
                }}
                type="button"
              >
                <span>{frame.time}</span>
              </button>
            ))}
          </div>
        </article>

        <aside className="hud-replay-detail">
          <span>{demo.title} · screen {step + 1} / {demo.frames.length}</span>
          <h3>{current.label}</h3>
          <p>{current.detail}</p>
          <dl>
            <div>
              <dt>Action</dt>
              <dd>{current.action}</dd>
            </div>
            <div>
              <dt>Task</dt>
              <dd>{demo.task}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>{demo.model}</dd>
            </div>
            <div>
              <dt>Reward</dt>
              <dd>{demo.reward}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </article>
  )
}

function TrainingArtifactsSection() {
  const bestStageReward = Math.max(...trainingStages.map((stage) => stage.rewardMean))
  const finalStage = trainingStages[trainingStages.length - 1]
  const topComponents = componentScores.slice(0, 5)

  return (
    <section className="section-block artifacts-section" id="artifacts">
      <div className="section-heading">
        <span className="eyebrow">
          <LineChart size={16} />
          Training artifacts
        </span>
        <h2>Training artifacts from the CartScout run.</h2>
        <p>
          The site bundles the GRPO report, training stats CSV, error analysis JSON, and generated
          charts from the fetched CartScout result artifacts.
        </p>
      </div>

      <div className="artifact-hero">
        <div>
          <span>Training run</span>
          <strong>{trainingRun.trainedModel}</strong>
          <p>
            Trained from {trainingRun.model} across {trainingRun.totalRollouts} rollouts and{' '}
            {trainingRun.totalTasks} tasks.
          </p>
        </div>
        <div className="artifact-stats">
          <StatPill label="Reward mean" value={formatPct(finalStage.rewardMean)} />
          <StatPill label="Best stage" value={formatPct(bestStageReward)} />
          <StatPill label="Hard-zero rate" value={formatPct(trainingRun.hardZeroRate)} />
        </div>
      </div>

      <div className="training-grid">
        <article className="training-card timeline-card">
          <div className="metric-card-head">
            <span>training_stats.csv</span>
            <strong>{trainingStages.length}</strong>
          </div>
          <h3>Optimization stages</h3>
          <div className="stage-list">
            {trainingStages.map((stage) => (
              <div className="stage-row" key={stage.label}>
                <div>
                  <strong>{stage.label}</strong>
                  <span>
                    {stage.taskWindow} · {stage.rollouts} rollouts ·{' '}
                    {stage.judged ? 'LLM judged' : 'deterministic reward'}
                  </span>
                </div>
                <div className="stage-meter" aria-label={`${stage.label} reward mean`}>
                  <i style={{ width: `${(stage.rewardMean / bestStageReward) * 100}%` }} />
                </div>
                <strong>{formatPct(stage.rewardMean)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="training-card">
          <div className="metric-card-head">
            <span>error_analysis_training.json</span>
            <strong>{trainingRun.hardZeroRollouts}</strong>
          </div>
          <h3>Error analysis</h3>
          <div className="component-list">
            {topComponents.map((component) => (
              <div className="component-row" key={component.component}>
                <span>{component.component}</span>
                <strong>{formatPct(component.mean)}</strong>
                <small>{formatPct(component.zeroRate)} zero</small>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="stage-summary-grid">
        {stageSummaries.map((stage) => (
          <article className="summary-card" key={stage.stage}>
            <span>{stage.stage}</span>
            <strong>{formatPct(stage.hardZeroRate)}</strong>
            <small>
              {stage.rolloutsLogged} rollouts · {stage.infraRunFailures} infra failures ·{' '}
              {stage.rowRange}
            </small>
          </article>
        ))}
      </div>

      <div className="chart-gallery">
        {resultCharts.map((chart) => (
          <figure className="chart-card" key={chart.src}>
            <img alt={chart.title} src={chart.src} />
            <figcaption>
              <strong>{chart.title}</strong>
              <span>{chart.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="artifact-links">
        <a href="/results/grpo_training_report_qwen3_8b.md">
          <FileText size={18} />
          GRPO report
        </a>
        <a href="/results/training_stats.csv">
          <Database size={18} />
          training_stats.csv
        </a>
        <a href="/results/error_analysis_training.json">
          <FileText size={18} />
          error_analysis_training.json
        </a>
        <a href="/results/error_analysis_per_task_reward_hist.png">
          <ImageIcon size={18} />
          task reward histogram
        </a>
      </div>

      <div className="solved-band">
        <CheckCircle2 size={20} />
        <div>
          <strong>Highest solved training tasks</strong>
          <span>
            {solvedTasks
              .map((task) => `${task.taskId.replace('train_', '')}: ${formatPct(task.meanReward)}`)
              .join(' / ')}
          </span>
        </div>
      </div>
    </section>
  )
}

function StackSection() {
  return (
    <section className="section-block stack-section">
      <div className="section-heading">
        <span className="eyebrow">
          <SlidersHorizontal size={16} />
          Stack
        </span>
        <h2>Purpose-built agent training stack.</h2>
      </div>
      <div className="stack-grid">
        {stackPartners.map((partner) => (
          <article className="stack-card" key={partner.name}>
            <img alt={partner.imageAlt} className="partner-mark" src={partner.image} />
            <div>
              <h3>{partner.name}</h3>
              <strong>{partner.role}</strong>
              <p>{partner.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function formatPct(value: number) {
  return `${Math.round(value * 1000) / 10}%`
}

export default App

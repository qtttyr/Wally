import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Scan,
  BarChart3,
  Sparkles,
  Check,
  Wallet,
  Coffee,
  Car,
  ShoppingBag,
  Home,
  Gamepad2,
  Smartphone,
  Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { ROUTES } from "@/constants/routes"

/* ─────────────────────────────────────────────
   Screens config
   ───────────────────────────────────────────── */

const SCREENS = [
  { id: "hook", duration: 4000 },
  { id: "scan", duration: 4500 },
  { id: "insight", duration: 4000 },
  { id: "budget", duration: null }, // manual
] as const

/* ─────────────────────────────────────────────
   Particles
   ───────────────────────────────────────────── */

function Particles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 3,
    duration: Math.random() * 4 + 4,
  }))

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/10 dark:bg-primary/5"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Phone Mockup
   ───────────────────────────────────────────── */

function PhoneMockup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[240px] h-[500px] rounded-[2.5rem] border-4 border-foreground/10 bg-background shadow-2xl shadow-black/20 overflow-hidden",
        className
      )}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground/10 rounded-b-2xl z-10" />
      {/* Screen */}
      <div className="absolute inset-0 pt-8 pb-4 px-3 flex flex-col">{children}</div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Screen 1: Hook — Compact animated counter
   ───────────────────────────────────────────── */

function HookScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [count, setCount] = useState(0)
  const target = 124500

  // Timeline: counter immediately, icons at 1.8s, wally at 3.2s
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1800)
    const t2 = setTimeout(() => setStep(2), 3400)
    const t3 = setTimeout(onDone, 4800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  // Counter animates from mount
  useEffect(() => {
    const start = Date.now()
    const dur = 2000
    const id = setInterval(() => {
      const p = Math.min((Date.now() - start) / dur, 1)
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p >= 1) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [])

  const formatted = new Intl.NumberFormat("ru-RU").format(count)

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-8 pb-2">
      {/* ─── Counter ─── */}
      <div className="flex flex-col items-center gap-2">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase"
        >
          Тратишь не замечая
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", damping: 16, stiffness: 140 }}
          className="text-center mt-2"
        >
          <p className="text-[11px] text-muted-foreground/70 font-medium">В месяц</p>
          <p className="text-5xl font-black tabular-nums leading-none mt-0.5 text-foreground">
            {formatted}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-primary ml-1"
            >
              ₸
            </motion.span>
          </p>
          {/* Thin progress bar */}
          <div className="w-full max-w-[200px] h-0.5 bg-muted rounded-full mx-auto mt-3 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((count / target) * 100, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </div>

      {/* ─── Icons row ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap justify-center gap-1.5 mt-5 max-w-[280px]"
      >
        {[
          ["☕", "500"],
          ["🚕", "1 200"],
          ["🍔", "2 500"],
          ["🎮", "7 000"],
          ["🛒", "4 300"],
          ["🏠", "35 000"],
        ].map(([emoji, amt], i) => (
          <motion.div
            key={emoji}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.12, type: "spring", damping: 13, stiffness: 150 }}
            className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1"
          >
            <span className="text-sm">{emoji}</span>
            <span className="text-[10px] font-semibold tabular-nums text-secondary-foreground">{amt} ₸</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Wally card ─── */}
      {step >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 140 }}
          className="mt-5 flex items-center gap-2.5 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5"
        >
          <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/30">
            <Wallet size={14} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Wally поможет</p>
            <p className="text-[10px] text-muted-foreground">Контролировать каждую трату</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Screen 2: Scan — BIG full-screen scanner hero
   ───────────────────────────────────────────── */

const RECEIPT_ITEMS = [
  { name: "Хлеб Бородинский", price: "420 ₸" },
  { name: "Молоко 3.2%", price: "580 ₸" },
  { name: "Сыр Российский", price: "1 500 ₸" },
  { name: "Масло слив.", price: "890 ₸" },
  { name: "Йогурт", price: "650 ₸" },
]

const SCAN_LINE_STEPS = [1, 2, 3, 4, 5, 6] // 6 lines to scan

function ScanScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [scanLine, setScanLine] = useState(0)
  const [showAmount, setShowAmount] = useState(false)
  const [showBadge, setShowBadge] = useState(false)
  const [amount, setAmount] = useState(0)
  const targetAmount = 8750

  // Main timeline
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 400)   // receipt appears
    const t2 = setTimeout(() => setStep(2), 1000)  // scan starts
    const t3 = setTimeout(() => setStep(3), 3400)  // scan done, amount shows
    const t4 = setTimeout(() => { setShowBadge(true) }, 4000) // badge
    const t5 = setTimeout(onDone, 5200)             // advance
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [onDone])

  // Scan line progression
  useEffect(() => {
    if (step !== 2) return
    if (scanLine >= SCAN_LINE_STEPS.length) return
    const t = setTimeout(() => setScanLine((s) => s + 1), 350)
    return () => clearTimeout(t)
  }, [step, scanLine])

  // Animated amount counter
  useEffect(() => {
    if (step !== 3) return
    const start = Date.now()
    const duration = 800
    const id = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setAmount(Math.round(eased * targetAmount))
      if (p >= 1) {
        clearInterval(id)
        setShowAmount(true)
      }
    }, 16)
    return () => clearInterval(id)
  }, [step])

  const scanProgress = Math.min(scanLine / SCAN_LINE_STEPS.length, 1)

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden">
      {/* Header */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-3 text-[10px] text-muted-foreground font-semibold tracking-widest uppercase"
      >
        Сканирование чека
      </motion.p>

      {/* ─── Main scan area ─── */}
      <div className="flex-1 w-full flex items-center justify-center px-4">
        <div className="relative w-full max-w-[300px] aspect-[3/4]">
          {/* Camera viewfinder frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-primary rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-primary rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-primary rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-primary rounded-br-2xl" />

            {/* Viewfinder inner area */}
            <div className="absolute inset-[10px] rounded-xl bg-card border border-border/40 overflow-hidden">
              {/* Receipt */}
              <AnimatePresence mode="wait">
                {step >= 1 && (
                  <motion.div
                    key="receipt-body"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 18, stiffness: 160 }}
                    className="w-full h-full flex flex-col p-2"
                  >
                    {/* Store header */}
                    <div className="text-center border-b border-border/20 pb-1 mb-1">
                      <p className="text-[11px] font-bold tracking-widest uppercase">Magnum</p>
                      <p className="text-[9px] text-muted-foreground">ТОО Magnum Cash&amp;Carry</p>
                    </div>

                    {/* Items */}
                    <div className="flex-1 space-y-0.5">
                      {RECEIPT_ITEMS.map((item, i) => {
                        const isScanned = step === 2 ? scanLine > i : step > 2
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{
                              opacity: isScanned ? 1 : 0.2,
                              x: isScanned ? 0 : -5,
                            }}
                            transition={{ duration: 0.3 }}
                            className="flex justify-between items-center"
                          >
                            <span className={`text-xs transition-colors ${isScanned ? "text-foreground" : "text-muted-foreground/40"}`}>
                              {item.name}
                            </span>
                            <span className={`text-xs tabular-nums font-semibold transition-colors ${isScanned ? "text-foreground" : "text-muted-foreground/40"}`}>
                              {item.price}
                            </span>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Total — lights up when scanned */}
                    <motion.div
                      animate={{
                        opacity: scanLine >= SCAN_LINE_STEPS.length - 1 ? 1 : 0.3,
                      }}
                      className="border-t border-border/20 pt-1 mt-1 flex justify-between"
                    >
                      <span className="text-xs font-bold">ИТОГО:</span>
                      <span className="text-xs font-bold tabular-nums">8 750 ₸</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scan line beam */}
              {step === 2 && (
                <motion.div
                  className="absolute left-0 right-0 h-0.5 z-20"
                  style={{
                    top: `${scanProgress * 90 + 5}%`,
                    boxShadow: "0 0 12px 2px var(--primary), 0 0 24px 4px var(--primary/30)",
                    background: "linear-gradient(90deg, transparent, var(--primary), transparent)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 0.2 }}
                />
              )}

              {/* Glow on scan area */}
              {step === 2 && (
                <motion.div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    background: `linear-gradient(to bottom,
                      transparent 0%,
                      transparent ${scanProgress * 90}%,
                      rgba(13, 148, 136, 0.08) ${scanProgress * 90}%,
                      transparent ${scanProgress * 90 + 10}%,
                      transparent 100%
                    )`,
                  }}
                />
              )}
            </div>
          </motion.div>

          {/* ─── Result overlay — BIG amount ─── */}
          <AnimatePresence>
            {step >= 3 && (
              <motion.div
                key="result-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/92 backdrop-blur-sm rounded-2xl"
              >
                {/* Scan complete check */}
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 130 }}
                  className="size-12 rounded-full bg-primary flex items-center justify-center mb-4 shadow-xl shadow-primary/30"
                >
                  <Check size={22} className="text-primary-foreground" />
                </motion.div>

                <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase mb-1">
                  Распознано AI
                </p>

                {/* BIG AMOUNT — the hero */}
                <div className="relative">
                  <motion.p
                    className="text-6xl font-black tabular-nums text-foreground leading-none"
                    animate={showAmount ? { scale: [1, 1.06, 1] } : {}}
                    transition={{ duration: 0.4, type: "spring" }}
                  >
                    {amount.toLocaleString("ru-RU")}
                  </motion.p>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -right-10 top-1 text-3xl font-black text-primary"
                  >
                    ₸
                  </motion.span>
                </div>

                {/* Category badge */}
                {showBadge && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 14, stiffness: 150 }}
                    className="mt-4 flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-semibold px-4 py-1.5 border border-emerald-500/20"
                  >
                    <ShoppingBag size={12} />
                    Категория: Продукты
                  </motion.div>
                )}

                {/* Date */}
                {showBadge && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-2 text-[10px] text-muted-foreground"
                  >
                    17 июля 2026, 15:42
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Sparkle particles on scan complete ─── */}
          {step >= 3 && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute z-40 size-1.5 rounded-full bg-primary"
                  initial={{
                    opacity: 1,
                    x: "50%",
                    y: "50%",
                    scale: 0,
                  }}
                  animate={{
                    opacity: 0,
                    x: `${40 + Math.cos(i * 1.2) * 60}%`,
                    y: `${30 + Math.sin(i * 1.2) * 50}%`,
                    scale: [0, 2, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: 0.2 + i * 0.08,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Bottom text */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center pb-4 px-4"
      >
        <h2 className="text-lg font-bold">Сканируй чеки за секунду</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          ИИ сам распознаёт сумму, категорию и дату
        </p>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Screen 3: Budget Insight — animated stats
   ───────────────────────────────────────────── */

function InsightScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [spentCount, setSpentCount] = useState(0)
  const targetSpent = 78500
  const budgetLimit = 200000

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 600)
    const t2 = setTimeout(() => setStep(2), 2600)
    const t3 = setTimeout(onDone, 4000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  // Animated counter
  useEffect(() => {
    if (step !== 1) return
    const start = Date.now()
    const duration = 1400
    const id = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setSpentCount(Math.round(eased * targetSpent))
      if (p >= 1) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [step])

  const pct = Math.round((targetSpent / budgetLimit) * 100)

  return (
    <div className="flex flex-col h-full justify-center items-center gap-5 px-2">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <p className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase">
          Аналитика
        </p>
      </motion.div>

      <PhoneMockup className="scale-[0.9] -my-2">
        <div className="flex flex-col h-full justify-center items-center px-3">
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 18, stiffness: 150 }}
              className="w-full space-y-4"
            >
              {/* Spent amount */}
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Потрачено в этом месяце</p>
                <motion.p
                  className="text-3xl font-black tabular-nums"
                  animate={{ scale: spentCount < targetSpent ? [1, 1.04, 1] : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {spentCount.toLocaleString("ru-RU")} ₸
                </motion.p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 px-2">
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>Прогресс</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
                <p className="text-[9px] text-muted-foreground text-right">
                  Лимит: {budgetLimit.toLocaleString("ru-RU")} ₸
                </p>
              </div>

              {/* Categories mini-chart */}
              <div className="px-2 space-y-1.5">
                {[
                  { label: "Еда", amount: 34000, color: "bg-emerald-500" },
                  { label: "Транспорт", amount: 12500, color: "bg-blue-500" },
                  { label: "Развлечения", amount: 8900, color: "bg-purple-500" },
                ].map((cat, i) => {
                  const w = Math.min((cat.amount / targetSpent) * 100, 100)
                  return (
                    <div key={cat.label} className="flex items-center gap-2">
                      <span className="w-14 text-[8px] text-muted-foreground text-right">{cat.label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${cat.color}`}
                          initial={{ width: "0%" }}
                          animate={{ width: `${w}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 + i * 0.2 }}
                        />
                      </div>
                      <span className="w-12 text-[8px] tabular-nums text-right">{cat.amount.toLocaleString("ru-RU")} ₸</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </PhoneMockup>

      {step >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1"
        >
          <h2 className="text-lg font-bold">Полная картина</h2>
          <p className="text-xs text-muted-foreground max-w-[260px]">
            Категории, тренды и AI-советы по экономии
          </p>
        </motion.div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Screen 4: Budget Setup
   ───────────────────────────────────────────── */

function BudgetSetupScreen({ onDone }: { onDone: () => void }) {
  const [budget, setBudget] = useState(200000)
  const [isSaving, setIsSaving] = useState(false)
  const { user, updateProfile } = useAuth()

  const formatKZT = (n: number) => new Intl.NumberFormat("ru-RU").format(n)

  const presets = [50000, 100000, 200000, 500000]

  const handleFinish = async () => {
    if (!user) return
    setIsSaving(true)
    await updateProfile({ monthly_budget: budget } as any)
    onDone()
  }

  return (
    <div className="flex flex-col h-full justify-center items-center gap-6 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 160 }}
        className="w-full max-w-xs"
      >
        {/* Title */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 140, delay: 0.1 }}
                className="size-16 rounded-2xl bg-primary/15 flex items-center justify-center"
              >
                <Wallet size={28} className="text-primary" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold">Твой месячный бюджет</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Сколько ты планируешь тратить в месяц?
            </p>
          </motion.div>
        </div>

        {/* Presets */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-6"
        >
          {presets.map((v) => (
            <button
              key={v}
              onClick={() => setBudget(v)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                budget === v
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/20"
              )}
            >
              {formatKZT(v)} ₸
            </button>
          ))}
        </motion.div>

        {/* Counter input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <button
            onClick={() => setBudget((b) => Math.max(0, b - 10000))}
            className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-foreground/70 text-2xl font-light transition-all active:scale-90 hover:bg-primary/20 hover:text-primary"
          >
            −
          </button>

          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              value={budget === 0 ? "" : `${formatKZT(budget)} ₸`}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "")
                setBudget(raw ? Number(raw) : 0)
              }}
              onFocus={(e) => e.target.select()}
              className="h-20 w-52 rounded-3xl border-2 border-border bg-card text-center text-3xl font-bold tabular-nums text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
          </div>

          <button
            onClick={() => setBudget((b) => Math.min(9_999_999, b + 10000))}
            className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-foreground/70 text-2xl font-light transition-all active:scale-90 hover:bg-primary/20 hover:text-primary"
          >
            +
          </button>
        </motion.div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[11px] text-muted-foreground/60 mb-6"
        >
          Можно изменить в любое время в настройках
        </motion.p>

        {/* Action */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleFinish}
            disabled={isSaving || budget === 0}
            className="w-full h-13 rounded-2xl text-base gap-2 font-semibold shadow-xl shadow-primary/25"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Сохраняем…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Начать
                <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────── */

export default function OnboardingPage() {
  const [screen, setScreen] = useState(0)
  const navigate = useNavigate()

  const next = useCallback(() => {
    if (screen < SCREENS.length - 1) {
      setScreen((s) => s + 1)
    }
  }, [screen])

  const finish = useCallback(() => {
    navigate(ROUTES.DASHBOARD, { replace: true })
  }, [navigate])

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center overflow-hidden relative selection:bg-primary/20">
      {/* Animated gradient background */}
      <motion.div
        className="fixed inset-0 -z-10"
        animate={{
          background: [
            "radial-gradient(ellipse at 30% 20%, oklch(0.55 0.17 160 / 0.15) 0%, transparent 60%)",
            "radial-gradient(ellipse at 70% 80%, oklch(0.55 0.17 150 / 0.12) 0%, transparent 60%)",
            "radial-gradient(ellipse at 50% 50%, oklch(0.55 0.17 170 / 0.1) 0%, transparent 60%)",
            "radial-gradient(ellipse at 30% 20%, oklch(0.55 0.17 160 / 0.15) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <Particles />

      <AnimatePresence mode="wait">
        {SCREENS[screen].id === "hook" && (
          <motion.div
            key="hook"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm px-6"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
              >
                <PhoneMockup>
                  <HookScreen onDone={next} />
                </PhoneMockup>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
                  Wally отслеживает траты
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {SCREENS[screen].id === "scan" && (
          <motion.div
            key="scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm px-6"
          >
            <ScanScreen onDone={next} />
          </motion.div>
        )}

        {SCREENS[screen].id === "insight" && (
          <motion.div
            key="insight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm px-6"
          >
            <InsightScreen onDone={next} />
          </motion.div>
        )}

        {SCREENS[screen].id === "budget" && (
          <motion.div
            key="budget"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm px-6"
          >
            <BudgetSetupScreen onDone={finish} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen indicator dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {SCREENS.map((s, i) => (
          <motion.div
            key={s.id}
            className={cn(
              "rounded-full transition-all duration-300",
              i === screen
                ? "w-6 h-1.5 bg-primary"
                : "w-1.5 h-1.5 bg-muted-foreground/30"
            )}
            layout
            layoutId="dot"
          />
        ))}
      </div>

      {/* Skip button — only before last screen */}
      {screen < SCREENS.length - 1 && (
        <button
          onClick={() => setScreen(SCREENS.length - 1)}
          className="fixed top-6 right-6 z-20 rounded-full bg-secondary/80 backdrop-blur-md px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary"
        >
          Пропустить
        </button>
      )}
    </div>
  )
}

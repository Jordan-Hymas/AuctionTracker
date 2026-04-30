import { useEffect, useState, useRef } from 'react';
import { Bid } from '../../types/bid';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface PaddleNumberDisplayProps {
  lastBid: Bid | null;
  currentDonationLevel: number | null;
  paddleDigits?: number;
  themeName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  /** Called the moment a queued paddle begins its enter animation.
   *  Use this to advance the displayed total / progress bar in sync. */
  onBidDisplayed?: (bid: Bid) => void;
}

type AnimPhase = 'idle' | 'exiting' | 'entering';

// Each item in the queue carries the donation level that was active when the
// bid was entered.  This lets the level update atomically with the paddle
// that starts each new group instead of globally when the queue drains.
interface QueuedItem {
  bid: Bid;
  level: number | null;
}

// Tuning knobs ──────────────────────────────────────────────────────────────
const EXIT_MS    = 350;   // how long the card takes to swivel out
const ENTER_MS   = 420;   // how long the card takes to swivel in
const DISPLAY_MS = 1400;  // pause so viewers can comfortably read the number

export default function PaddleNumberDisplay({
  lastBid,
  currentDonationLevel,
  paddleDigits = 3,
  themeName = 'boysGirlsClub',
  primaryColor,
  secondaryColor,
  onBidDisplayed,
}: PaddleNumberDisplayProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [renderedBid, setRenderedBid] = useState<Bid | null>(null);
  const [animPhase,   setAnimPhase]   = useState<AnimPhase>('idle');
  const [showShimmer, setShowShimmer] = useState(false);

  // ── Displayed donation level ──────────────────────────────────────────────
  // Updated atomically with each paddle so the level shown always matches the
  // level that was active when that specific bid was entered.
  const [displayedLevel, setDisplayedLevel] = useState<number | null>(
    currentDonationLevel ?? null
  );

  // ── Refs (never cause re-renders) ─────────────────────────────────────────
  const renderedBidRef  = useRef<Bid | null>(null);
  const queueRef        = useRef<QueuedItem[]>([]);
  const isProcessingRef = useRef(false);
  // Snapshot of the current level — read at queue-push time so each QueuedItem
  // captures the level the operator had selected when they entered that paddle.
  const currentLevelRef = useRef<number | null>(currentDonationLevel ?? null);
  currentLevelRef.current = currentDonationLevel ?? null; // update every render

  // processQueue is stored in a ref so recursive setTimeout calls always
  // see the latest closed-over values without stale captures.
  const processQueueRef = useRef<() => void>(null!);
  processQueueRef.current = () => {
    if (queueRef.current.length === 0) {
      isProcessingRef.current = false;
      return;
    }

    const { bid: next, level: nextLevel } = queueRef.current.shift()!;

    // ── Phase 1: exit ──
    setAnimPhase('exiting');

    setTimeout(() => {
      // ── Phase 2: swap paddle + level atomically, then enter ──
      renderedBidRef.current = next;
      setRenderedBid(next);
      setDisplayedLevel(nextLevel);   // level updates at the same moment as the paddle
      setAnimPhase('entering');
      setShowShimmer(true);
      setTimeout(() => setShowShimmer(false), 400);
      // Notify parent so total/progress animate in sync with the paddle
      onBidDisplayed?.(next);

      setTimeout(() => {
        // ── Phase 3: idle (display pause) ──
        setAnimPhase('idle');

        setTimeout(() => {
          // ── Next item or done ──
          processQueueRef.current();
        }, DISPLAY_MS);

      }, ENTER_MS);
    }, EXIT_MS);
  };

  // ── Enqueue incoming bids ──────────────────────────────────────────────────
  useEffect(() => {
    if (!lastBid) return;

    // Very first bid — show immediately with no animation
    if (!renderedBidRef.current) {
      renderedBidRef.current = lastBid;
      setRenderedBid(lastBid);
      // Keep the displayed total/progress in sync for the very first live bid.
      onBidDisplayed?.(lastBid);
      return;
    }

    // Deduplicate by bid ID only — same paddle NUMBER is allowed back-to-back,
    // but the exact same bid object should never be enqueued twice.
    const tail = queueRef.current[queueRef.current.length - 1];
    if (tail?.bid.id === lastBid.id) return;
    if (!tail && renderedBidRef.current.id === lastBid.id) return;

    // Capture the currently-active level alongside the bid
    queueRef.current.push({ bid: lastBid, level: currentLevelRef.current });

    if (!isProcessingRef.current) {
      isProcessingRef.current = true;
      processQueueRef.current();
    }
  }, [lastBid]);

  // ── Idle level updates ────────────────────────────────────────────────────
  // When no queue is running and the operator changes the active level, reflect
  // it on-screen right away.  While the queue IS running each bid carries its
  // own level (see QueuedItem) so this effect is effectively a no-op then.
  useEffect(() => {
    if (!isProcessingRef.current) {
      setDisplayedLevel(currentDonationLevel ?? null);
    }
  }, [currentDonationLevel]);

  // ── Reset all display state when bids are cleared ─────────────────────────
  // When lastBid becomes null (e.g., Clear All Bids or Reset), drain the queue
  // and return the display to the placeholder state.
  useEffect(() => {
    if (lastBid !== null) return;
    queueRef.current = [];
    isProcessingRef.current = false;
    renderedBidRef.current = null;
    setRenderedBid(null);
    setAnimPhase('idle');
    setShowShimmer(false);
    setDisplayedLevel(currentDonationLevel ?? null);
  }, [lastBid]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Animated level amount ─────────────────────────────────────────────────
  const { value: animatedLevelAmount } = useAnimatedValue(displayedLevel ?? 0, 1000);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(n);

  // ── Theme helpers ─────────────────────────────────────────────────────────
  const resolvedThemeName = (themeName === 'modern' || themeName === 'modernDots') ? 'NPCE' : themeName;
  const isLight  = resolvedThemeName === 'boysGirlsClub' || resolvedThemeName === 'winter';
  const isModern = resolvedThemeName === 'NPCE';
  const isCustom = themeName === 'custom';
  const useModernPaddleNumberStyle = isModern || resolvedThemeName === 'boysGirlsClub';

  const paddleColor   = isCustom && primaryColor  ? primaryColor  : isLight ? '#2596be' : '#ffffff';
  const labelColor    = isCustom ? '#ffffff' : isModern ? '#1b3664' : isLight ? '#000000' : 'rgba(255,255,255,0.95)';
  const accentColor   = isCustom && secondaryColor ? secondaryColor : isModern ? '#e24725' : isLight ? '#2596be' : '#fbbf24';
  const cornerColor   = isModern ? 'rgba(27,54,100,0.8)' : isLight ? 'rgba(0,133,202,0.8)' : 'rgba(59,130,246,0.8)';
  const glowGradient  = isCustom && secondaryColor
    ? `radial-gradient(circle, ${secondaryColor}14, transparent)`
    : isModern  ? 'radial-gradient(circle, rgba(27,54,100,0.08), transparent)'
    : isLight   ? 'radial-gradient(circle, rgba(37,150,190,0.08), transparent)'
    : 'radial-gradient(circle, rgba(59,130,246,0.1), transparent)';

  const swivelAnim = animPhase === 'exiting'
    ? `paddleCubeExit  ${EXIT_MS}ms  cubic-bezier(0.4,0,1,0.6) forwards`
    : animPhase === 'entering'
    ? `paddleCubeEnter ${ENTER_MS}ms cubic-bezier(0,0.4,0.6,1) forwards`
    : 'none';

  const placeholderDigits = Math.max(1, Math.min(8, paddleDigits));
  const paddleDisplayValue = renderedBid?.paddleNumber || 'X'.repeat(placeholderDigits);
  const isPlaceholderState = !renderedBid;

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    // Perspective parent — gives shared 3-D depth to the rotating child
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        perspective: '1400px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* ── Rotating card ── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: swivelAnim,
          willChange: 'transform, opacity',
        }}
      >
        {/* Shimmer sweep — fires briefly on every entry */}
        {showShimmer && !isPlaceholderState && (
          <div style={{ position:'absolute', inset:'-20% -10%', overflow:'hidden', pointerEvents:'none', zIndex:20 }}>
            <div style={{
              position: 'absolute', top:0, bottom:0, left:0, width:'40%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
              animation: `paddleShimmerSweep 400ms ease-out forwards`,
            }} />
          </div>
        )}

        {/* Ambient glow */}
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          width:'120%', height:'120%',
          background: glowGradient,
          filter: 'blur(100px)',
          animation: animPhase !== 'idle' ? 'glowPulse 1s ease-out' : 'glow 4s ease-in-out infinite',
          zIndex: -1,
        }} />

        {/* PADDLE label */}
        <div style={{
          fontSize: 'clamp(3rem,6vmin,6rem)',
          fontWeight: '800',
          color: labelColor,
          letterSpacing: '0.3em',
          marginBottom: '3rem',
          textTransform: 'uppercase',
          textShadow: isModern
            ? '0 0 20px rgba(27,54,100,0.15), 0 2px 4px rgba(0,0,0,0.2)'
            : isLight ? '0 2px 4px rgba(0,0,0,0.2)'
            : '0 2px 4px rgba(0,0,0,0.3)',
        }}>
          PADDLE
        </div>

        {/* Big number */}
        <div style={{
          fontSize: 'clamp(12rem,28vmin,32rem)',
          fontWeight: '900',
          color: isPlaceholderState
            ? `${useModernPaddleNumberStyle ? '#ffffff' : paddleColor}cc`
            : (useModernPaddleNumberStyle ? '#ffffff' : paddleColor),
          lineHeight: '1',
          textShadow: useModernPaddleNumberStyle
            ? '0 0 40px rgba(27,54,100,0.22), 0 0 80px rgba(27,54,100,0.12), 0 4px 20px rgba(0,0,0,0.5)'
            : isLight
            ? '0 0 30px rgba(37,150,190,0.25), 0 0 60px rgba(37,150,190,0.15), 0 4px 20px rgba(0,0,0,0.2)'
            : '0 0 40px rgba(59,130,246,0.25), 0 0 80px rgba(59,130,246,0.15), 0 4px 20px rgba(0,0,0,0.5)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: isPlaceholderState ? '0.02em' : '-0.02em',
          animation: animPhase === 'idle' ? 'floatSlow 6s ease-in-out infinite' : 'none',
        }}>
          {paddleDisplayValue}
        </div>

        {/* Donation level — uses displayedLevel so it stays in sync with the queue */}
        {displayedLevel !== null ? (
          <div style={{
            marginTop: '4rem',
            fontSize: 'clamp(5rem,12vmin,12rem)',
            fontWeight: '800',
            color: accentColor,
            textShadow: isModern
              ? '0 0 40px rgba(226,71,37,0.25), 0 0 80px rgba(226,71,37,0.15), 0 4px 15px rgba(0,0,0,0.5)'
              : isLight
              ? '0 0 30px rgba(37,150,190,0.25), 0 0 60px rgba(37,150,190,0.15), 0 4px 15px rgba(0,0,0,0.2)'
              : '0 0 40px rgba(251,191,36,0.25), 0 0 80px rgba(251,191,36,0.15), 0 4px 15px rgba(0,0,0,0.5)',
            animation: 'pulse 3s ease-in-out infinite',
          }}>
            {formatCurrency(animatedLevelAmount)}
          </div>
        ) : (
          <div style={{
            marginTop: '4rem',
            fontSize: 'clamp(2rem,4vmin,3.5rem)',
            fontWeight: '700',
            color: `${labelColor}99`,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Set Active Level
          </div>
        )}

        {/* Decorative sliding lines */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'150%', height:'150%', pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'10%', left:0, right:0, height:'2px', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', animation:'slideRight 3s linear infinite' }} />
          <div style={{ position:'absolute', bottom:'10%', left:0, right:0, height:'2px', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', animation:'slideLeft 3s linear infinite' }} />
        </div>

        {/* Corner accents */}
        <div style={{
          position:'absolute', top:'clamp(-3rem,-15vh,-9rem)', left:'clamp(-30px,-3vw,-10px)',
          width:'clamp(50px,6vmin,100px)', height:'clamp(50px,6vmin,100px)',
          borderTop:`3px solid ${cornerColor}`, borderLeft:`3px solid ${cornerColor}`,
          borderRight:'none', borderBottom:'none',
          opacity: animPhase !== 'idle' ? 1 : 0.6,
          transition:'opacity 0.4s ease',
          zIndex:5, pointerEvents:'none',
        }} />
        <div style={{
          position:'absolute', bottom:'clamp(-3rem,-15vh,-9rem)', right:'clamp(-30px,-3vw,-10px)',
          width:'clamp(50px,6vmin,100px)', height:'clamp(50px,6vmin,100px)',
          borderBottom:`3px solid ${cornerColor}`, borderRight:`3px solid ${cornerColor}`,
          borderLeft:'none', borderTop:'none',
          opacity: animPhase !== 'idle' ? 1 : 0.6,
          transition:'opacity 0.4s ease',
          zIndex:5, pointerEvents:'none',
        }} />
      </div>
    </div>
  );
}

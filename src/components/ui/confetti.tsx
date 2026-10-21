const PIECE_COUNT = 60;
const COLORS = ["#ff2b1c", "#ffe14a", "#8ff0c0", "#ffa3c4", "#8fd3ff", "#0b0b0b"];

/**
 * Falling confetti for a successful order. Pure CSS animation.
 * The positions come from simple maths on the piece number (no Math.random),
 * so the result is the same every time.
 */
export function Confetti() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: PIECE_COUNT }, (_, index) => (
        <span
          key={index}
          className="confetti-piece"
          style={{
            left: `${(index * 37) % 100}%`,
            backgroundColor: COLORS[index % COLORS.length],
            animationDelay: `${(index % 10) * 0.15}s`,
            animationDuration: `${3 + (index % 5) * 0.6}s`,
          }}
        />
      ))}
    </div>
  );
}

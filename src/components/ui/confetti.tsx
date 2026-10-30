const PIECE_COUNT = 60;
const COLORS = ["#0e6b3c", "#f5b82e", "#10244a", "#d3ecda", "#d3e2fb", "#f7e6bb"];

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

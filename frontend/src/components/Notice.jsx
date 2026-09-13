export default function Notice({ tone = "error", children }) {
  if (!children) return null;

  const styles = {
    error: "border-blush/50 bg-blush/10 text-blush-dark",
    success: "border-sage/50 bg-sage/10 text-sage-dark",
    info: "border-gold/40 bg-gold/10 text-charcoal-800",
  };

  return (
    <div className={`rounded-sm border px-4 py-3 text-sm ${styles[tone]}`}>
      {children}
    </div>
  );
}

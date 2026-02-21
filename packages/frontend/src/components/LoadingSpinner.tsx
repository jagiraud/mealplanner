export default function LoadingSpinner() {
  return (
    <div role="status" className="flex justify-center items-center py-20">
      <div className="w-6 h-6 border-2 border-stone-200 border-t-pine-500 rounded-full animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

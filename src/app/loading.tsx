export default function Loading() {
  return (
    <div className="px-4 pt-32 md:px-8">
      <div className="skeleton h-[50vh] rounded-3xl" />
      <div className="mt-8 flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-64 w-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

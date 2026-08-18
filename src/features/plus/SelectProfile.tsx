"use client";

export function SelectProfile({
  id,
  name,
  kids,
  rating,
}: {
  id: string;
  name: string;
  kids: boolean;
  rating: string;
}) {
  return (
    <button
      type="button"
      className="w-28"
      onClick={async () => {
        await fetch("/api/prefs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: id, kids }),
        });
        window.location.href = kids ? "/filmes" : "/cinemax-plus";
      }}
    >
      <div className={`grid h-28 w-28 place-items-center rounded-2xl text-3xl ${kids ? "bg-sky-700" : "bg-cx-red"}`}>
        {name.slice(0, 1)}
      </div>
      <p className="mt-2 text-sm">{name}</p>
      {kids ? <p className="text-xs text-cx-gold">Kids · {rating}</p> : null}
    </button>
  );
}

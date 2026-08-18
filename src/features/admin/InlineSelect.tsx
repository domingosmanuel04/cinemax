"use client";

export function InlineSelect({
  action,
  id,
  name,
  value,
  options,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  name: string;
  value: string;
  options: string[];
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <select
        name={name}
        defaultValue={value}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg bg-white/10 px-2 py-1 text-xs"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </form>
  );
}

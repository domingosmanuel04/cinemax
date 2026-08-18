"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="mt-8 rounded-full bg-cx-red px-5 py-2 text-white print:hidden">
      Imprimir / Guardar PDF
    </button>
  );
}

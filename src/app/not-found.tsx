import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 pt-28 text-center">
      <div>
        <p className="font-display text-6xl text-cx-red">404</p>
        <h1 className="mt-4 text-2xl">Este filme saiu de cartaz.</h1>
        <Link href="/" className="mt-6 inline-block rounded-full bg-cx-red px-5 py-3">
          Voltar ao CINEMAX
        </Link>
      </div>
    </div>
  );
}

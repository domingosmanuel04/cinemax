import FilmesPage from "../filmes/page";

export default async function Page(props: { searchParams: Promise<{ status?: string; genero?: string; formato?: string }> }) {
  return FilmesPage({ searchParams: Promise.resolve({ ...(await props.searchParams), status: "NOW_SHOWING" }) });
}

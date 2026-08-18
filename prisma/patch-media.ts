import { PrismaClient } from "@prisma/client";
import { CINEMA_MEDIA, DEMO_STREAM, HERO_VIDEO, MOVIE_MEDIA, PRODUCT_MEDIA, SERIES_MEDIA, AMBIENCE } from "../src/shared/lib/media";

const prisma = new PrismaClient();

async function main() {
  for (const [slug, media] of Object.entries(MOVIE_MEDIA)) {
    await prisma.movie.updateMany({
      where: { slug },
      data: { posterUrl: media.poster, backdropUrl: media.backdrop, videoUrl: DEMO_STREAM, trailerUrl: HERO_VIDEO },
    });
  }
  for (const [slug, media] of Object.entries(SERIES_MEDIA)) {
    await prisma.series.updateMany({
      where: { slug },
      data: { posterUrl: media.poster, backdropUrl: media.backdrop, trailerUrl: HERO_VIDEO },
    });
  }
  for (const [slug, imageUrl] of Object.entries(CINEMA_MEDIA)) {
    await prisma.cinema.updateMany({ where: { slug }, data: { imageUrl } });
    await prisma.room.updateMany({ where: { cinema: { slug } }, data: { imageUrl } });
  }
  for (const [slug, imageUrl] of Object.entries(PRODUCT_MEDIA)) {
    await prisma.product.updateMany({ where: { slug }, data: { imageUrl } });
  }
  await prisma.movie.updateMany({
    where: { heroEnabled: true },
    data: { trailerUrl: HERO_VIDEO },
  });
  await prisma.setting.upsert({
    where: { key: "heroVideoUrl" },
    update: { value: HERO_VIDEO },
    create: { key: "heroVideoUrl", value: HERO_VIDEO },
  });
  await prisma.banner.updateMany({
    data: { imageUrl: CINEMA_MEDIA["luanda-fortaleza"] },
  });
  const promoImages = [AMBIENCE.lobby, AMBIENCE.seats, AMBIENCE.popcorn, AMBIENCE.projector, CINEMA_MEDIA["belas-shopping"]];
  const promos = await prisma.promotion.findMany();
  for (let i = 0; i < promos.length; i++) {
    await prisma.promotion.update({ where: { id: promos[i].id }, data: { imageUrl: promoImages[i % promoImages.length] } });
  }
  const portraits = [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  ];
  const people = await prisma.person.findMany();
  for (let i = 0; i < people.length; i++) {
    await prisma.person.update({ where: { id: people[i].id }, data: { photoUrl: portraits[i % portraits.length] } });
  }
  await prisma.newsArticle.updateMany({ data: { imageUrl: AMBIENCE.lobby } });
  console.log("Media patched.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

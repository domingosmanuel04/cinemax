/** Cinematic photography (Unsplash) — original catalog, not commercial posters. */
const u = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const HERO_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";

export const DEMO_STREAM =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const MOVIE_MEDIA: Record<string, { poster: string; backdrop: string }> = {
  "eclipse-final": {
    poster: u("photo-1462331940025-496dfbfc7564", 800),
    backdrop: u("photo-1446776811953-b23d57bd21aa", 1920),
  },
  "cidade-de-neon": {
    poster: u("photo-1514565131-fce0801d3f73", 800),
    backdrop: u("photo-1545486332-7ea292c00065", 1920),
  },
  "o-ultimo-portal": {
    poster: u("photo-1506905925346-21bda4d32df4", 800),
    backdrop: u("photo-1470071459604-3b5ec3a7fe05", 1920),
  },
  "horizonte-vermelho": {
    poster: u("photo-1509316785289-025f5b846b35", 800),
    backdrop: u("photo-1469854523086-cc02fe5d8800", 1920),
  },
  "alem-das-estrelas": {
    poster: u("photo-1419242902214-272b3f66ee7a", 800),
    backdrop: u("photo-1464802686167-b939a6910659", 1920),
  },
  "a-casa-sombria": {
    poster: u("photo-1509248961158-e54f6934749c", 800),
    backdrop: u("photo-1518709268805-4e9042af9f23", 1920),
  },
  "operacao-midnight": {
    poster: u("photo-1485846234645-a62644f54763", 800),
    backdrop: u("photo-1478720568477-1520f75b2d34", 1920),
  },
  "reino-perdido": {
    poster: u("photo-1441974231531-c6227db76b6e", 800),
    backdrop: u("photo-1448375240586-882707db888b", 1920),
  },
  "ritmo-de-luanda": {
    poster: u("photo-1493225457124-a3eb161ffa5f", 800),
    backdrop: u("photo-1514525253161-7a46d19cd819", 1920),
  },
  "sombras-do-atlantico": {
    poster: u("photo-1507525428034-b723cf961d3e", 800),
    backdrop: u("photo-1439405326854-014607f694d7", 1920),
  },
  "a-ultima-sessao": {
    poster: u("photo-1489599849927-2ee91cede3ba", 800),
    backdrop: u("photo-1517604931442-7e0c8ed2963c", 1920),
  },
  "velocidade-infinita": {
    poster: u("photo-1542362567-b07e54382f73", 800),
    backdrop: u("photo-1492144534655-ae79c964c9d7", 1920),
  },
  "jardim-das-memorias": {
    poster: u("photo-1462275646964-a0e3386b89fa", 800),
    backdrop: u("photo-1465146633011-14f8e0781093", 1920),
  },
  "protocolo-orion": {
    poster: u("photo-1451187580459-43490279c0fa", 800),
    backdrop: u("photo-1444703686981-a3abbc4d4fe3", 1920),
  },
  "o-guardiao-do-farol": {
    poster: u("photo-1505765050516-f72dcac9c60e", 800),
    backdrop: u("photo-1507525428034-b723cf961d3e", 1920),
  },
  "furia-silenciosa": {
    poster: u("photo-1552611052-33e04de53492", 800),
    backdrop: u("photo-1519681393784-d120267933ba", 1920),
  },
  "estacao-polar": {
    poster: u("photo-1478827536114-da961b7f86d2", 800),
    backdrop: u("photo-1483921020237-2ff51e8f4a71", 1920),
  },
  "cancao-para-um-cometa": {
    poster: u("photo-1462331940025-496dfbfc7564", 800),
    backdrop: u("photo-1484589065579-248aad0d8b1f", 1920),
  },
  "o-pacto-de-vidro": {
    poster: u("photo-1486406146926-c627a92ad1ab", 800),
    backdrop: u("photo-1497366216548-37526070297c", 1920),
  },
  "noite-em-marte": {
    poster: u("photo-1614726365723-498aa67caf7d", 800),
    backdrop: u("photo-1451186859696-371d9477be93", 1920),
  },
  "os-herdeiros-do-tempo": {
    poster: u("photo-1501139083538-0139583c060f", 800),
    backdrop: u("photo-1461360370896-922624d12aa1", 1920),
  },
  "baia-das-baleias": {
    poster: u("photo-1568430462989-44163eb1752f", 800),
    backdrop: u("photo-1559827260-dc66d52bef19", 1920),
  },
  "coracao-de-aco": {
    poster: u("photo-1451186859696-371d9477be93", 800),
    backdrop: u("photo-1517976487492-5750f319609d", 1920),
  },
  "a-danca-das-chamas": {
    poster: u("photo-1508700115892-45ecd05ae2ad", 800),
    backdrop: u("photo-1518834107812-67b0b7c58434", 1920),
  },
};

export const SERIES_MEDIA: Record<string, { poster: string; backdrop: string }> = {
  "arquivo-7": {
    poster: u("photo-1550751827-4bd374c3f58b", 800),
    backdrop: u("photo-1518770660439-4636190af475", 1920),
  },
  "ilha-do-eco": {
    poster: u("photo-1559827260-dc66d52bef19", 800),
    backdrop: u("photo-1507525428034-b723cf961d3e", 1920),
  },
  "club-cinzel": {
    poster: u("photo-1489599849927-2ee91cede3ba", 800),
    backdrop: u("photo-1440404653325-ab127d49abc1", 1920),
  },
  satelites: {
    poster: u("photo-1446776877081-d282a0f896e2", 800),
    backdrop: u("photo-1444703686981-a3abbc4d4fe3", 1920),
  },
  "pequenos-lumens": {
    poster: u("photo-1485093243386-da00af45bf36", 800),
    backdrop: u("photo-1478720568477-1520f75b2d34", 1920),
  },
  "noite-aberta": {
    poster: u("photo-1492684223060-9030e35d524b", 800),
    backdrop: u("photo-1514525253161-7a46d19cd819", 1920),
  },
};

export const CINEMA_MEDIA: Record<string, string> = {
  "luanda-fortaleza": u("photo-1489599849927-2ee91cede3ba", 1600),
  "belas-shopping": u("photo-1440404653325-ab127d49abc1", 1600),
  talatona: u("photo-1517604931442-7e0c8ed2963c", 1600),
  "benguela-costa": u("photo-1595769816263-9b910be24d5f", 1600),
  "lubango-serra": u("photo-1524985069026-dd778a71c7b4", 1600),
};

export const PRODUCT_MEDIA: Record<string, string> = {
  "pipoca-pequena": u("photo-1578844251758-2f71da64c96f", 800),
  "pipoca-media": u("photo-1585647347384-2593bc35786b", 800),
  "pipoca-grande": u("photo-1534423861381-1a0b51d9dd27", 800),
  "pipoca-caramelizada": u("photo-1505686994434-e3cc5abf1330", 800),
  "coca-cola": u("photo-1629203851127-4d402c1a0d0e", 800),
  pepsi: u("photo-1629203851288-7ececa5f6d3a", 800),
  agua: u("photo-1548839140-29a749e1cf4d", 800),
  sumo: u("photo-1600278097401-03d242ee04b0", 800),
  "combo-individual": u("photo-1534423861381-1a0b51d9dd27", 800),
  "combo-casal": u("photo-1585647347384-2593bc35786b", 800),
  "combo-familia": u("photo-1489599849927-2ee91cede3ba", 800),
  "combo-premium": u("photo-1517604931442-7e0c8ed2963c", 800),
  "oculos-3d": u("photo-1485846234645-a62644f54763", 800),
  chocolate: u("photo-1548907040-4baa42d10919", 800),
  snacks: u("photo-1621939514649-280e2ee25f60", 800),
  "tshirt-eclipse": u("photo-1521572163474-6864f9cf17ab", 800),
};

export const AMBIENCE = {
  lobby: u("photo-1517604931442-7e0c8ed2963c", 1920),
  seats: u("photo-1489599849927-2ee91cede3ba", 1920),
  popcorn: u("photo-1578844251758-2f71da64c96f", 1200),
  projector: u("photo-1478720568477-1520f75b2d34", 1600),
};

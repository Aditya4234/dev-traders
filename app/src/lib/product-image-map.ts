const PRODUCT_IMAGES = [
  "ANGLER.png",
  "bhavna.png",
  "CARE.png",
  "damini.png",
  "dulhan.png",
  "FITME.png",
  "F.O.png",
  "hero1.png",
  "hero.png",
  "home-page.png",
  "icon.png",
  "ICON.png",
  "image1.png",
  "image2.png",
  "image3.png",
  "image4.png",
  "image5.png",
  "image6.png",
  "image.png",
  "JULIYANA.png",
  "JULIYAT1.png",
  "JULIYAT.png",
  "KAREENA.png",
  "logo.png",
  "monika.png",
  "NEETU.png",
  "NICE1.png",
  "NICE.png",
  "payal.png",
  "perry.png",
  "pizza.png",
  "PULSE1.png",
  "PULSE.png",
  "PUSHPA.png",
  "riya touch.png",
  "roohi.png",
  "ROOHI.png",
  "sofy.png",
  "sonam.png",
  "zoom.png",
] as const;

const EXACT_MAP: Record<string, string> = {
  "roohi foam": "/products/ROOHI.png",
  roohi: "/products/roohi.png",
  "anita gold": "/products/ANGLER.png",
  angler: "/products/ANGLER.png",
  "mans gold": "/products/KAREENA.png",
  "mansi gold": "/products/KAREENA.png",
  "saloni set": "/products/sofy.png",
  "kajal panty": "/products/JULIYAT.png",
  kajal: "/products/JULIYAT.png",
  damini: "/products/damini.png",
  monika: "/products/monika.png",
  payal: "/products/payal.png",
  bhavna: "/products/bhavna.png",
  "bhavna lace bra": "/products/bhavna.png",
  sonam: "/products/sonam.png",
  "sonam daily bra": "/products/sonam.png",
  perry: "/products/perry.png",
  "perry comfort bra": "/products/perry.png",
  zoom: "/products/zoom.png",
  "zoom active bra": "/products/zoom.png",
  care: "/products/CARE.png",
  fitme: "/products/FITME.png",
  neetu: "/products/NEETU.png",
  juliyana: "/products/JULIYANA.png",
  juliyat: "/products/JULIYAT.png",
  pulse: "/products/PULSE.png",
  pushpa: "/products/PUSHPA.png",
  nice: "/products/NICE.png",
  "riya touch nice panty": "/products/NICE.png",
  dulhan: "/products/dulhan.png",
  "dulhan foam set": "/products/dulhan.png",
  icon: "/products/ICON.png",
  pizza: "/products/pizza.png",
  "pizza printed panty": "/products/pizza.png",
  "f.o. fashion bra": "/products/F.O.png",
  "roohi non-padded bra": "/products/roohi.png",
  "f.o": "/products/F.O.png",
  "fo bra": "/products/F.O.png",
  kareena: "/products/KAREENA.png",
  "kareena mould bra": "/products/KAREENA.png",
  "fitme c-cup bra": "/products/FITME.png",
  "neetu c-cup bra": "/products/NEETU.png",
  "juliyana bra": "/products/JULIYANA.png",
  "juliyat panty": "/products/JULIYAT.png",
  "pulse panty": "/products/PULSE.png",
  "pushpa seamless panty": "/products/PUSHPA.png",
  "icon bra": "/products/ICON.png",
  "riya touch": "/products/riya touch.png",
  "home page": "/products/home-page.png",
};

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function getProductImagePath(productName: string): string | null {
  if (!productName) return null;

  const normalized = normalizeName(productName);
  if (EXACT_MAP[normalized]) return EXACT_MAP[normalized];

  for (const [key, path] of Object.entries(EXACT_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return path;
    }
  }

  for (const file of PRODUCT_IMAGES) {
    const stem = file.replace(/\.[^.]+$/, "").toLowerCase();
    if (normalized.includes(stem) || stem.includes(normalized.replace(/\s+/g, ""))) {
      return `/products/${file}`;
    }
  }

  const words = normalized.split(" ").filter(Boolean);
  for (const word of words) {
    if (word.length < 3) continue;
    for (const file of PRODUCT_IMAGES) {
      const stem = file.replace(/\.[^.]+$/, "").toLowerCase();
      if (stem.includes(word) || word.includes(stem)) {
        return `/products/${file}`;
      }
    }
  }

  return null;
}

export function getAllProductImagePaths(): string[] {
  return PRODUCT_IMAGES.map((file) => `/products/${file}`);
}

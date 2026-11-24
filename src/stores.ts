export interface Store {
  id: string;
  name: string;
  confirmed: boolean;
  buildUrl: (query: string) => string;
}

const clean = (q: string) => q.trim().replace(/\s+/g, " ");
const enc = (q: string) => encodeURIComponent(clean(q));
const plus = (q: string) => enc(q).replace(/%20/g, "+");
const slug = (q: string) =>
  encodeURIComponent(clean(q).toLowerCase().replace(/ /g, "-"));

export const STORES: Store[] = [
  {
    id: "kabum",
    name: "KaBuM!",
    confirmed: true,
    buildUrl: (q) => `https://www.kabum.com.br/busca/${slug(q)}`,
  },
  {
    id: "terabyte",
    name: "TerabyteShop",
    confirmed: true,
    buildUrl: (q) => `https://www.terabyteshop.com.br/busca?str=${plus(q)}`,
  },
  {
    id: "magalu",
    name: "Magazine Luiza",
    confirmed: true,
    buildUrl: (q) => `https://www.magazineluiza.com.br/busca/${plus(q)}/`,
  },
  {
    id: "pichau",
    name: "Pichau",
    confirmed: false,
    buildUrl: (q) => `https://www.pichau.com.br/search?q=${enc(q)}`,
  },
  {
    id: "amazon",
    name: "Amazon Brasil",
    confirmed: false,
    buildUrl: (q) => `https://www.amazon.com.br/s?k=${plus(q)}`,
  },
  {
    id: "mercadolivre",
    name: "Mercado Livre",
    confirmed: false,
    buildUrl: (q) => `https://lista.mercadolivre.com.br/${slug(q)}`,
  },
  {
    id: "casasbahia",
    name: "Casas Bahia",
    confirmed: false,
    buildUrl: (q) => `https://www.casasbahia.com.br/${slug(q)}/b`,
  },
  {
    id: "shopee",
    name: "Shopee",
    confirmed: false,
    buildUrl: (q) => `https://shopee.com.br/search?keyword=${enc(q)}`,
  },
  {
    id: "aliexpress",
    name: "AliExpress",
    confirmed: false,
    buildUrl: (q) =>
      `https://pt.aliexpress.com/wholesale?SearchText=${plus(q)}`,
  },
];

import { useState, useEffect, FormEvent, useMemo, useRef } from "react";
import {
  Anchor, MapPin, ChevronDown, Send, Menu, X, ArrowRight, Waves,
} from "lucide-react";
import Fuse from "fuse.js";
import { supabase, supabaseConfigured, type Sighting } from "./lib/supabase";

// ─── DATA ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { id: "discover", label: "Discover" },
  { id: "stay", label: "Stay" },
  { id: "eat", label: "Eat" },
  { id: "routes", label: "Routes" },
  { id: "wildlife", label: "Wildlife" },
  { id: "history", label: "History" },
  { id: "gander", label: "Gander" },
  { id: "events", label: "Events" },
  { id: "map", label: "Map" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const ACCOMMODATIONS = [
  {
    name: "Fogo Island Inn",
    location: "Fogo Island",
    type: "Boutique Inn",
    description: "A world-renowned architectural masterpiece perched on the ancient rock of Fogo Island. Handcrafted interiors celebrate the outport community that built it. Icebergs drift past floor-to-ceiling windows.",
    highlight: "World's Top Destination",
    image: "https://images.unsplash.com/photo-1672858034618-d0ef20167244?w=800&h=500&fit=crop&auto=format",
    alt: "Colorful houses lining the waterfront of a fishing harbour",
  },
  {
    name: "Murray Premises Hotel",
    location: "St. John's",
    type: "Heritage Boutique",
    description: "A lovingly restored 19th-century waterfront warehouse in the heart of St. John's Harbour. Stone walls, exposed timber beams, and harbour views preserve centuries of merchant history.",
    highlight: "Historic Waterfront",
    image: "https://images.unsplash.com/photo-1560279764-b5fdbcacd7ab?w=800&h=500&fit=crop&auto=format",
    alt: "Aerial view of rugged seashore from above",
  },
  {
    name: "Marble Mountain Lodge",
    location: "Corner Brook",
    type: "Mountain Resort",
    description: "Gateway to Newfoundland's finest alpine terrain and the Humber Valley wilderness. Year-round adventure anchored by river, trail, and the Long Range Mountains.",
    highlight: "Alpine & River",
    image: "https://images.unsplash.com/photo-1567733872248-2532a2e16f77?w=800&h=500&fit=crop&auto=format",
    alt: "Mountain ranges beside a still body of water",
  },
  {
    name: "Twillingate Inn & Suites",
    location: "Twillingate",
    type: "Coastal Inn",
    description: "Prime position in the Iceberg Capital of the World. Watch towering bergs drift past from your balcony. Board whale-watching vessels steps from the dock.",
    highlight: "Iceberg Capital",
    image: "https://images.unsplash.com/photo-1690125426341-9ed6a4e7460b?w=800&h=500&fit=crop&auto=format",
    alt: "Large iceberg floating near a rocky Atlantic shore",
  },
  {
    name: "Hotel Gander",
    location: "Gander",
    type: "Heritage Hotel",
    description: "Steeped in aviation history and the community spirit that opened its doors to 7,000 strangers in September 2001. Gateway to the heart of the island.",
    highlight: "Come From Away Heritage",
    image: "https://images.unsplash.com/photo-1560278998-e046cffdef59?w=800&h=500&fit=crop&auto=format",
    alt: "Moody ocean photography at dusk",
  },
  {
    name: "Gros Morne Wilderness Cabins",
    location: "Rocky Harbour",
    type: "Wilderness Retreat",
    description: "Sleep under the UNESCO World Heritage skies of Gros Morne. Ancient Tablelands geology, Western Brook Pond fjords, and the Long Range Traverse are at your door.",
    highlight: "UNESCO Heritage Park",
    image: "https://images.unsplash.com/photo-1633344696307-d230135c51e5?w=800&h=500&fit=crop&auto=format",
    alt: "A vast body of water beside ancient mountains",
  },
];

const RESTAURANTS = [
  {
    name: "The Merchant Tavern",
    location: "St. John's",
    cuisine: "Contemporary Canadian",
    description: "Chef Jeremy Charles's landmark in a restored 19th-century merchant building. Wild game, foraged greens, and salt-cured Atlantic seafood presented with quiet precision.",
    signature: "Salt Cod Brandade",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=500&fit=crop&auto=format",
  },
  {
    name: "Bacalao",
    location: "St. John's",
    cuisine: "Traditional Newfoundland",
    description: "The first restaurant devoted entirely to contemporary Newfoundland cuisine. Jiggs' dinner, fish 'n' brewis, and figgy duff elevated with real craft.",
    signature: "Jiggs' Dinner Reimagined",
    image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=500&fit=crop&auto=format",
  },
  {
    name: "Chinched Bistro",
    location: "St. John's",
    cuisine: "Charcuterie & Local",
    description: "A beloved Water Street institution championing house-cured meats, local cheeses, and small plates that honour the province's larder with European precision.",
    signature: "Moose Mortadella",
    image: "https://images.unsplash.com/photo-1529692236671-f1c4b4ddf08a?w=800&h=500&fit=crop&auto=format",
  },
  {
    name: "Bonavista Social Club",
    location: "Bonavista",
    cuisine: "Coastal Bistro",
    description: "Set in a restored heritage property overlooking the harbour where John Cabot made landfall in 1497. Fresh catches, wood-fired bread, and a warmth that invites lingering.",
    signature: "Cod Cheeks & Scrunchions",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop&auto=format",
  },
  {
    name: "The Reluctant Chef",
    location: "Corner Brook",
    cuisine: "Farm-to-Table",
    description: "The west coast's finest table, sourcing directly from regional producers and foragers. An ever-changing menu guided by Newfoundland's brief, generous seasons.",
    signature: "Partridgeberry Duck",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop&auto=format",
  },
  {
    name: "Lighthouse Picnics",
    location: "Elliston",
    cuisine: "Artisan Picnic",
    description: "Unique cliffside picnic experiences overlooking the world's largest accessible puffin colony. Wicker baskets packed with local charcuterie, cheese, and toutons.",
    signature: "Puffin-View Basket",
    image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800&h=500&fit=crop&auto=format",
  },
];

const ROUTES = [
  {
    name: "The Viking Trail",
    code: "Route 430",
    distance: "430 km",
    duration: "2–3 days",
    description: "Follow the Great Northern Peninsula from Deer Lake to L'Anse aux Meadows — the only confirmed Norse settlement in the Americas. Pass Gros Morne's ancient tablelands, sea stacks, and UNESCO fjords along the way.",
    highlights: ["Gros Morne National Park", "Port au Choix", "St. Anthony", "L'Anse aux Meadows UNESCO Site"],
    image: "https://images.unsplash.com/photo-1567733872248-2532a2e16f77?w=800&h=500&fit=crop&auto=format",
    alt: "Mountain ranges meeting the sea along the Viking Trail",
  },
  {
    name: "The Discovery Trail",
    code: "Route 230",
    distance: "320 km",
    duration: "1–2 days",
    description: "Traverse the Bonavista Peninsula through centuries of cod-fishing heritage. Visit the reconstructed Ryan Premises Plantation, Cape Bonavista Lighthouse, and Elliston's famous puffin colony.",
    highlights: ["Trinity Historic Village", "Cape Bonavista Lighthouse", "Elliston Root Cellars", "Ryan Premises National Historic Site"],
    image: "https://images.unsplash.com/photo-1486944936280-f152c82ac151?w=800&h=500&fit=crop&auto=format",
    alt: "White lighthouse on a rocky coastal cliff",
  },
  {
    name: "The Irish Loop",
    code: "Route 10",
    distance: "310 km",
    duration: "1 day",
    description: "Circle the Southern Avalon Peninsula through deeply Irish-rooted outport communities, cliffside archaeology, and the spectacular seabird sanctuary at Cape St. Mary's.",
    highlights: ["Witless Bay Ecological Reserve", "Ferryland Colony", "Cape St. Mary's", "Salmonier Nature Park"],
    image: "https://images.unsplash.com/photo-1560279764-b5fdbcacd7ab?w=800&h=500&fit=crop&auto=format",
    alt: "Aerial view of the rugged coastline along the Irish Loop",
  },
  {
    name: "The Kittiwake Coast",
    code: "Route 330",
    distance: "280 km",
    duration: "1–2 days",
    description: "Wind along Bonavista and Notre Dame Bays through island-studded iceberg alley. Fogo Island, Change Islands, and Twillingate are each accessible by short ferry crossings.",
    highlights: ["Gander Aviation Museum", "Twillingate Islands", "Fogo Island Ferry", "Change Islands"],
    image: "https://images.unsplash.com/photo-1688092079271-102357bc04af?w=800&h=500&fit=crop&auto=format",
    alt: "A towering iceberg drifting through the open ocean",
  },
];

const WILDLIFE_DATA = [
  {
    species: "Humpback Whale",
    icon: "🐋",
    season: [false,false,false,false,true,true,true,true,true,false,false,false],
    hotspots: ["Trinity Bay","Witless Bay","St. Anthony"],
    description: "Up to 20,000 humpbacks migrate to NL waters to feed on capelin. Watch bubble-net feeding from shore at Cape St. Mary's or board a zodiac out of Bay Bulls.",
  },
  {
    species: "Atlantic Puffin",
    icon: "🐦",
    season: [false,false,false,false,true,true,true,true,false,false,false,false],
    hotspots: ["Witless Bay Ecological Reserve","Elliston","Cape St. Mary's"],
    description: "Over 260,000 Atlantic Puffins nest at Witless Bay — the largest colony in North America. Boat tours depart from Bay Bulls, May to August.",
  },
  {
    species: "Iceberg",
    icon: "🧊",
    season: [false,false,true,true,true,true,false,false,false,false,false,false],
    hotspots: ["Twillingate","Bonavista Peninsula","St. Anthony","Iceberg Alley"],
    description: "Ancient Greenland glacial ice drifts south along 'Iceberg Alley'. Peak season is April–June. Twillingate is the self-proclaimed Iceberg Capital of the World.",
  },
  {
    species: "Caribou",
    icon: "🦌",
    season: [true,true,true,true,true,true,true,true,true,true,true,true],
    hotspots: ["Terra Nova NP","Northern Peninsula","Labrador Plateau"],
    description: "Newfoundland has one of the world's largest island-dwelling caribou herds. Autumn migration between plateau and coast is the most dramatic viewing opportunity.",
  },
  {
    species: "Capelin Roll",
    icon: "🐟",
    season: [false,false,false,false,false,true,true,false,false,false,false,false],
    hotspots: ["Middle Cove Beach","Tors Cove","La Manche Beach"],
    description: "Millions of capelin roll onto beaches at night to spawn in June and July. Locals gather the small fish by hand in a tradition called 'rolling' — centuries old and still magical.",
  },
  {
    species: "Bald Eagle",
    icon: "🦅",
    season: [true,true,true,false,false,false,false,false,false,true,true,true],
    hotspots: ["Humber River","Squires Memorial Park","Labrador Coast"],
    description: "Newfoundland's rivers and coasts host large bald eagle populations. Winter gatherings along open rivers offer spectacular viewing opportunities.",
  },
];

const HISTORY_EVENTS = [
  {
    year: "~9000 BCE",
    era: "First Peoples",
    title: "The First Nations",
    body: "Paleo-Indigenous peoples arrive in Newfoundland following the retreating glaciers. Distinct cultures emerge over millennia: the Maritime Archaic, Dorset Paleo-Eskimo, and the Beothuk — the island's last Indigenous people, whose language and culture were extinguished by 1829. In Labrador, the Innu and Inuit maintained vibrant cultures that endure today. The Mi'kmaq have fished and hunted the southwest coast for over a thousand years.",
  },
  {
    year: "c. 1000 CE",
    era: "Norse Arrival",
    title: "Leif Eriksson & Vinland",
    body: "Leif Eriksson leads an expedition from Greenland and establishes Vinland — a settlement at what is now L'Anse aux Meadows on the Great Northern Peninsula. It is the first confirmed European presence in the Americas, predating Columbus by nearly five centuries. Norse sagas describe encounters with 'Skraelings' — the Indigenous peoples of the coast. The site is today a UNESCO World Heritage Site.",
  },
  {
    year: "1497",
    era: "European Contact",
    title: "John Cabot Makes Landfall",
    body: "Giovanni Caboto (John Cabot), sailing under the English flag, makes landfall and claims the territory for King Henry VII. He reports seas so teeming with codfish that baskets lowered from the ship return full. This discovery of the Grand Banks — one of the world's richest fisheries — would draw European powers to these waters for four centuries, fundamentally shaping the Atlantic economy.",
  },
  {
    year: "1583",
    era: "English Claim",
    title: "England's First Overseas Territory",
    body: "Sir Humphrey Gilbert formally claims Newfoundland for England at St. John's Harbour, making it England's first overseas territory. The harbour had already been used seasonally by Portuguese, Spanish, French, and English fishing fleets for decades — making St. John's effectively one of North America's oldest continuously visited ports.",
  },
  {
    year: "1610–1713",
    era: "Colonial Rivalry",
    title: "France and England Contest the Island",
    body: "Competing colonial powers contest control for a century. France holds Plaisance (Placentia) and the western shore, forming alliances with the Mi'kmaq. The Treaty of Utrecht (1713) ends French sovereignty over the island, though France retains fishing rights on the 'French Shore' until 1904. Raids and counter-raids repeatedly devastate both English and French settlements.",
  },
  {
    year: "1832–1855",
    era: "Self-Government",
    title: "Road to Responsible Government",
    body: "Representative government is granted in 1832. After years of political agitation — with Catholic and Protestant communities finding common cause in self-determination — Newfoundland achieves responsible government in 1855. It becomes one of the most politically autonomous territories in the British Empire, achieving Dominion status in 1907.",
  },
  {
    year: "1916",
    era: "First World War",
    title: "Beaumont-Hamel",
    body: "On July 1, 1916, the 1st Newfoundland Regiment attacks German lines at Beaumont-Hamel. Within 30 minutes, 80% of the regiment is killed or wounded — 733 casualties from a unit of 780. It remains the darkest day in Newfoundland history. July 1st is observed as Memorial Day in Newfoundland, not Canada Day.",
  },
  {
    year: "1934",
    era: "Commission of Government",
    title: "Democracy Suspended",
    body: "Bankrupt from Depression debts and First World War obligations, Newfoundland suspends its elected government and accepts a British-appointed Commission. It is the only self-governing Dominion in British history to voluntarily relinquish democratic independence — a source of profound national trauma still debated today.",
  },
  {
    year: "1948–1949",
    era: "Confederation",
    title: "Canada's Tenth Province",
    body: "Two referendums are held on Newfoundland's future. In the second vote, 52.3% choose Confederation with Canada — one of the closest political decisions in Commonwealth history. On March 31, 1949, Newfoundland becomes Canada's 10th province, led by Joey Smallwood, who governs for 23 years. The decision remains contested; many Newfoundlanders still debate whether it was right.",
  },
  {
    year: "2001",
    era: "Modern Era",
    title: "Newfoundland and Labrador",
    body: "The province is officially renamed 'Newfoundland and Labrador', recognizing the vast continental territory that has been part of the province since 1949. Labrador — larger than many European countries — contributes enormous mineral wealth, the Churchill Falls hydroelectric project, and the living cultures of the Innu and Inuit peoples to the province's identity.",
  },
];

const EVENTS_DATA = [
  {
    name: "Royal St. John's Regatta",
    month: "August",
    location: "Quidi Vidi Lake, St. John's",
    type: "Rowing",
    description: "North America's oldest continuous sporting event, held since 1818. Six-person fixed-seat rowing races on Quidi Vidi Lake. It's a statutory holiday in St. John's — the whole city shuts down for the day.",
    icon: "🚣",
  },
  {
    name: "Tely 10 Road Race",
    month: "July",
    location: "St. John's",
    type: "Running",
    description: "Canada's oldest road race, first run in 1922. A gruelling 10-mile circuit through Signal Hill, Quidi Vidi, and the city's legendary hills. A rite of passage for Newfoundland runners.",
    icon: "🏃",
  },
  {
    name: "Iceberg Festival",
    month: "June",
    location: "Twillingate",
    type: "Festival",
    description: "Celebrate iceberg season with boat tours, seafood feasts, live music, and guided coastal hikes. A genuine community celebration of the spectacular annual Atlantic drift.",
    icon: "🧊",
  },
  {
    name: "George Street Festival",
    month: "August",
    location: "St. John's",
    type: "Music",
    description: "Week-long festival on the street with more licensed premises per square foot than anywhere in North America. Live music, mummers, and the raucous East Coast kitchen party spirit.",
    icon: "🎵",
  },
  {
    name: "Gros Morne Theatre Festival",
    month: "July–August",
    location: "Woody Point",
    type: "Arts",
    description: "Outdoor and indoor performances set against Bonne Bay and the Long Range Mountains in Gros Morne National Park. World-class theatre in an extraordinary wilderness setting.",
    icon: "🎭",
  },
  {
    name: "NL Folk Festival",
    month: "August",
    location: "Bannerman Park, St. John's",
    type: "Music",
    description: "Three days of traditional Newfoundland, Irish, and Celtic music. The best of accordion, fiddle, bodhran, and the unmistakable East Coast energy in a beloved city park.",
    icon: "🎻",
  },
  {
    name: "Wreckhouse Ultra",
    month: "September",
    location: "Port aux Basques area",
    type: "Ultramarathon",
    description: "Extreme trail running through the Wreckhouse region — where some of the world's strongest recorded land winds occur. Routes traverse coastal barrens, bogs, and Atlantic headlands.",
    icon: "💨",
  },
  {
    name: "Iceberg Man Triathlon",
    month: "July",
    location: "Twillingate",
    type: "Triathlon",
    description: "Swim, bike, and run through the stunning coastal landscape of Twillingate Island with icebergs potentially visible across Notre Dame Bay. A bucket-list Atlantic Canada event.",
    icon: "🏊",
  },
  {
    name: "Corner Brook Winter Carnival",
    month: "February",
    location: "Corner Brook",
    type: "Winter Festival",
    description: "Canada's longest-running winter carnival, held since 1965. Snow sculpting, alpine skiing at Marble Mountain, outdoor concerts, and the crowning of the Carnival Queen.",
    icon: "❄️",
  },
];

// Approximate SVG path for the island of Newfoundland (ViewBox: 0 0 440 420)
// Clockwise trace: NW tip of Northern Peninsula → south down NP west coast →
// west along main island north coast → south along west coast → east along south coast →
// Burin peninsula loop → Avalon isthmus and loop → north coast → Bonavista loop →
// Notre Dame Bay coast → north up NP east coast → close.
const NL_SVG_PATH = [
  "M 178,20",
  "L 165,48 L 155,80 L 152,110 L 152,132",
  "L 138,148 L 118,158 L 98,164 L 78,170 L 65,180",
  "L 60,200 L 58,225 L 62,252 L 65,275 L 68,300 L 78,320",
  "L 98,330 L 130,328 L 165,328 L 200,334",
  "L 228,342 L 248,358 L 248,375 L 230,380 L 210,365 L 200,348 L 200,332",
  "L 220,325 L 250,318",
  "L 278,310 L 290,298 L 295,278 L 298,258",
  "L 308,245 L 328,242 L 352,255 L 368,278",
  "L 360,305 L 338,318 L 312,320",
  "L 292,310 L 278,295 L 272,278 L 275,258",
  "L 278,245 L 295,235",
  "L 308,222 L 315,205 L 318,188 L 315,172",
  "L 325,162 L 340,152 L 350,140 L 348,128 L 335,122 L 318,118",
  "L 305,112 L 292,108 L 278,105 L 262,102 L 248,98 L 232,95 L 218,95",
  "L 210,88 L 205,75 L 200,62 L 196,48 L 192,35 L 186,25 L 181,20 Z",
].join(" ");

const MAP_LOCATIONS = [
  { id: "stjohns", name: "St. John's", x: 335, y: 248, type: "city", info: "Provincial capital. Signal Hill, Jellybean Row, George Street, Cape Spear — the most easterly point in North America." },
  { id: "gander", name: "Gander", x: 200, y: 200, type: "city", info: "Aviation heritage. Heart of Newfoundland. Proud home of Come From Away. International airport opened 1938." },
  { id: "cornerbrook", name: "Corner Brook", x: 68, y: 192, type: "city", info: "West coast hub. Marble Mountain skiing. Humber River. Gateway to the Viking Trail." },
  { id: "portauxbasques", name: "Port aux Basques", x: 73, y: 310, type: "city", info: "Marine Atlantic ferry terminal. Gateway from Nova Scotia to the island. Named for Basque fishermen." },
  { id: "twillingate", name: "Twillingate", x: 248, y: 110, type: "iceberg", info: "Iceberg Capital of the World. Peak season April–June. Whale watching. Long Point Lighthouse." },
  { id: "bonavista", name: "Bonavista", x: 345, y: 138, type: "heritage", info: "John Cabot's 1497 landfall. Historic lighthouse. Puffin colony at Elliston (15 min away)." },
  { id: "lansemeadows", name: "L'Anse aux Meadows", x: 178, y: 28, type: "heritage", info: "UNESCO Norse settlement c. 1000 CE. Leif Eriksson's Vinland — the first European presence in the Americas." },
  { id: "grossmorne", name: "Gros Morne NP", x: 80, y: 178, type: "nature", info: "UNESCO World Heritage. Ancient tablelands, fjord lakes, peaks to 806 m. Western Brook Pond boat tours." },
  { id: "fogoIsland", name: "Fogo Island", x: 290, y: 105, type: "nature", info: "Fogo Island Inn — one of the world's top hotels. Artists' studios. The outport community of Tilting." },
  { id: "terranova", name: "Terra Nova NP", x: 260, y: 195, type: "nature", info: "Atlantic boreal forest. Sea kayaking on Newman Sound. Caribou, black bears, bald eagles." },
  { id: "witlessbay", name: "Witless Bay", x: 348, y: 262, type: "nature", info: "North America's largest Atlantic Puffin colony — 260,000+ birds. Humpback whales, minkes, icebergs in season." },
  { id: "ferryland", name: "Ferryland", x: 352, y: 278, type: "heritage", info: "Lord Baltimore's 17th-century colony — active archaeological dig. Lighthouse Picnics on the cliff edge." },
];

const TYPE_COLORS: Record<string, string> = {
  city: "#C4591A",
  iceberg: "#4FB3C0",
  heritage: "#E8A040",
  nature: "#6B8F71",
};

const SIGHTING_COLOR = "#E8639F";

// Additional island communities (island only — Labrador isn't drawn on this map), positioned by
// fitting a lat/lng-to-pixel transform against the 12 hand-placed MAP_LOCATIONS markers above,
// then snapping any point that lands outside the illustrated coastline back onto the island.
// Used only to give sighting reports a plottable, discrete location — not shown as its own marker.
const MORE_PLACES = [
  { id: "mountpearl", name: "Mount Pearl", x: 298.3, y: 228.6 },
  { id: "paradise", name: "Paradise", x: 296.8, y: 228.3 },
  { id: "conceptionbaysouth", name: "Conception Bay South", x: 298, y: 231.6 },
  { id: "torbay", name: "Torbay", x: 305.5, y: 223.9 },
  { id: "portugalcove", name: "Portugal Cove-St. Philip's", x: 302, y: 226.3 },
  { id: "carbonear", name: "Carbonear", x: 299.8, y: 226.6 },
  { id: "harbourgrace", name: "Harbour Grace", x: 300, y: 228.1 },
  { id: "placentia", name: "Placentia", x: 273.9, y: 253.4 },
  { id: "marystown", name: "Marystown", x: 238, y: 290.6 },
  { id: "grandbank", name: "Grand Bank", x: 209.7, y: 301.9 },
  { id: "burin", name: "Burin", x: 238.6, y: 299.4 },
  { id: "clarenville", name: "Clarenville", x: 283.9, y: 214.2 },
  { id: "trinity", name: "Trinity", x: 310.5, y: 193.4 },
  { id: "elliston", name: "Elliston", x: 312.6, y: 176.7 },
  { id: "catalina", name: "Catalina", x: 312.9, y: 184 },
  { id: "deerlake", name: "Deer Lake", x: 112, y: 188.9 },
  { id: "stephenville", name: "Stephenville", x: 64.1, y: 241.8 },
  { id: "stanthony", name: "St. Anthony", x: 177.4, y: 28.2 },
  { id: "norrispoint", name: "Norris Point", x: 87.2, y: 171.8 },
  { id: "woodypoint", name: "Woody Point", x: 85.8, y: 173.6 },
  { id: "cowhead", name: "Cow Head", x: 115.2, y: 158.9 },
  { id: "baieverte", name: "Baie Verte", x: 163.3, y: 126.4 },
  { id: "springdale", name: "Springdale", x: 172.9, y: 152.7 },
  { id: "grandfallswindsor", name: "Grand Falls-Windsor", x: 197, y: 184.2 },
  { id: "botwood", name: "Botwood", x: 209.9, y: 167.1 },
  { id: "lewisporte", name: "Lewisporte", x: 222.7, y: 157.5 },
  { id: "changeislands", name: "Change Islands", x: 248.1, y: 119 },
  { id: "eastport", name: "Eastport", x: 290.1, y: 178 },
  { id: "musgraveharbour", name: "Musgrave Harbour", x: 271.9, y: 131.9 },
  { id: "wesleyville", name: "Wesleyville", x: 293.7, y: 147.5 },
  { id: "baybulls", name: "Bay Bulls", x: 345.4, y: 254.7 },
  { id: "capebroyle", name: "Cape Broyle", x: 341.3, y: 265.6 },
  { id: "renews", name: "Renews", x: 343.8, y: 280.9 },
  { id: "trepassey", name: "Trepassey", x: 325.9, y: 297.9 },
  { id: "stbrides", name: "St. Bride's", x: 272.1, y: 273.9 },
  { id: "comebychance", name: "Come By Chance", x: 285, y: 236 },
  { id: "tilting", name: "Tilting", x: 265.5, y: 115.9 },
  { id: "joebattsarm", name: "Joe Batt's Arm", x: 259.8, y: 116.2 },
  { id: "burgeo", name: "Burgeo", x: 118.1, y: 290.2 },
  { id: "ramea", name: "Ramea", x: 129.2, y: 294.1 },
  { id: "isleauxmorts", name: "Isle aux Morts", x: 71.1, y: 299.2 },
];

// Every place a sighting can be pinned to: the 12 featured map markers plus the wider community list.
const SIGHTING_PLACES = [
  ...MAP_LOCATIONS.map((l) => ({ id: l.id, name: l.name, x: l.x, y: l.y })),
  ...MORE_PLACES,
];

// ─── UTILS ───────────────────────────────────────────────────────────────────

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// Deterministic pseudo-random jitter so repeat sightings at one location don't stack exactly.
function jitterOffset(seed: string, spread: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const angle = (hash % 360) * (Math.PI / 180);
  const radius = 10 + (hash % spread);
  return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
}

// Lightweight fuzzy matcher: returns 0 for no match, higher is better
function fuzzyScore(query: string, text: string) {
  if (!query) return 0;
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (t.includes(q)) return 100 + q.length; // substring match ranks highest

  // check subsequence match and prefer more contiguous matches
  let qi = 0;
  let first = -1;
  let last = -1;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      if (first === -1) first = i;
      last = i;
      qi++;
    }
  }
  if (qi !== q.length) return 0; // not a subsequence

  const span = last - first + 1;
  // score favors short spans (more contiguous) and longer queries
  const contiguity = q.length / span; // 1 = fully contiguous, smaller if spread out
  const score = Math.floor(contiguity * 80) + Math.max(0, 20 - span);
  return score;
}

function getThumbnailFor(type: string, source: any) {
  if (!source) return undefined;
  if (type === "stay" && source.image) return source.image;
  if (type === "routes" && source.image) return source.image;
  if (type === "eat") return source.image;
  if (type === "events") return source.image;
  if (type === "map") {
    // generate a small SVG placeholder per location type/name
    const name = (source && source.name) ? String(source.name) : "Place";
    const color = (source && source.type && TYPE_COLORS[source.type]) ? TYPE_COLORS[source.type] : "#6B8F71";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'>` +
      `<rect width='100%' height='100%' fill='${color}' rx='8'/>` +
      `<g fill='rgba(240,234,216,0.95)' font-family='Arial, Helvetica, sans-serif' font-size='18' font-weight='700'>` +
      `<text x='16' y='36'>${escapeHtml(name)}</text>` +
      `</g>` +
      `</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  return source.image;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-mono text-[10px] tracking-[0.35em] text-accent uppercase">{number}</span>
      <div className="h-px w-10 bg-border" />
      <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">{label}</span>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────

function Nav({ activeSection, onSearchChange, searchQuery }: { activeSection: string; onSearchChange: (q: string) => void; searchQuery: string; }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <button onClick={() => scrollTo("hero")} className="flex items-center gap-2.5 group">
          <Anchor className="w-4 h-4 text-accent" strokeWidth={1.5} />
          <span className="font-display text-xs tracking-[0.18em] text-foreground uppercase">
            Newfoundland & Labrador
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className={`px-3.5 py-2 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors ${
                activeSection === l.id
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center ml-4">
          <input
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search places, routes, events…"
            className="bg-muted border border-border text-foreground px-3 py-2 rounded-md text-sm w-64 placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent"
          />
        </div>

        <button
          className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-card border-t border-border px-6 py-5">
          <div className="grid grid-cols-3 gap-y-3">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => { scrollTo(l.id); setOpen(false); }}
                className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors text-left py-1"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      id="hero"
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#08131e]"
    >
      <img
        src="https://images.unsplash.com/photo-1696835766318-e102285eb088?w=1800&h=1200&fit=crop&auto=format"
        alt="A towering iceberg floating in the North Atlantic off the coast of Newfoundland"
        className="absolute inset-0 w-full h-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0C1B2E]/70 via-[#0C1B2E]/20 to-[#0C1B2E]" />

      <div className="relative text-center px-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-14 bg-accent/50" />
          <span className="font-mono text-[10px] tracking-[0.45em] text-accent uppercase">Canada's Atlantic Edge</span>
          <div className="h-px w-14 bg-accent/50" />
        </div>

        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-foreground leading-[1.06] mb-6 tracking-wide">
          Newfoundland<br />&amp; Labrador
        </h1>

        <p className="font-body text-lg md:text-xl text-foreground/65 max-w-2xl mx-auto leading-relaxed mb-12 italic">
          Where icebergs drift past ancient cliffs, puffins nest in their millions,
          and a thousand years of seafaring culture endures in the warmest people on earth.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => scrollTo("discover")}
            className="px-9 py-3.5 bg-primary text-primary-foreground font-mono text-[11px] tracking-[0.28em] uppercase hover:bg-primary/90 transition-colors"
          >
            Begin Exploring
          </button>
          <button
            onClick={() => scrollTo("map")}
            className="px-9 py-3.5 border border-border text-foreground/65 font-mono text-[11px] tracking-[0.28em] uppercase hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            View the Island Map
          </button>
        </div>
      </div>

      <button
        onClick={() => scrollTo("discover")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
      >
        <span className="font-mono text-[9px] tracking-[0.35em] uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </button>
    </section>
  );
}

// ─── DISCOVER ────────────────────────────────────────────────────────────────

function DiscoverSection() {
  const cards = [
    { id: "stay",     num: "04", title: "Places to Rest",     desc: "From the world-famous Fogo Island Inn to historic St. John's harbour hotels, extraordinary lodging awaits.",          icon: "🏨", image: ACCOMMODATIONS[0]?.image },
    { id: "eat",      num: "05", title: "Places to Eat",      desc: "Salt cod, scrunchions, partridgeberry — the province's culinary identity is singular and deeply delicious.",           icon: "🍽️", image: RESTAURANTS[0]?.image || undefined },
    { id: "routes",   num: "06", title: "Scenic Routes",      desc: "Drive the Viking Trail through Gros Morne, circle the Irish Loop, or follow the Kittiwake Coast to iceberg alley.",  icon: "🛣️", image: ROUTES[0]?.image },
    { id: "wildlife", num: "07", title: "Wildlife & Seasons", desc: "Icebergs in April. Puffins in June. Humpbacks all summer. Track and report your sightings.",                         icon: "🐋", image: undefined },
    { id: "history",  num: "08", title: "A Deep History",     desc: "Norse settlements, Beothuk culture, a century of colonial rivalry, and the narrowest vote in Confederation history.", icon: "⚓", image: "https://images.unsplash.com/photo-1567108077905-f8a10e69a5a6?w=1600&h=400&fit=crop&auto=format" },
    { id: "gander",   num: "09", title: "Come From Away",     desc: "How the people of Gander opened their homes to 7,000 strangers on September 11, 2001.",                             icon: "✈️", image: "https://images.unsplash.com/photo-1639512464796-315a29c939c9?w=800&h=900&fit=crop&auto=format" },
    { id: "events",   num: "10", title: "Events & Adventure", desc: "North America's oldest sporting event, ultramarathons on coastal barrens, folk festivals and more.",                 icon: "🎭", image: undefined },
    { id: "map",      num: "11", title: "The Island Map",     desc: "An illustrated guide to key destinations across Newfoundland, from St. John's to L'Anse aux Meadows.",               icon: "🗺️", image: undefined },
  ];

  return (
    <section id="discover" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="01" label="Overview" />
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            The Rock. The Land.<br />The People.
          </h2>
          <div className="space-y-4 self-center">
            <p className="font-body text-foreground/65 leading-relaxed text-base">
              Newfoundland and Labrador occupies the northeast corner of North America — a world apart.
              Ancient mountains meet the sea at every turn. Inhabited for 9,000 years, explored by Norse
              sailors in 1000 CE, and shaped by a seafaring culture that endures to this day.
            </p>
            <p className="font-body text-foreground/65 leading-relaxed text-base">
              Come for the icebergs and puffins. Stay for the people —
              the most famously generous, music-filled, story-telling community in North America.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => scrollTo(c.id)}
              className="group bg-card overflow-hidden hover:bg-secondary transition-colors duration-200 flex flex-col"
            >
              <div className="h-40 bg-secondary overflow-hidden">
                {c.image ? (
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-all" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">{c.icon}</div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="font-mono text-[9px] tracking-[0.3em] text-accent uppercase mb-2">{c.num}</div>
                <h3 className="font-display text-base text-foreground mb-3 group-hover:text-accent transition-colors leading-snug">
                  {c.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">{c.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <ArrowRight className="w-3.5 h-3.5 text-accent" />
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">Explore</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STAY ────────────────────────────────────────────────────────────────────

function StaySection() {
  return (
    <section id="stay" className="py-24 px-6 bg-muted">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="04" label="Accommodation" />
        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-4 mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            Places to Stay
          </h2>
          <p className="font-body text-foreground/65 leading-relaxed self-end">
            From a globally celebrated architectural marvel on a remote island to restored merchant
            warehouses in St. John's Harbour — lodging in NL is as memorable as the landscape itself.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {ACCOMMODATIONS.map((acc) => (
            <div key={acc.name} className="group bg-card overflow-hidden flex flex-col">
              <div className="relative overflow-hidden h-48 bg-secondary flex-shrink-0">
                <img
                  src={acc.image}
                  alt={acc.alt}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                <span className="absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.2em] text-accent uppercase bg-card/70 px-2.5 py-1">
                  {acc.highlight}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground uppercase mb-1.5">
                  {acc.type} · {acc.location}
                </div>
                <h3 className="font-display text-xl text-foreground mb-3">{acc.name}</h3>
                <p className="font-body text-sm text-foreground/55 leading-relaxed flex-1">{acc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── EAT ─────────────────────────────────────────────────────────────────────

function EatSection() {
  return (
    <section id="eat" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="05" label="Dining" />
        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-4 mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            Places to Eat
          </h2>
          <p className="font-body text-foreground/65 leading-relaxed self-end">
            Salt fish, wild game, foraged berries, moose — the Newfoundland kitchen is like nowhere else.
            A generation of chefs are honouring tradition while pushing the table boldly forward.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-border">
          {RESTAURANTS.map((r, i) => (
            <div key={r.name} className="group bg-card p-8 hover:bg-secondary transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-mono text-[9px] tracking-[0.22em] text-accent uppercase mb-2">
                    {r.cuisine} · {r.location}
                  </div>
                  <h3 className="font-display text-2xl text-foreground">{r.name}</h3>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/40 mt-1 flex-shrink-0 ml-4">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="font-body text-sm text-foreground/55 leading-relaxed mb-5">{r.description}</p>
              <div className="border-t border-border pt-4 flex items-center gap-3">
                <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase flex-shrink-0">
                  Signature
                </span>
                <div className="h-px flex-1 bg-border" />
                <span className="font-body text-sm text-accent italic">{r.signature}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

function RoutesSection() {
  const [active, setActive] = useState(0);
  const route = ROUTES[active];

  return (
    <section id="routes" className="py-24 px-6 bg-muted">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="06" label="Driving Routes" />
        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-4 mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            Scenic Routes
          </h2>
          <p className="font-body text-foreground/65 leading-relaxed self-end">
            The Trans-Canada passes through the island's heart, but the real Newfoundland is found
            on the peninsulas — winding coastal roads ending at lighthouses and harbour villages.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-px bg-border">
          <div className="bg-card">
            {ROUTES.map((r, i) => (
              <button
                key={r.name}
                onClick={() => setActive(i)}
                className={`w-full p-6 text-left border-b border-border last:border-b-0 transition-colors ${
                  active === i ? "bg-secondary" : "hover:bg-secondary/40"
                }`}
              >
                <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5">
                  {r.code} · {r.distance}
                </div>
                <div className="font-display text-lg text-foreground mb-1">{r.name}</div>
                <div className="font-mono text-[9px] text-accent">{r.duration}</div>
              </button>
            ))}
          </div>

          <div className="bg-card lg:col-span-2 flex flex-col">
            <div className="relative h-56 bg-secondary overflow-hidden flex-shrink-0">
              <img
                src={route.image}
                alt={route.alt}
                className="w-full h-full object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card/95 to-transparent" />
              <div className="absolute bottom-5 left-7 right-7">
                <div className="font-mono text-[9px] tracking-[0.2em] text-accent uppercase mb-1">{route.code}</div>
                <h3 className="font-display text-2xl text-foreground">{route.name}</h3>
              </div>
            </div>
            <div className="p-8 flex-1">
              <div className="flex gap-8 mb-6">
                <div>
                  <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Distance</div>
                  <div className="font-display text-xl text-foreground">{route.distance}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Duration</div>
                  <div className="font-display text-xl text-foreground">{route.duration}</div>
                </div>
              </div>
              <p className="font-body text-foreground/65 leading-relaxed mb-7">{route.description}</p>
              <div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-3">Key Stops</div>
                <div className="flex flex-wrap gap-2">
                  {route.highlights.map((h) => (
                    <span key={h} className="px-3 py-1.5 border border-accent/25 text-accent font-mono text-[9px] tracking-[0.12em] uppercase">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── WILDLIFE ────────────────────────────────────────────────────────────────

// Fuzzy-matching text input for picking a sighting location from SIGHTING_PLACES.
function LocationPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const selected = SIGHTING_PLACES.find((p) => p.id === value);
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () => new Fuse(SIGHTING_PLACES, { keys: ["name"], threshold: 0.4 }),
    []
  );

  const results = useMemo(() => {
    if (!query) return SIGHTING_PLACES.slice(0, 8);
    return fuse.search(query, { limit: 8 }).map((r) => r.item);
  }, [fuse, query]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function choose(place: { id: string; name: string }) {
    onChange(place.id);
    setQuery(place.name);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlighted(0);
          setOpen(true);
          if (e.target.value !== selected?.name) onChange("");
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((i) => (i + 1) % results.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((i) => (i - 1 + results.length) % results.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            choose(results[highlighted]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Start typing a community…"
        autoComplete="off"
        className="w-full bg-muted border border-border text-foreground font-body text-sm px-4 py-3 placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none"
      />
      {open && results.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-border max-h-56 overflow-y-auto">
          {results.map((place, i) => (
            <div
              key={place.id}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(place);
              }}
              onMouseEnter={() => setHighlighted(i)}
              className={`px-4 py-2.5 font-body text-sm cursor-pointer ${i === highlighted ? "bg-accent/15 text-foreground" : "text-foreground/70"}`}
            >
              {place.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WildlifeSection() {
  const [form, setForm] = useState({
    species: "", location: "", date: "", description: "", name: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [locationFieldKey, setLocationFieldKey] = useState(0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!supabaseConfigured) {
      setSubmitError("Sighting reports aren't connected to storage yet.");
      return;
    }

    if (!SIGHTING_PLACES.some((p) => p.id === form.location)) {
      setSubmitError("Please pick a location from the suggestions list.");
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from("sightings")
      .insert({
        species: form.species,
        location_id: form.location,
        sighted_on: form.date,
        description: form.description || null,
        reporter_name: form.name || null,
      })
      .select()
      .single();
    setSubmitting(false);

    if (error) {
      setSubmitError("Something went wrong submitting your sighting. Please try again.");
      return;
    }

    window.dispatchEvent(new CustomEvent("sighting-added", { detail: data as Sighting }));
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setForm({ species: "", location: "", date: "", description: "", name: "" });
    setLocationFieldKey((k) => k + 1);
  }

  const calendarItems = [
    // Header row
    <div key="corner" className="p-4 border-b border-r border-border" />,
    ...MONTHS.map((m) => (
      <div key={`h-${m}`} className="p-3 text-center border-b border-r border-border last:border-r-0">
        <span className="font-mono text-[9px] tracking-[0.18em] text-muted-foreground uppercase">{m}</span>
      </div>
    )),
    // Species rows
    ...WILDLIFE_DATA.flatMap((w, ri) => [
      <div
        key={`label-${w.species}`}
        className={`p-4 border-b border-r border-border flex items-center gap-2.5 ${ri === WILDLIFE_DATA.length - 1 ? "border-b-0" : ""}`}
      >
        <span className="text-base leading-none">{w.icon}</span>
        <span className="font-body text-sm text-foreground leading-tight">{w.species}</span>
      </div>,
      ...w.season.map((active, mi) => (
        <div
          key={`${w.species}-${mi}`}
          className={`border-b border-r border-border last:border-r-0 ${ri === WILDLIFE_DATA.length - 1 ? "border-b-0" : ""}`}
        >
          {active ? (
            <div className="h-full min-h-[48px] bg-accent/15 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
          ) : (
            <div className="h-full min-h-[48px]" />
          )}
        </div>
      )),
    ]),
  ];

  return (
    <section id="wildlife" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="07" label="Wildlife & Migration" />
        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-4 mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            Seasons of the Wild
          </h2>
          <p className="font-body text-foreground/65 leading-relaxed self-end">
            Newfoundland's wildlife calendar is extraordinary — every season delivers a new spectacle.
            Log your sightings to help build a community record of the province's natural wonders.
          </p>
        </div>

        {/* Migration calendar */}
        <div className="bg-card border border-border mb-12 overflow-x-auto">
          <div
            className="grid min-w-[680px]"
            style={{ gridTemplateColumns: "1.4fr repeat(12, 1fr)" }}
          >
            {calendarItems}
          </div>
        </div>

        {/* Species cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border mb-16">
          {WILDLIFE_DATA.map((w) => (
            <div key={w.species} className="bg-card p-6">
              <div className="text-2xl mb-3 leading-none">{w.icon}</div>
              <h3 className="font-display text-lg text-foreground mb-2">{w.species}</h3>
              <p className="font-body text-sm text-foreground/55 leading-relaxed mb-5">{w.description}</p>
              <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-2">Best Spots</div>
              {w.hotspots.map((h) => (
                <div key={h} className="flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-2.5 h-2.5 text-accent/70 flex-shrink-0" />
                  <span className="font-mono text-[10px] text-accent/80">{h}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Sighting submission */}
        <div className="grid lg:grid-cols-2 gap-0 bg-card border border-border">
          <div className="p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-border">
            <div className="font-mono text-[9px] tracking-[0.3em] text-accent uppercase mb-4">Community Science</div>
            <h3 className="font-display text-3xl text-foreground mb-4">Report a Sighting</h3>
            <p className="font-body text-foreground/60 leading-relaxed mb-8">
              Submit your iceberg, whale, puffin, or wildlife sighting to help build a community-sourced
              tracking record for Newfoundland and Labrador's natural wonders. All reports are welcomed.
            </p>
            <div className="space-y-4">
              {[
                { icon: "🧊", text: "Iceberg sightings help vessels navigate Iceberg Alley safely" },
                { icon: "🐋", text: "Whale reports contribute to North Atlantic migration research" },
                { icon: "🐦", text: "Bird sightings support puffin colony health monitoring" },
                { icon: "🦌", text: "Caribou data aids herd population tracking across the island" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <span className="text-base mt-0.5 leading-none">{item.icon}</span>
                  <p className="font-body text-sm text-foreground/50 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-5">
            {submitted && (
              <div className="bg-accent/10 border border-accent/25 p-4 font-mono text-[10px] tracking-[0.15em] text-accent uppercase">
                ✓ Sighting submitted — thank you for your report!
              </div>
            )}
            {submitError && (
              <div className="bg-destructive/10 border border-destructive/25 p-4 font-mono text-[10px] tracking-[0.15em] text-destructive uppercase">
                {submitError}
              </div>
            )}

            <div>
              <label className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase block mb-2">
                Species *
              </label>
              <select
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
                required
                className="w-full bg-muted border border-border text-foreground font-body text-sm px-4 py-3 focus:border-accent focus:outline-none appearance-none"
              >
                <option value="">Select a species…</option>
                {["Humpback Whale","Minke Whale","Fin Whale","Atlantic Puffin","Iceberg","Caribou","Bald Eagle","Capelin Roll","Moose","Black Bear","Other"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase block mb-2">
                  Location *
                </label>
                <LocationPicker
                  key={locationFieldKey}
                  value={form.location}
                  onChange={(id) => setForm((f) => ({ ...f, location: id }))}
                />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase block mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="w-full bg-muted border border-border text-foreground font-body text-sm px-4 py-3 focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase block mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What did you see? Size, count, behaviour, conditions…"
                rows={3}
                className="w-full bg-muted border border-border text-foreground font-body text-sm px-4 py-3 placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase block mb-2">
                Your Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Anonymous is perfectly fine"
                className="w-full bg-muted border border-border text-foreground font-body text-sm px-4 py-3 placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground font-mono text-[11px] tracking-[0.25em] uppercase py-4 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2.5"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Submitting…" : "Submit Sighting"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────

function HistorySection() {
  return (
    <section id="history" className="py-24 px-6 bg-muted">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="08" label="History" />
        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-4 mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            Nine Thousand Years<br />in the Making
          </h2>
          <p className="font-body text-foreground/65 leading-relaxed self-end">
            From the first peoples who followed the retreating glaciers, to Norse sailors who built the
            first European settlement in the Americas, to the closest referendum in Confederation history —
            Newfoundland and Labrador carries one of the richest stories on the continent.
          </p>
        </div>

        {/* Hero image */}
        <div className="relative h-56 mb-16 overflow-hidden bg-[#0a1520]">
          <img
            src="https://images.unsplash.com/photo-1567108077905-f8a10e69a5a6?w=1600&h=400&fit=crop&auto=format"
            alt="A traditional wooden longboat on calm water — evoking the Norse seafarers who reached Newfoundland a thousand years ago"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-muted via-transparent to-muted" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Waves className="w-14 h-14 text-accent/20" strokeWidth={1} />
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-0 sm:left-[175px] top-0 bottom-0 w-px bg-border hidden sm:block" />
          <div className="divide-y divide-border sm:divide-y-0">
            {HISTORY_EVENTS.map((ev) => (
              <div key={ev.year} className="grid sm:grid-cols-[175px_1fr] gap-4 sm:gap-10 group py-8 sm:py-0">
                <div className="sm:text-right sm:pt-10 sm:pb-10 sm:pr-0">
                  <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground uppercase mb-1">{ev.era}</div>
                  <div className="font-display text-lg text-accent">{ev.year}</div>
                </div>
                <div className="relative sm:pl-10 sm:pt-10 sm:pb-10 sm:border-t sm:border-border sm:border-t-0">
                  <div className="hidden sm:block absolute -left-[5px] top-10 w-2.5 h-2.5 rounded-full border border-accent bg-muted group-hover:bg-accent transition-colors duration-200" />
                  <h3 className="font-display text-xl text-foreground mb-3">{ev.title}</h3>
                  <p className="font-body text-sm text-foreground/55 leading-relaxed">{ev.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── GANDER ──────────────────────────────────────────────────────────────────

function GanderSection() {
  return (
    <section id="gander" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="09" label="Community & Culture" />

        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          <div>
            <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-6">
              When the World<br />Came to Gander
            </h2>
            <p className="font-body text-foreground/65 leading-relaxed mb-5">
              On September 11, 2001, the United States closed its airspace. Thirty-eight
              trans-Atlantic flights — carrying 6,579 passengers from 95 different countries —
              were diverted to Gander International Airport in central Newfoundland.
            </p>
            <p className="font-body text-foreground/65 leading-relaxed mb-5">
              Gander's population of roughly 10,000 opened their homes, schools, hockey arenas,
              and community centres without hesitation. Passengers stayed for five days.
              They were fed, clothed, cared for, and made to feel welcome by people
              who had never met them and asked nothing in return.
            </p>
            <p className="font-body text-foreground/65 leading-relaxed mb-8">
              The nearby communities of Gambo, Appleton, Lewisporte, and Norris Arm joined in.
              Pharmacists filled prescriptions without payment. Buses ran through the night.
              Musicians played in makeshift gathering halls. Cooks just cooked.
            </p>
            <div className="border-l-2 border-accent pl-6 mb-8">
              <p className="font-body text-lg text-foreground/75 italic leading-relaxed">
                "Come from away" is what Newfoundlanders call anyone not from the island.
                On that week in September, it became a term of the deepest welcome.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-border">
              {[
                { label: "Diverted Flights", value: "38" },
                { label: "Passengers", value: "6,579" },
                { label: "Countries Represented", value: "95" },
                { label: "Days Stranded", value: "5" },
              ].map((s) => (
                <div key={s.label} className="bg-card p-5">
                  <div className="font-display text-3xl text-accent mb-1">{s.value}</div>
                  <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden bg-secondary h-[480px] lg:h-[560px]">
              <img
                src="https://images.unsplash.com/photo-1639512464796-315a29c939c9?w=800&h=900&fit=crop&auto=format"
                alt="Northern lights over Canada — the vast sky that sheltered 7,000 strangers in Gander, Newfoundland"
                className="w-full h-full object-cover opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-card border border-border p-6 max-w-[260px]">
              <div className="font-mono text-[9px] tracking-[0.25em] text-accent uppercase mb-2">September 11, 2001</div>
              <div className="font-display text-4xl text-foreground mb-1.5">Gander, NL</div>
              <div className="font-body text-sm text-muted-foreground">Population ~10,000. Welcomed the world without reservation.</div>
            </div>
          </div>
        </div>

        {/* Come From Away */}
        <div className="bg-card border border-border">
          <div className="grid md:grid-cols-3 gap-0">
            <div className="md:col-span-2 p-8 md:p-12 border-b md:border-b-0 md:border-r border-border">
              <div className="font-mono text-[9px] tracking-[0.3em] text-accent uppercase mb-4">Come From Away</div>
              <h3 className="font-display text-3xl text-foreground mb-5">The Musical</h3>
              <p className="font-body text-foreground/65 leading-relaxed mb-4">
                In 2013, Canadian writers Irene Sankoff and David Hein premiered{" "}
                <em className="text-foreground/80">Come From Away</em> — a musical drawn from
                over 100 interviews with both Gander residents and "plane people."
                The show opened on Broadway in March 2017, winning the Tony Award for
                Best Direction of a Musical. It has since played London's West End, across
                Canada, Australia, and on Apple TV+.
              </p>
              <p className="font-body text-foreground/65 leading-relaxed">
                The show runs without intermission, with 12 actors playing over 100 characters.
                It captures the particular warmth, humour, and fierce generosity that define
                Newfoundland and Labrador's character — and reminds audiences that radical
                hospitality is simply treating strangers as neighbours.
              </p>
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center gap-6">
              {[
                { label: "Broadway Premiere", value: "March 12, 2017" },
                { label: "Tony Award", value: "Best Direction, 2017" },
                { label: "Countries Toured", value: "9 and counting" },
                { label: "Interviews Conducted", value: "Over 100" },
              ].map((s) => (
                <div key={s.label} className="border-b border-border pb-5 last:border-b-0 last:pb-0">
                  <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5">{s.label}</div>
                  <div className="font-display text-xl text-foreground">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────

function EventsSection() {
  const types = ["All", ...Array.from(new Set(EVENTS_DATA.map((e) => e.type)))];
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? EVENTS_DATA : EVENTS_DATA.filter((e) => e.type === filter);

  return (
    <section id="events" className="py-24 px-6 bg-muted">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="10" label="Events & Activities" />
        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-4 mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            Events &amp; Outdoor<br />Adventures
          </h2>
          <p className="font-body text-foreground/65 leading-relaxed self-end">
            From North America's oldest sporting event to ultramarathons across coastal barrens,
            the province's event calendar is as rugged and spirited as its landscape.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 font-mono text-[9px] tracking-[0.2em] uppercase border transition-colors ${
                filter === t
                  ? "bg-accent text-accent-foreground border-accent"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/25"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {filtered.map((ev) => (
            <div key={ev.name} className="bg-card p-7 group hover:bg-secondary transition-colors flex flex-col">
              <div className="text-2xl mb-4 leading-none">{ev.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[9px] tracking-[0.2em] text-accent uppercase">{ev.month}</span>
                <span className="text-border">·</span>
                <span className="font-mono text-[9px] tracking-[0.1em] text-muted-foreground uppercase">{ev.type}</span>
              </div>
              <h3 className="font-display text-xl text-foreground mb-1.5">{ev.name}</h3>
              <div className="font-mono text-[9px] text-muted-foreground mb-4 flex items-center gap-1.5">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                {ev.location}
              </div>
              <p className="font-body text-sm text-foreground/55 leading-relaxed flex-1">{ev.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MAP ─────────────────────────────────────────────────────────────────────

function MapSection() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const activeId = hovered ?? selected;
  const hoveredLoc = MAP_LOCATIONS.find((l) => l.id === activeId);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase
      .from("sightings")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setSightings(data as Sighting[]);
      });
  }, []);

  useEffect(() => {
    function handler(e: any) {
      const sighting = e?.detail as Sighting | undefined;
      if (sighting) setSightings((prev) => [sighting, ...prev]);
    }
    window.addEventListener("sighting-added", handler as EventListener);
    return () => window.removeEventListener("sighting-added", handler as EventListener);
  }, []);

  const sightingsByLocation = useMemo(() => {
    const map: Record<string, Sighting[]> = {};
    for (const s of sightings) {
      (map[s.location_id] ??= []).push(s);
    }
    return map;
  }, [sightings]);

  useEffect(() => {
    function handler(e: any) {
      const id = e?.detail?.id;
      if (id) {
        setHovered(id);
        // briefly keep highlight
        setTimeout(() => setHovered(null), 4000);
      }
    }
    window.addEventListener("search-select", handler as EventListener);
    return () => window.removeEventListener("search-select", handler as EventListener);
  }, []);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (mapRef.current && !mapRef.current.contains(e.target as Node)) {
        setSelected(null);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <section id="map" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="11" label="Island Map" />
        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-4 mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            Newfoundland Island
          </h2>
          <p className="font-body text-foreground/65 leading-relaxed self-end">
            An illustrated guide to key destinations. Hover a marker for a preview, or click one to pin its details.
            Labrador — to the west and north — is connected by ferry from St. Barbe to Blanc-Sablon.
          </p>
        </div>

        <div ref={mapRef} className="grid lg:grid-cols-3 gap-px bg-border">
          {/* SVG Map */}
          <div className="lg:col-span-2 bg-card relative overflow-hidden" style={{ minHeight: 520 }}>
            {/* Dot grid texture */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, #4FB3C0 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />

            <svg
              viewBox="0 0 440 420"
              className="w-full"
              style={{ minHeight: 520 }}
              aria-label="Illustrated map of the island of Newfoundland with key destination markers"
              onClick={() => setSelected(null)}
            >
              {/* Island fill */}
              <path
                d={NL_SVG_PATH}
                fill="#1D3450"
                stroke="#4FB3C0"
                strokeWidth="1.2"
                strokeOpacity="0.35"
              />

              {/* Subtle grid lines */}
              {[88, 176, 264, 352].map((x) => (
                <line key={`vl-${x}`} x1={x} y1="0" x2={x} y2="420" stroke="#4FB3C0" strokeWidth="0.4" strokeOpacity="0.1" />
              ))}
              {[84, 168, 252, 336].map((y) => (
                <line key={`hl-${y}`} x1="0" y1={y} x2="440" y2={y} stroke="#4FB3C0" strokeWidth="0.4" strokeOpacity="0.1" />
              ))}

              {/* Markers */}
              {MAP_LOCATIONS.map((loc) => {
                const color = TYPE_COLORS[loc.type];
                const isHovered = activeId === loc.id;
                return (
                  <g
                    key={loc.id}
                    transform={`translate(${loc.x},${loc.y})`}
                    onMouseEnter={() => setHovered(loc.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected((prev) => (prev === loc.id ? null : loc.id));
                    }}
                    style={{ cursor: "pointer", outline: "none" }}
                    role="button"
                    aria-label={loc.name}
                    aria-pressed={selected === loc.id}
                  >
                    <circle r="12" fill={color} opacity="0.1" />
                    <circle r={isHovered ? 5.5 : 4} fill={color} style={{ transition: "r 0.15s" }} />
                    <circle r="4" fill="none" stroke={color} strokeWidth="1" opacity={isHovered ? 0.7 : 0.3} style={{ transition: "opacity 0.15s" }} />
                  </g>
                );
              })}

              {/* Community sighting reports */}
              {sightings.map((s) => {
                const loc = SIGHTING_PLACES.find((l) => l.id === s.location_id);
                if (!loc) return null;
                const { dx, dy } = jitterOffset(s.id, 10);
                return (
                  <circle
                    key={s.id}
                    cx={loc.x + dx}
                    cy={loc.y + dy}
                    r="2.5"
                    fill={SIGHTING_COLOR}
                    opacity="0.85"
                    pointerEvents="none"
                  />
                );
              })}

              {/* Active location label */}
              {hoveredLoc && (
                <text
                  x={hoveredLoc.x + 10}
                  y={hoveredLoc.y - 8}
                  fill="#F0EAD8"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                  letterSpacing="1.2"
                  opacity="0.9"
                  pointerEvents="none"
                >
                  {hoveredLoc.name.toUpperCase()}
                </text>
              )}

              {/* Compass */}
              <g transform="translate(18,396)">
                <text fill="#7A9BB8" fontSize="9" fontFamily="JetBrains Mono, monospace" opacity="0.5">N↑</text>
              </g>

              {/* Scale bar */}
              <g transform="translate(352,406)">
                <line x1="0" y1="0" x2="64" y2="0" stroke="#7A9BB8" strokeWidth="1" opacity="0.35" />
                <line x1="0" y1="-3" x2="0" y2="3" stroke="#7A9BB8" strokeWidth="1" opacity="0.35" />
                <line x1="64" y1="-3" x2="64" y2="3" stroke="#7A9BB8" strokeWidth="1" opacity="0.35" />
                <text x="8" y="-6" fill="#7A9BB8" fontSize="7" fontFamily="JetBrains Mono, monospace" opacity="0.5">~100 km</text>
              </g>
            </svg>
          </div>

          {/* Location detail panel */}
          <div className="bg-card flex flex-col">
            <div className="flex-1 p-7">
              {hoveredLoc ? (
                <>
                  <div
                    className="w-3 h-3 rounded-full mb-4"
                    style={{ background: TYPE_COLORS[hoveredLoc.type] }}
                  />
                  <div
                    className="font-mono text-[9px] tracking-[0.25em] uppercase mb-2"
                    style={{ color: TYPE_COLORS[hoveredLoc.type] }}
                  >
                    {hoveredLoc.type}
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-4">{hoveredLoc.name}</h3>
                  <p className="font-body text-sm text-foreground/60 leading-relaxed">{hoveredLoc.info}</p>

                  {(sightingsByLocation[hoveredLoc.id]?.length ?? 0) > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3" style={{ color: SIGHTING_COLOR }}>
                        Community Sightings ({sightingsByLocation[hoveredLoc.id].length})
                      </div>
                      <div className="space-y-3">
                        {sightingsByLocation[hoveredLoc.id].slice(0, 5).map((s) => (
                          <div key={s.id} className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: SIGHTING_COLOR }} />
                            <div>
                              <div className="font-body text-sm text-foreground/80">
                                {s.species} <span className="text-foreground/40">· {s.sighted_on}</span>
                              </div>
                              {s.description && (
                                <p className="font-body text-xs text-foreground/50 leading-relaxed mt-0.5">{s.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground uppercase mb-5">
                    Key Locations
                  </div>
                  <div className="divide-y divide-border">
                    {MAP_LOCATIONS.map((loc) => (
                      <div
                        key={loc.id}
                        onClick={() => setSelected((prev) => (prev === loc.id ? null : loc.id))}
                        role="button"
                        aria-pressed={selected === loc.id}
                        aria-label={loc.name}
                        style={{ outline: "none" }}
                        className="flex items-center gap-3 py-3 cursor-pointer group"
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: TYPE_COLORS[loc.type] }}
                        />
                        <span className="font-body text-sm text-foreground/65 group-hover:text-foreground transition-colors flex-1">
                          {loc.name}
                        </span>
                        <span className="font-mono text-[8px] tracking-[0.12em] text-muted-foreground uppercase">
                          {loc.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-border">
              <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-3">Legend</div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {Object.entries(TYPE_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="font-mono text-[9px] tracking-[0.1em] text-muted-foreground uppercase">{type}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SIGHTING_COLOR }} />
                  <span className="font-mono text-[9px] tracking-[0.1em] text-muted-foreground uppercase">Sighting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-16 px-6 bg-[#070F1A] border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <Anchor className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
              <span className="font-display text-xs tracking-[0.15em] text-foreground uppercase">
                NL Tourism Guide
              </span>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Newfoundland and Labrador, Canada. Where ancient rock meets the sea,
              the sea meets the ice, and the ice meets the sky.
            </p>
            <p className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase mt-4">49°N · 55°W</p>
          </div>

          <div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground uppercase mb-4">Explore</div>
            <div className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="block font-body text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground uppercase mb-4">Useful Resources</div>
            <div className="space-y-2.5">
              {[
                "Newfoundland & Labrador Tourism",
                "Parks Canada — Gros Morne",
                "Marine Atlantic Ferry Service",
                "Iceberg Finder — IIP",
                "Come From Away — The Musical",
                "Government of NL",
              ].map((link) => (
                <div key={link} className="font-body text-sm text-muted-foreground/55">{link}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground/40 uppercase">
            A tribute to the people of the Rock
          </p>
          <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground/30 uppercase">
            Newfoundland & Labrador, Canada
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Build a flat searchable index for Fuse
  const searchIndex = useMemo(() => {
    const list: Array<any> = [];
    ACCOMMODATIONS.forEach((a, i) => list.push({ id: `stay-${i}`, title: a.name, subtitle: a.location, section: "stay", excerpt: a.description, thumbnail: getThumbnailFor("stay", a), ref: a }));
    RESTAURANTS.forEach((r, i) => list.push({ id: `eat-${i}`, title: r.name, subtitle: r.location, section: "eat", excerpt: r.description, thumbnail: getThumbnailFor("eat", r), ref: r }));
    ROUTES.forEach((r, i) => list.push({ id: `routes-${i}`, title: r.name, subtitle: r.code, section: "routes", excerpt: r.description, thumbnail: getThumbnailFor("routes", r), ref: r }));
    EVENTS_DATA.forEach((e, i) => list.push({ id: `events-${i}`, title: e.name, subtitle: e.location, section: "events", excerpt: e.description, thumbnail: getThumbnailFor("events", e), ref: e }));
    MAP_LOCATIONS.forEach((m) => list.push({ id: `map-${m.id}`, title: m.name, subtitle: m.type, section: "map", excerpt: m.info, thumbnail: getThumbnailFor("map", m), ref: m }));
    return list;
  }, []);

  const fuse = useMemo(() => new Fuse(searchIndex, {
    keys: [
      { name: 'title', weight: 0.6 },
      { name: 'subtitle', weight: 0.2 },
      { name: 'excerpt', weight: 0.2 },
    ],
    threshold: 0.4,
    includeScore: true,
  }), [searchIndex]);

  const fuseResults = useMemo(() => {
    if (!searchQuery) return [] as any[];
    try {
      return fuse.search(searchQuery, { limit: 12 });
    } catch (e) {
      return [] as any[];
    }
  }, [fuse, searchQuery]);

  // keyboard navigation for search results
  useEffect(() => {
    if (!searchQuery) return;
    function onKey(e: KeyboardEvent) {
      if (fuseResults.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((s) => (s + 1) % Math.min(fuseResults.length, 8));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((s) => (s - 1 + Math.min(fuseResults.length, 8)) % Math.min(fuseResults.length, 8));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const chosen = fuseResults[selectedIndex];
        if (chosen) {
          const it = chosen.item as any;
          setSearchQuery("");
          scrollTo(it.section);
          if (it.section === 'map' && it.ref && it.ref.id) {
            window.dispatchEvent(new CustomEvent('search-select', { detail: { id: it.ref.id } }));
          }
        }
      } else if (e.key === 'Escape') {
        setSearchQuery("");
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchQuery, fuseResults, selectedIndex]);

  useEffect(() => {
    const ids = ["hero", ...NAV_LINKS.map((l) => l.id)];
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.25 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav activeSection={activeSection} onSearchChange={setSearchQuery} searchQuery={searchQuery} />
      {searchQuery.length > 0 && (
        <div className="fixed top-16 left-0 right-0 z-50 px-6">
          <div className="max-w-7xl mx-auto bg-card border border-border shadow-lg">
            <div className="divide-y divide-border">
              {fuseResults.length === 0 ? (
                <div className="p-6 text-muted-foreground">No results</div>
              ) : (
                <>
                  <div className="sr-only" aria-live="polite" aria-atomic="true">{`${fuseResults.length} results`}</div>
                  <div ref={resultsRef} className="p-2 grid gap-1" role="listbox" aria-activedescendant={`result-${selectedIndex}`} tabIndex={-1} aria-label="Search results">
                    {fuseResults.slice(0, 8).map((r, i) => {
                      const it = r.item as any;
                      const selected = i === selectedIndex;
                      return (
                        <button
                          id={`result-${i}`}
                          key={it.id}
                          role="option"
                          aria-selected={selected}
                          onMouseEnter={() => setSelectedIndex(i)}
                          onFocus={() => setSelectedIndex(i)}
                          tabIndex={0}
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedIndex(0);
                            scrollTo(it.section);
                            if (it.section === "map" && it.ref && it.ref.id) {
                              window.dispatchEvent(new CustomEvent("search-select", { detail: { id: it.ref.id } }));
                            }
                          }}
                          className={`text-left p-3 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-accent transition-colors flex items-start gap-3 ${selected ? 'bg-muted/30' : ''}`}
                        >
                          <div className="w-20 h-14 rounded overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                            {it.thumbnail ? (
                              // @ts-ignore
                              <img src={it.thumbnail} alt={it.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">{it.section.toUpperCase()}</div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-baseline justify-between gap-4">
                              <div className="font-display text-sm text-foreground">{it.title}</div>
                              <div className="font-mono text-[10px] text-muted-foreground uppercase">{it.section}</div>
                            </div>
                            {it.subtitle && <div className="font-mono text-[11px] text-muted-foreground">{it.subtitle}</div>}
                            {it.excerpt && <div className="font-body text-sm text-muted-foreground/70 mt-2">{it.excerpt}…</div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <HeroSection />
      <DiscoverSection />
      <StaySection />
      <EatSection />
      <RoutesSection />
      <WildlifeSection />
      <HistorySection />
      <GanderSection />
      <EventsSection />
      <MapSection />
      <Footer />
    </div>
  );
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const CATS = [
  { id:"personal", symbol:"◈", color:"#9B8CF8", en:"Personal",  fr:"Personnel" },
  { id:"career",   symbol:"◆", color:"#4A90E2", en:"Career",    fr:"Carrière"  },
  { id:"health",   symbol:"◉", color:"#34D399", en:"Health",    fr:"Santé"     },
  { id:"finance",  symbol:"◎", color:"#F59E0B", en:"Finance",   fr:"Finance"   },
  { id:"love",     symbol:"♥", color:"#F472B6", en:"Love",      fr:"Amour"     },
];

export const getCat = id => CATS.find(c => c.id === id) || CATS[0];

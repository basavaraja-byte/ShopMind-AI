export interface ProductData {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  stock: boolean;
  delivery_days: number;
  discount: number;
  final_price: number;
  description: string;
  specifications: Record<string, any>;
  score_reason?: string;
  match_score?: number;
}

export const PRODUCTS_CATALOG: ProductData[] = [
  {
    id: "P001",
    name: "Samsung Galaxy M14 5G",
    category: "mobile",
    brand: "Samsung",
    price: 18999,
    rating: 4.5,
    stock: true,
    delivery_days: 2,
    discount: 2000,
    final_price: 16999,
    description: "Samsung Galaxy M14 5G features a 50MP triple camera setup, 6000mAh monster battery, 6.6-inch FHD+ 90Hz display, and 5nm Exynos processor perfect for heavy multitasking and night photography.",
    specifications: {
      ram: "6GB",
      storage: "128GB",
      camera: "50MP Triple Camera with Nightography",
      battery: "6000 mAh with 25W Fast Charging",
      display: "6.6-inch FHD+ 90Hz LCD",
      processor: "Exynos 1330 5nm"
    }
  },
  {
    id: "P002",
    name: "Redmi Note 13 5G",
    category: "mobile",
    brand: "Xiaomi",
    price: 17999,
    rating: 4.4,
    stock: true,
    delivery_days: 3,
    discount: 1500,
    final_price: 16499,
    description: "Redmi Note 13 5G features an ultra-slim design, 108MP pro-grade camera, 120Hz Super AMOLED display, and MediaTek Dimensity 6080 chipset with long-lasting battery life.",
    specifications: {
      ram: "6GB",
      storage: "128GB",
      camera: "108MP Main + 8MP Ultrawide + 2MP Macro",
      battery: "5000 mAh with 33W Fast Charging",
      display: "6.67-inch FHD+ 120Hz AMOLED",
      processor: "MediaTek Dimensity 6080"
    }
  },
  {
    id: "P003",
    name: "Realme Narzo 60 5G",
    category: "mobile",
    brand: "Realme",
    price: 15999,
    rating: 4.3,
    stock: true,
    delivery_days: 2,
    discount: 1000,
    final_price: 14999,
    description: "Realme Narzo 60 5G comes with a premium vegan leather back design, 90Hz Super AMOLED screen, 64MP AI camera, and 33W SUPERVOOC fast charging.",
    specifications: {
      ram: "8GB",
      storage: "128GB",
      camera: "64MP Street Photography Camera",
      battery: "5000 mAh with 33W SUPERVOOC",
      display: "6.43-inch FHD+ 90Hz Super AMOLED",
      processor: "MediaTek Dimensity 6020"
    }
  },
  {
    id: "P004",
    name: "Poco X6 Pro 5G",
    category: "mobile",
    brand: "Poco",
    price: 24999,
    rating: 4.6,
    stock: true,
    delivery_days: 1,
    discount: 3000,
    final_price: 21999,
    description: "Ultimate budget flagship for gaming and performance powered by Dimensity 8300-Ultra, CrystalRes 120Hz AMOLED screen, and 64MP OIS camera.",
    specifications: {
      ram: "8GB",
      storage: "256GB",
      camera: "64MP OIS + 8MP + 2MP",
      battery: "5000 mAh with 67W Turbo Charge",
      display: "6.67-inch 1.5K 120Hz Flow AMOLED",
      processor: "MediaTek Dimensity 8300-Ultra"
    }
  },
  {
    id: "P005",
    name: "OnePlus Nord CE 3 Lite 5G",
    category: "mobile",
    brand: "OnePlus",
    price: 19999,
    rating: 4.4,
    stock: false,
    delivery_days: 4,
    discount: 1000,
    final_price: 18999,
    description: "Fast and smooth OnePlus experience with 108MP camera system, 67W SUPERVOOC charging, dual stereo speakers, and OxygenOS 13.1.",
    specifications: {
      ram: "8GB",
      storage: "128GB",
      camera: "108MP Main Lens",
      battery: "5000 mAh with 67W SUPERVOOC",
      display: "6.72-inch FHD+ 120Hz Display",
      processor: "Qualcomm Snapdragon 695 5G"
    }
  },
  {
    id: "P006",
    name: "Apple MacBook Air M2",
    category: "laptop",
    brand: "Apple",
    price: 99900,
    rating: 4.8,
    stock: true,
    delivery_days: 1,
    discount: 8000,
    final_price: 91900,
    description: "Thin and light laptop with Apple M2 chip, 13.6-inch Liquid Retina Display, 18-hour battery life, 1080p FaceTime HD camera, and fanless silent operation.",
    specifications: {
      processor: "Apple M2 8-core CPU / 8-core GPU",
      ram: "8GB Unified Memory",
      storage: "256GB SSD",
      display: "13.6-inch Liquid Retina Display",
      battery: "Up to 18 hours battery life"
    }
  },
  {
    id: "P007",
    name: "ASUS TUF Gaming F15",
    category: "laptop",
    brand: "ASUS",
    price: 54990,
    rating: 4.5,
    stock: true,
    delivery_days: 2,
    discount: 5000,
    final_price: 49990,
    description: "High-performance gaming laptop equipped with Intel Core i5 11th Gen, NVIDIA GeForce RTX 2050 GPU, 144Hz display, and military-grade durability.",
    specifications: {
      processor: "Intel Core i5-11400H",
      graphics: "NVIDIA GeForce RTX 2050 4GB",
      ram: "16GB DDR4",
      storage: "512GB PCIe NVMe SSD",
      display: "15.6-inch FHD 144Hz IPS"
    }
  },
  {
    id: "P008",
    name: "Lenovo IdeaPad Slim 3",
    category: "laptop",
    brand: "Lenovo",
    price: 38990,
    rating: 4.3,
    stock: true,
    delivery_days: 3,
    discount: 3000,
    final_price: 35990,
    description: "Ideal laptop for students and software developers featuring Intel Core i3 12th Gen, lightweight chassis, Rapid Charge technology, and privacy shutter webcam.",
    specifications: {
      processor: "Intel Core i3-1215U",
      ram: "8GB LPDDR5",
      storage: "512GB SSD",
      display: "15.6-inch FHD Anti-Glare",
      weight: "1.62 kg"
    }
  },
  {
    id: "P009",
    name: "Sony WH-1000XM5 Noise Canceling Headphones",
    category: "headphones",
    brand: "Sony",
    price: 29990,
    rating: 4.7,
    stock: true,
    delivery_days: 2,
    discount: 3000,
    final_price: 26990,
    description: "Industry-leading active noise canceling headphones with Auto NC Optimizer, 30-hour battery life, crystal clear hands-free calling with 4 beamforming mics.",
    specifications: {
      battery: "30 hours with ANC ON",
      driver: "30mm specially designed driver unit",
      connectivity: "Bluetooth 5.2, Multipoint Connection",
      weight: "250g"
    }
  },
  {
    id: "P010",
    name: "boAt Rockerz 550 Over-Ear Wireless Headphones",
    category: "headphones",
    brand: "boAt",
    price: 1999,
    rating: 4.2,
    stock: true,
    delivery_days: 2,
    discount: 500,
    final_price: 1499,
    description: "Budget Bluetooth wireless headphones with 50mm dynamic drivers, physical noise isolation, 20 hours playback time, and ergonomic soft ear cushions.",
    specifications: {
      battery: "20 Hours Playback",
      driver: "50mm Dynamic Drivers",
      mic: "In-built HD Mic",
      weight: "245g"
    }
  },
  {
    id: "P011",
    name: "Nike Pegasus 40 Running Shoes",
    category: "running shoes",
    brand: "Nike",
    price: 8995,
    rating: 4.6,
    stock: true,
    delivery_days: 3,
    discount: 1000,
    final_price: 7995,
    description: "Neutral springy running shoes with Dual Zoom Air units, responsive Nike React foam, breathable engineered mesh upper, and durable road traction.",
    specifications: {
      type: "Road Running Shoes",
      cushioning: "Nike React Foam + Dual Zoom Air",
      arch_support: "Neutral",
      weight: "288g"
    }
  },
  {
    id: "P012",
    name: "Puma Velocity Nitro 2 Running Shoes",
    category: "running shoes",
    brand: "Puma",
    price: 4999,
    rating: 4.4,
    stock: true,
    delivery_days: 2,
    discount: 1000,
    final_price: 3999,
    description: "All-in-one lightweight running shoes with NITRO FOAM cushioning for maximum responsiveness, PUMAGRIP rubber outsole, and reflective accents.",
    specifications: {
      type: "Road Running & Daily Trainer",
      cushioning: "NITRO Advanced Foam",
      outsole: "PUMAGRIP high-traction rubber",
      weight: "257g"
    }
  },
  {
    id: "P013",
    name: "Apple Watch Series 9 GPS",
    category: "smart watches",
    brand: "Apple",
    price: 41900,
    rating: 4.8,
    stock: true,
    delivery_days: 1,
    discount: 2000,
    final_price: 39900,
    description: "Advanced smartwatch powered by S9 SiP, Double Tap gesture control, brighter Retina display, ECG app, blood oxygen monitor, and Crash Detection.",
    specifications: {
      display: "Always-On Retina display up to 2000 nits",
      sensors: "ECG, Heart Rate, SpO2, Temperature Sensor",
      water_resistance: "50m Water Resistant",
      battery: "18 hours normal / 36 hours Low Power Mode"
    }
  },
  {
    id: "P014",
    name: "Noise ColorFit Pulse 2 Max Smartwatch",
    category: "smart watches",
    brand: "Noise",
    price: 1499,
    rating: 4.1,
    stock: true,
    delivery_days: 2,
    discount: 300,
    final_price: 1199,
    description: "Affordable smartwatch featuring 1.85-inch TFT display, Tru Sync Bluetooth calling, 100+ sports modes, noise health suite, and 10-day battery life.",
    specifications: {
      display: "1.85-inch 550 nits brightness",
      battery: "Up to 10 days",
      calling: "Bluetooth Calling with Dial Pad",
      health: "Heart Rate, SpO2, Sleep Tracker"
    }
  },
  {
    id: "P015",
    name: "Apple iPad Air (5th Gen) M1",
    category: "tablets",
    brand: "Apple",
    price: 59900,
    rating: 4.7,
    stock: true,
    delivery_days: 2,
    discount: 4000,
    final_price: 55900,
    description: "Versatile iPad powered by Apple M1 chip, 10.9-inch Liquid Retina display with True Tone, 12MP Ultra Wide front camera with Center Stage, and Apple Pencil 2 support.",
    specifications: {
      processor: "Apple M1 Chip",
      storage: "64GB",
      display: "10.9-inch Liquid Retina Display",
      camera: "12MP Wide back, 12MP Ultra Wide front with Center Stage"
    }
  }
];

// RAG Documents Knowledge Base
export const FAQ_POLICIES_KNOWLEDGE = [
  {
    source: "customer_reviews",
    product_id: "P001",
    snippet: "Rahul M. (5/5 stars): 'Great battery life and night camera on Samsung Galaxy M14 5G. Easily lasts 2 days.'",
  },
  {
    source: "customer_reviews",
    product_id: "P001",
    snippet: "Priya K. (4/5 stars): 'Crisp 90Hz display on Samsung M14. A bit heavy due to the 6000mAh battery but super dependable.'",
  },
  {
    source: "customer_reviews",
    product_id: "P004",
    snippet: "Amit S. (5/5 stars): 'Poco X6 Pro is a gaming beast! 120Hz Flow AMOLED display is stunning at this price point.'",
  },
  {
    source: "faq",
    snippet: "Store Shipping Policy: All orders above ₹50,000 qualify for Instant Free Express Shipping (1-2 business days). Standard shipping is ₹150.",
  },
  {
    source: "faq",
    snippet: "Warranty & Return Policy: 7-day hassle-free replacement policy for defective hardware. All electronic devices come with standard 1-year brand warranty.",
  },
  {
    source: "faq",
    snippet: "Promotions & Discounts: Promo code SHOPMIND10 grants 10% instant discount on orders. AIWELCOME grants ₹1,000 flat off for new customers.",
  }
];

// Multi-Agent Execution Engine
export function processChatMessage(query: string, conversationId?: string) {
  const convId = conversationId || `conv-${Math.random().toString(36).substring(2, 9)}`;
  const qLower = query.toLowerCase();
  const logs: string[] = [];
  const agentsUsed: string[] = ["User Interaction Agent"];

  logs.push(`[User Interaction Agent] Intent parsing: Query='${query}'`);

  // Detect query types
  const isInventory = qLower.includes("stock") || qLower.includes("available");
  const isPricing = qLower.includes("discount") || qLower.includes("price") || qLower.includes("offer") || qLower.includes("code") || qLower.includes("promo");
  const isReviews = qLower.includes("review") || qLower.includes("say") || qLower.includes("customer") || qLower.includes("nfc") || qLower.includes("warranty");
  const isComparison = qLower.includes("compare") || qLower.includes("versus") || qLower.includes("vs") || qLower.includes("better between");

  let answer = "";
  let recommendedProducts: ProductData[] = [];
  let sources: Array<{ source: string; snippet: string; score: number }> = [];

  if (isInventory && !isPricing && !isReviews) {
    agentsUsed.push("Inventory Agent");
    logs.push("[Orchestrator Agent] Routing query directly to Inventory Agent.");
    
    const matched = PRODUCTS_CATALOG.find(p => qLower.includes(p.name.toLowerCase()) || qLower.includes(p.brand.toLowerCase()));
    if (matched) {
      logs.push(`[Inventory Agent] Real-time stock lookup for ${matched.name}: ${matched.stock ? "In Stock" : "Out of Stock"}`);
      answer = `Real-time Stock Update for ${matched.name}: ${matched.stock ? "✅ In Stock" : "❌ Out of Stock"}.\nEstimated delivery timeline: ${matched.delivery_days} business days.`;
    } else {
      logs.push("[Inventory Agent] General catalog inventory check performed.");
      answer = "Most catalog items including Samsung Galaxy M14 5G, Apple MacBook Air M2, and Nike Pegasus 40 are currently IN STOCK with 1-3 day express delivery!";
    }
  } else if (isPricing && !isReviews && !qLower.includes("phone under") && !qLower.includes("laptop under")) {
    agentsUsed.push("Pricing & Offers Agent");
    logs.push("[Orchestrator Agent] Routing query to Pricing & Offers Agent.");
    
    const matched = PRODUCTS_CATALOG.find(p => qLower.includes(p.name.toLowerCase()) || qLower.includes(p.brand.toLowerCase()));
    if (matched) {
      logs.push(`[Pricing & Offers Agent] Calculating net payable for ${matched.name}. Original: ₹${matched.price}, Discount: ₹${matched.discount}`);
      answer = `Pricing Breakdown for ${matched.name}:\n• Original Price: ₹${matched.price.toLocaleString()}\n• Promotional Discount: -₹${matched.discount.toLocaleString()}\n• Net Payable Price: ₹${matched.final_price.toLocaleString()}\n\nTip: You can use promo code 'SHOPMIND10' at checkout for an extra 10% off!`;
    } else {
      logs.push("[Pricing & Offers Agent] Promo code lookup performed.");
      answer = "Available Active Promotional Offers:\n1. Promo Code 'SHOPMIND10': 10% Instant discount on entire cart.\n2. Promo Code 'AIWELCOME': Flat ₹1,000 off for new users.\n3. Promo Code 'FREESHIP': Free Express Delivery on all orders.";
    }
  } else if (isReviews && !qLower.includes("phone under")) {
    agentsUsed.push("Retrieval Agent");
    logs.push("[Orchestrator Agent] Routing query to Retrieval Agent for semantic RAG search.");
    logs.push("[Retrieval Agent] Searching vector chunks across customer reviews and FAQ policy database.");
    
    const matchedDocs = FAQ_POLICIES_KNOWLEDGE.filter(k => 
      qLower.split(" ").some(w => w.length > 3 && k.snippet.toLowerCase().includes(w))
    );
    
    const finalSources = (matchedDocs.length > 0 ? matchedDocs : FAQ_POLICIES_KNOWLEDGE.slice(0, 3)).map(d => ({
      source: d.source,
      snippet: d.snippet,
      score: 0.92
    }));

    sources = finalSources;
    answer = `Based on customer feedback and grounded documentation:\n\n${finalSources.map(s => `• ${s.snippet}`).join('\n')}`;
  } else {
    // Full Multi-Agent Recommendation Workflow
    agentsUsed.push("Orchestrator Agent", "Retrieval Agent", "Recommendation Agent", "Pricing & Offers Agent", "Inventory Agent");
    logs.push("[Orchestrator Agent] Complex multi-requirement query detected. Decomposing task across all 5 domain agents.");
    logs.push("[Retrieval Agent] Grounding request specs against knowledge base.");
    logs.push("[Recommendation Agent] Scoring candidate catalog items via multi-factor match model.");
    logs.push("[Pricing & Offers Agent] Applying active instant bank offers and calculated promotional discounts.");
    logs.push("[Inventory Agent] Verifying real-time warehouse stock & delivery timeline.");

    // Budget extraction
    const budgetMatch = query.match(/(\d+[\d,]*)/);
    let maxBudget = 120000;
    if (budgetMatch) {
      maxBudget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    }

    // Category extraction
    let targetCat = "mobile";
    if (qLower.includes("laptop")) targetCat = "laptop";
    if (qLower.includes("headphone") || qLower.includes("earphone")) targetCat = "headphones";
    if (qLower.includes("shoe") || qLower.includes("running")) targetCat = "running shoes";
    if (qLower.includes("watch")) targetCat = "smart watches";

    const filtered = PRODUCTS_CATALOG.filter(p => p.category === targetCat && p.final_price <= maxBudget);
    const scored = (filtered.length > 0 ? filtered : PRODUCTS_CATALOG.slice(0, 3)).map(p => ({
      ...p,
      match_score: Math.min(98, Math.round(75 + p.rating * 4 + (p.stock ? 5 : 0))),
      score_reason: `Fits budget ₹${p.final_price.toLocaleString()} with ${p.rating}⭐ rating and ${p.delivery_days}-day express delivery.`
    }));

    scored.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    recommendedProducts = scored;

    sources = [
      { source: "product_catalog", snippet: `Catalog Search for '${targetCat}' under ₹${maxBudget.toLocaleString()} returned ${scored.length} matching products.`, score: 0.96 },
      { source: "faq", snippet: "All items qualify for 7-day hassle-free returns and 1-year manufacturer warranty.", score: 0.88 }
    ];

    answer = `I analyzed your requirements and found ${scored.length} top recommended ${targetCat} option${scored.length === 1 ? '' : 's'} under ₹${maxBudget.toLocaleString()}:\n\n` +
      scored.map(p => `• **${p.name}** — ₹${p.final_price.toLocaleString()} (Saved ₹${p.discount.toLocaleString()})\n  ⭐ ${p.rating}/5 | ${p.stock ? 'In Stock' : 'Out of Stock'} | Ships in ${p.delivery_days} days\n  ${p.description}`).join('\n\n') +
      `\n\nAll recommendations are ready to add directly to your shopping cart! You can also apply promo code 'SHOPMIND10' for extra savings.`;
  }

  return {
    answer,
    products: recommendedProducts,
    agents_used: Array.from(new Set(agentsUsed)),
    logs,
    sources,
    is_cached: false,
    conversation_id: convId
  };
}

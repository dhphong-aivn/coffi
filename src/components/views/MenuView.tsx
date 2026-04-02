"use client";

import { Search, SlidersHorizontal, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { SIZE_MAP, SUGAR_LEVELS } from "@/data/menu-options";

const CATEGORIES = ["All", "Coffee", "Non Coffee", "Snack", "Dessert"];

const PRODUCTS = [
  {
    id: "p1",
    name: "Macchiato",
    category: "Coffee",
    price: 80000,
    image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=600&auto=format&fit=crop",
    hasSizes: true,
  },
  {
    id: "p2",
    name: "Iced Chocolate",
    category: "Non Coffee",
    price: 150000,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop",
    hasSizes: true,
  },
  {
    id: "p3",
    name: "Cappuccino",
    category: "Coffee",
    price: 95000,
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop",
    hasSizes: true,
  },
  {
    id: "p4",
    name: "Espresso",
    category: "Coffee",
    price: 60000,
    image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?q=80&w=600&auto=format&fit=crop",
    hasSizes: false,
  },
  {
    id: "p5",
    name: "Single-Origin Pour Over",
    category: "Coffee",
    price: 120000,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop",
    hasSizes: false,
  },
  {
    id: "p6",
    name: "Vietnamese Iced Coffee",
    category: "Coffee",
    price: 65000,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=600&auto=format&fit=crop",
    hasSizes: true,
  },
  {
    id: "p7",
    name: "Matcha Latte",
    category: "Non Coffee",
    price: 90000,
    image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=600&auto=format&fit=crop",
    hasSizes: true,
  },
  {
    id: "p8",
    name: "Peach Tea",
    category: "Non Coffee",
    price: 75000,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop",
    hasSizes: true,
  },
  {
    id: "p9",
    name: "Butter Croissant",
    category: "Dessert",
    price: 55000,
    image: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?q=80&w=600&auto=format&fit=crop",
    hasSizes: false,
  },
  {
    id: "p10",
    name: "Cheesecake",
    category: "Dessert",
    price: 85000,
    image: "https://images.unsplash.com/photo-1567171466295-4afa63d45416?q=80&w=600&auto=format&fit=crop",
    hasSizes: false,
  },
  {
    id: "p11",
    name: "Mixed Nuts",
    category: "Snack",
    price: 45000,
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop",
    hasSizes: false,
  },
  {
    id: "p12",
    name: "Potato Wedges",
    category: "Snack",
    price: 70000,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop",
    hasSizes: false,
  },
];

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  hasSizes: boolean;
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("M");
  const [sugar, setSugar] = useState(70);

  const isDrink = product.category === 'Coffee' || product.category === 'Non Coffee';

  const getPrice = () => {
    let base = product.price;
    if (product.hasSizes) {
      if (size === "S") base -= 5000;
      if (size === "L") base += 3000;
    }
    return base;
  };

  const currentPrice = getPrice();

  const handleAddToCart = () => {
    const itemId = [
      product.id,
      product.hasSizes ? size : null,
      isDrink ? `s${sugar}` : null,
    ].filter(Boolean).join('-');

    addItem({
      id: itemId,
      name: product.hasSizes ? `${size} ${product.name}` : product.name,
      price: currentPrice,
      quantity,
      image: product.image,
      type: isDrink ? 'drink' : 'food',
      sugarLevel: isDrink ? sugar : undefined,
    });
    setQuantity(1);
  };

  return (
    <div className="bg-surface-container-lowest p-6 rounded-lg flex flex-col gap-4 shadow-sm hover:shadow-xl transition-shadow duration-500 group">
      <div className="w-full aspect-square overflow-hidden rounded-lg bg-surface-container">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          alt={product.name}
          src={product.image}
        />
      </div>

      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h3 className="font-headline text-xl text-primary-container">{product.name}</h3>
          <p className="text-secondary font-bold font-body text-lg mt-1 tracking-tight">{currentPrice.toLocaleString('vi-VN')} VND</p>
        </div>

        {product.hasSizes && (
          <div className="flex items-center bg-surface-container px-3 py-1 rounded-full gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-primary-container hover:text-secondary cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-bold font-body">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="text-primary-container hover:text-secondary cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Size + Sugar — 2 Column Compact */}
      {isDrink && (
        <div className={product.hasSizes ? "grid grid-cols-2 gap-3" : ""}>
          {product.hasSizes && (
            <div>
              <span className="text-[10px] text-secondary/60 uppercase font-bold font-body tracking-wider block mb-1">Size</span>
              <div className="flex gap-1">
                {SIZE_MAP.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSize(s.key)}
                    title={s.label}
                    className={`flex-1 py-2 text-xs font-bold font-body rounded-full cursor-pointer transition-colors ${
                      size === s.key
                        ? "bg-primary-container text-white"
                        : "bg-surface-container text-secondary"
                    }`}
                  >
                    {s.key}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <span className="text-[10px] text-secondary/60 uppercase font-bold font-body tracking-wider block mb-1">Sugar %</span>
            <div className="flex gap-1">
              {SUGAR_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setSugar(level)}
                  className={`flex-1 py-2 text-xs font-bold font-body rounded-full cursor-pointer transition-colors ${
                    sugar === level
                      ? "bg-primary-container text-white"
                      : "bg-surface-container text-secondary"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        className="w-full py-4 bg-primary-container text-white rounded-xl font-body font-bold hover:bg-primary transition-colors active:scale-95 mt-auto cursor-pointer"
      >
        Add to cart
      </button>
    </div>
  );
}

export function MenuView() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter(
    p => (activeCategory === "All" || p.category === activeCategory) && 
         p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      {/* Search & Filter */}
      <header className="flex items-center gap-6 mb-12">
        <div className="flex-1 flex items-center bg-surface-container-highest px-6 py-4 rounded-xl gap-4 focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
          <Search className="text-secondary" size={24} />
          <input
            className="bg-transparent border-none focus:ring-0 w-full font-body text-sm placeholder:text-secondary/60 outline-none block text-on-surface"
            placeholder="Search your brew..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="bg-primary-container text-white px-8 py-4 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95 cursor-pointer">
          <SlidersHorizontal size={20} />
          <span className="font-body text-sm font-semibold uppercase tracking-wider">
            Filter
          </span>
        </button>
      </header>

      {/* Category Tabs */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-full font-body text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === cat
                ? "bg-primary-container text-white"
                : "bg-surface-container-high text-secondary hover:bg-surface-container-highest"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <h2 className="font-headline text-4xl text-primary-container mb-8">
        {activeCategory === "All" ? "All" : activeCategory} Menu
      </h2>

      {/* Product Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 pb-12">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-secondary">
            No products found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
}

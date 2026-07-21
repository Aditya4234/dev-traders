"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronRight, RotateCcw, CheckCircle, Info } from "lucide-react";
import Image from "next/image";
import { products } from "@/data/mock-data";
import ProductCard from "@/components/ui/ProductCard";

export default function BraFitCalculator() {
  const [step, setStep] = useState<"intro" | "band" | "cup" | "issues" | "result">("intro");
  
  // Inputs
  const [underbust, setUnderbust] = useState<number>(30); // in inches
  const [overbust, setOverbust] = useState<number>(34); // in inches
  const [fitIssues, setFitIssues] = useState<string[]>([]);
  
  // Results
  const [calculatedSize, setCalculatedSize] = useState<string>("");
  const [advice, setAdvice] = useState<string[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<typeof products>([]);

  const handleIssueToggle = (issue: string) => {
    if (fitIssues.includes(issue)) {
      setFitIssues(fitIssues.filter((i) => i !== issue));
    } else {
      setFitIssues([...fitIssues, issue]);
    }
  };

  const calculateSize = () => {
    // 1. Calculate Band Size
    // Standard US/UK method: Add 4 if even, add 5 if odd.
    let bandSize = underbust % 2 === 0 ? underbust + 4 : underbust + 5;
    
    // Clamp band size between 30 and 46 (typical retail sizes)
    if (bandSize < 30) bandSize = 30;
    if (bandSize > 46) bandSize = 46;

    // 2. Calculate Cup Size
    // Difference between overbust and calculated band size
    const diff = Math.round(overbust - bandSize);
    
    const cupSizes = ["AA", "A", "B", "C", "D", "DD", "E", "F", "G", "H"];
    let cupIndex = diff;
    
    // Account for negative differences or out of bounds
    if (cupIndex < 0) cupIndex = 0;
    if (cupIndex >= cupSizes.length) cupIndex = cupSizes.length - 1;
    
    const finalCup = cupSizes[cupIndex];
    const sizeStr = `${bandSize}${finalCup}`;
    setCalculatedSize(sizeStr);

    // 3. Generate personalized Advice
    const recommendations: string[] = [];
    const recommendedCategories: string[] = [];

    if (fitIssues.includes("straps_slip")) {
      recommendations.push("Try adjustable racerback styles or multiway bras to prevent straps from slipping off narrow shoulders.");
      recommendedCategories.push("Wireless Bras");
    }
    if (fitIssues.includes("band_digs")) {
      recommendations.push("Your underband might be too small or worn out. Try going up a band size (e.g., from 34C to 36B) or opt for comfort wireless styles.");
      recommendedCategories.push("Wireless Bras", "Non-Padded Bras");
    }
    if (fitIssues.includes("cup_spill")) {
      recommendations.push("Cup spillage means your cups are too small. Consider trying a cup size larger (e.g. 34C to 34D) or full-coverage designs.");
      recommendedCategories.push("Padded Bras", "Bridal Lingerie");
    }
    if (fitIssues.includes("cup_gap")) {
      recommendations.push("Cup gaps indicate your cups are too large or you need a push-up/contour style to fill out the top of the cups.");
      recommendedCategories.push("Push-Up Bras", "T-Shirt Bras");
    }

    if (recommendations.length === 0) {
      recommendations.push("Everything looks good! Stick with your calculated size and look for styles matching your personal comfort preferences.");
      recommendedCategories.push("Push-Up Bras", "T-Shirt Bras", "Wireless Bras");
    }

    setAdvice(recommendations);

    // 4. Recommend products based on issues and categories
    let filtered = products.filter((p) => 
      recommendedCategories.some(cat => p.category === cat)
    );

    // If no exact match, fallback to any bras
    if (filtered.length === 0) {
      filtered = products.filter((p) => p.category.includes("Bras"));
    }

    setRecommendedProducts(filtered.slice(0, 3));
    setStep("result");
  };

  const resetCalculator = () => {
    setStep("intro");
    setUnderbust(30);
    setOverbust(34);
    setFitIssues([]);
    setCalculatedSize("");
    setAdvice([]);
    setRecommendedProducts([]);
  };

  return (
    <section id="fit-guide" className="bg-soft-pink py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="rounded-3xl bg-white p-8 shadow-xl md:p-12">
          
          <AnimatePresence mode="wait">
            
            {/* Step 1: Introduction */}
            {step === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-rose-gold">
                  Fit Finder
                </span>
                <h2 className="mt-2 font-serif text-3xl font-light text-charcoal sm:text-4xl">
                  Find Your Perfect Size
                </h2>
                <p className="mx-auto mt-4 max-w-lg font-sans text-sm text-muted">
                  Did you know that over 80% of women wear the incorrect bra size? 
                  Take our 60-second interactive fit check to calculate your true Riya Touch size.
                </p>
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setStep("band")}
                    className="flex items-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs font-medium uppercase tracking-widest text-white transition-all duration-300 hover:bg-rose-gold hover:shadow-lg hover:shadow-rose-gold/20"
                  >
                    Start Fit Check
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Underbust (Band) */}
            {step === "band" && (
              <motion.div
                key="band"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-widest text-rose-gold">
                    Step 1 of 3: Underband
                  </span>
                  <span className="text-xs text-muted">Band Measurement</span>
                </div>
                <h3 className="font-serif text-2xl font-light text-charcoal">
                  Measure your Underbust
                </h3>
                <p className="text-sm text-muted">
                  Wrap the tape measure snugly around your ribcage, directly under your bust. Keep the tape parallel to the floor.
                </p>
                
                <div className="rounded-2xl bg-soft-pink/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-charcoal">Underbust Size:</span>
                    <span className="text-lg font-serif font-semibold text-rose-gold">{underbust} inches</span>
                  </div>
                  <input
                    type="range"
                    min="26"
                    max="44"
                    value={underbust}
                    onChange={(e) => setUnderbust(parseInt(e.target.value))}
                    className="w-full accent-rose-gold"
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted">
                    <span>26&quot;</span>
                    <span>30&quot;</span>
                    <span>34&quot;</span>
                    <span>38&quot;</span>
                    <span>42&quot;</span>
                    <span>44&quot;</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-blue-50/50 p-4 text-xs text-blue-700">
                  <Info size={16} className="shrink-0" />
                  <p>Keep your measuring tape snug but comfortable. Don&apos;t pull too tight.</p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep("intro")}
                    className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-charcoal"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("cup")}
                    className="flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:bg-rose-gold"
                  >
                    Next Step
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Overbust (Cup) */}
            {step === "cup" && (
              <motion.div
                key="cup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-widest text-rose-gold">
                    Step 2 of 3: Bust
                  </span>
                  <span className="text-xs text-muted">Cup Measurement</span>
                </div>
                <h3 className="font-serif text-2xl font-light text-charcoal">
                  Measure your Overbust
                </h3>
                <p className="text-sm text-muted">
                  Measure around the fullest part of your bust (usually across the nipples). Keep the tape straight and level, but not too tight.
                </p>

                <div className="rounded-2xl bg-soft-pink/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-charcoal">Full Bust Size:</span>
                    <span className="text-lg font-serif font-semibold text-rose-gold">{overbust} inches</span>
                  </div>
                  <input
                    type="range"
                    min={underbust + 1}
                    max={underbust + 12}
                    value={overbust}
                    onChange={(e) => setOverbust(parseInt(e.target.value))}
                    className="w-full accent-rose-gold"
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted">
                    <span>{underbust + 1}&quot;</span>
                    <span>{underbust + 4}&quot;</span>
                    <span>{underbust + 8}&quot;</span>
                    <span>{underbust + 12}&quot;</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-blue-50/50 p-4 text-xs text-blue-700">
                  <Info size={16} className="shrink-0" />
                  <p>Take a deep breath and let it out. Keep the measuring tape resting lightly against your bust.</p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep("band")}
                    className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-charcoal"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("issues")}
                    className="flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:bg-rose-gold"
                  >
                    Next Step
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Fit Issues Check */}
            {step === "issues" && (
              <motion.div
                key="issues"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-widest text-rose-gold">
                    Step 3 of 3: Fit Problems
                  </span>
                  <span className="text-xs text-muted">Personalized Tuning</span>
                </div>
                <h3 className="font-serif text-2xl font-light text-charcoal">
                  Any current fit complaints?
                </h3>
                <p className="text-sm text-muted">
                  Choose any issue you experience with your current bras. We will use this to fine-tune your recommendations.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: "straps_slip", label: "Straps slip or fall down" },
                    { id: "band_digs", label: "Band digs in or feels tight" },
                    { id: "cup_spill", label: "Cups spill over (top or side)" },
                    { id: "cup_gap", label: "Cups gap or wrinkle" },
                  ].map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => handleIssueToggle(issue.id)}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all duration-200 ${
                        fitIssues.includes(issue.id)
                          ? "border-rose-gold bg-soft-pink/30 text-rose-gold-dark"
                          : "border-soft-pink-dark hover:bg-soft-pink/10 text-charcoal"
                      }`}
                    >
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          fitIssues.includes(issue.id)
                            ? "border-rose-gold bg-rose-gold text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {fitIssues.includes(issue.id) && <span className="text-[10px]">✓</span>}
                      </div>
                      <span>{issue.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep("cup")}
                    className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-charcoal"
                  >
                    Back
                  </button>
                  <button
                    onClick={calculateSize}
                    className="flex items-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs font-medium uppercase tracking-widest text-white transition-all duration-300 hover:bg-rose-gold hover:shadow-lg hover:shadow-rose-gold/20"
                  >
                    Calculate My Fit
                    <CheckCircle size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Result Page */}
            {step === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <span className="text-xs font-semibold uppercase tracking-widest text-rose-gold">
                    Your Personal Fit Profile
                  </span>
                  <p className="mt-4 text-sm text-muted">Based on your measurements, we recommend size:</p>
                  <div className="mt-2 inline-block rounded-3xl bg-soft-pink px-8 py-4">
                    <span className="font-serif text-5xl font-light tracking-wide text-rose-gold">
                      {calculatedSize}
                    </span>
                  </div>
                </div>

                {/* Advice/Tips */}
                <div className="rounded-2xl border border-soft-pink-dark bg-soft-pink/10 p-6 space-y-3">
                  <h4 className="font-serif text-lg font-medium text-charcoal">Fit Advice:</h4>
                  <ul className="list-inside list-disc space-y-2 text-sm text-muted font-sans">
                    {advice.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Product Suggestions */}
                <div className="space-y-4">
                  <h4 className="font-serif text-xl font-light text-charcoal">
                    Recommended Styles for You:
                  </h4>
                  <div className="grid gap-6 sm:grid-cols-3">
                    {recommendedProducts.map((prod) => (
                      <div key={prod.id} className="scale-95 hover:scale-100 transition-transform duration-300">
                        <ProductCard product={prod} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reset button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={resetCalculator}
                    className="flex items-center gap-2 rounded-full border border-charcoal/20 px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-charcoal hover:bg-soft-pink hover:text-rose-gold hover:border-rose-gold transition-all"
                  >
                    <RotateCcw size={14} />
                    Recalculate Size
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

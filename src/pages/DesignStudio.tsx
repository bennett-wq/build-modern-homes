import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Home, Check, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/ui/section";

// Curated color options based on Clayton Middlebury 2025 Decor Book
const sidingColors = [
  { id: "white", name: "Arctic White", color: "#F5F5F5" },
  { id: "gray", name: "Coastal Gray", color: "#6B7280" },
  { id: "charcoal", name: "Iron Ore", color: "#374151" },
  { id: "navy", name: "Naval Blue", color: "#1E3A5F" },
  { id: "sage", name: "Sage Green", color: "#6B8E6B" },
];

const shingleColors = [
  { id: "charcoal", name: "Charcoal", color: "#2D3748" },
  { id: "weathered", name: "Weathered Wood", color: "#5D4E3C" },
  { id: "black", name: "Onyx Black", color: "#1A1A1A" },
  { id: "gray", name: "Estate Gray", color: "#4A5568" },
];

const trimColors = [
  { id: "white", name: "Bright White", color: "#FFFFFF" },
  { id: "black", name: "Tricorn Black", color: "#1A1A1A" },
  { id: "bronze", name: "Bronze", color: "#5C4A3D" },
  { id: "gray", name: "Dovetail Gray", color: "#8B8B8B" },
];

const shutterColors = [
  { id: "none", name: "No Shutters", color: "transparent" },
  { id: "black", name: "Black", color: "#1A1A1A" },
  { id: "navy", name: "Naval", color: "#1E3A5F" },
  { id: "brown", name: "Van Dyke Brown", color: "#4A3728" },
  { id: "wood", name: "Natural Wood", color: "#8B6914" },
];

const garageStyles = [
  { id: "traditional", name: "Traditional Raised Panel", image: "traditional" },
  { id: "carriage", name: "Carriage House", image: "carriage" },
  { id: "modern", name: "Modern Flush", image: "modern" },
  { id: "glass", name: "Contemporary Glass", image: "glass" },
];

interface Selection {
  siding: string;
  shingles: string;
  trim: string;
  shutters: string;
  garage: string;
}

const defaultSelection: Selection = {
  siding: "white",
  shingles: "charcoal",
  trim: "white",
  shutters: "black",
  garage: "traditional",
};

const DesignStudio = () => {
  const [selection, setSelection] = useState<Selection>(defaultSelection);
  const [activeTab, setActiveTab] = useState("siding");

  const getColorById = (list: typeof sidingColors, id: string) => 
    list.find(item => item.id === id) || list[0];

  const selectedSiding = getColorById(sidingColors, selection.siding);
  const selectedShingles = getColorById(shingleColors, selection.shingles);
  const selectedTrim = getColorById(trimColors, selection.trim);
  const selectedShutters = getColorById(shutterColors, selection.shutters);
  const selectedGarage = garageStyles.find(g => g.id === selection.garage) || garageStyles[0];

  const handleReset = () => setSelection(defaultSelection);

  const ColorSwatch = ({ 
    item, 
    isSelected, 
    onClick 
  }: { 
    item: typeof sidingColors[0]; 
    isSelected: boolean; 
    onClick: () => void;
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative p-1 rounded-xl transition-all ${
        isSelected ? "ring-2 ring-wood ring-offset-2" : "hover:ring-2 hover:ring-charcoal/20"
      }`}
    >
      <div 
        className="w-16 h-16 rounded-lg shadow-md border border-black/10"
        style={{ backgroundColor: item.color === "transparent" ? "#E5E7EB" : item.color }}
      >
        {item.color === "transparent" && (
          <div className="w-full h-full flex items-center justify-center text-charcoal/50">
            <span className="text-xs">None</span>
          </div>
        )}
      </div>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-wood rounded-full flex items-center justify-center"
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}
      <p className="text-xs text-center mt-2 text-charcoal/80 font-medium">{item.name}</p>
    </motion.button>
  );

  const GarageOption = ({
    item,
    isSelected,
    onClick,
  }: {
    item: typeof garageStyles[0];
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-3 rounded-xl border-2 transition-all ${
        isSelected ? "border-wood bg-wood/5" : "border-charcoal/10 hover:border-charcoal/30"
      }`}
    >
      <div className="aspect-[3/2] bg-charcoal/10 rounded-lg mb-3 flex items-center justify-center">
        <div 
          className="w-full h-full rounded-lg"
          style={{
            backgroundColor: item.id === "glass" ? "#2D3748" : "#4A5568",
            backgroundImage: item.id === "glass" 
              ? "repeating-linear-gradient(0deg, transparent, transparent 20%, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.3) 25%)"
              : item.id === "carriage"
              ? "linear-gradient(180deg, #5C4A3D 0%, #4A3728 100%)"
              : item.id === "modern"
              ? "linear-gradient(180deg, #6B7280 0%, #4B5563 100%)"
              : "repeating-linear-gradient(180deg, #4A5568, #4A5568 15%, #374151 15%, #374151 17%)"
          }}
        />
      </div>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 bg-wood rounded-full flex items-center justify-center"
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}
      <p className="text-sm font-medium text-charcoal">{item.name}</p>
    </motion.button>
  );

  return (
    <Layout>
      {/* Header */}
      <Section className="bg-charcoal pt-32 pb-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 text-wood font-medium tracking-wider uppercase text-sm mb-4">
              <Palette className="w-4 h-4" />
              Exterior Design Studio
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Design Your Perfect Exterior
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Select from curated options inspired by the Clayton Middlebury 2025 Decor Book. 
              Visualize your home's exterior in real-time.
            </p>
          </motion.div>
        </div>
      </Section>

      <Section className="bg-cream py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-charcoal text-white">
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* SVG Home Illustration that updates based on selections */}
                <div className="aspect-[16/10] bg-gradient-to-b from-sky-200 to-sky-100 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.svg
                      key={JSON.stringify(selection)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      viewBox="0 0 800 500"
                      className="w-full h-full"
                    >
                      {/* Ground */}
                      <rect x="0" y="400" width="800" height="100" fill="#4ADE80" />
                      <rect x="0" y="400" width="800" height="10" fill="#22C55E" />
                      
                      {/* Driveway */}
                      <path d="M 450 500 L 500 400 L 650 400 L 700 500 Z" fill="#9CA3AF" />
                      
                      {/* Main House Body */}
                      <rect 
                        x="100" 
                        y="220" 
                        width="350" 
                        height="180" 
                        fill={selectedSiding.color}
                        stroke={selectedTrim.color}
                        strokeWidth="4"
                      />
                      
                      {/* Garage */}
                      <rect 
                        x="450" 
                        y="250" 
                        width="200" 
                        height="150" 
                        fill={selectedSiding.color}
                        stroke={selectedTrim.color}
                        strokeWidth="4"
                      />
                      
                      {/* Main Roof */}
                      <polygon 
                        points="80,220 275,100 470,220" 
                        fill={selectedShingles.color}
                      />
                      <line x1="80" y1="220" x2="275" y2="100" stroke={selectedTrim.color} strokeWidth="4" />
                      <line x1="275" y1="100" x2="470" y2="220" stroke={selectedTrim.color} strokeWidth="4" />
                      
                      {/* Garage Roof */}
                      <polygon 
                        points="430,250 550,170 670,250" 
                        fill={selectedShingles.color}
                      />
                      <line x1="430" y1="250" x2="550" y2="170" stroke={selectedTrim.color} strokeWidth="3" />
                      <line x1="550" y1="170" x2="670" y2="250" stroke={selectedTrim.color} strokeWidth="3" />
                      
                      {/* Porch */}
                      <rect x="200" y="300" width="150" height="100" fill={selectedSiding.color} fillOpacity="0.9" />
                      <rect x="200" y="390" width="150" height="10" fill="#8B7355" />
                      
                      {/* Porch Columns */}
                      <rect x="205" y="300" width="10" height="100" fill={selectedTrim.color} />
                      <rect x="335" y="300" width="10" height="100" fill={selectedTrim.color} />
                      
                      {/* Porch Roof */}
                      <polygon 
                        points="180,300 275,260 370,300" 
                        fill={selectedShingles.color}
                      />
                      
                      {/* Windows - Main House */}
                      <rect x="130" y="270" width="50" height="60" fill="#87CEEB" stroke={selectedTrim.color} strokeWidth="4" />
                      <line x1="155" y1="270" x2="155" y2="330" stroke={selectedTrim.color} strokeWidth="2" />
                      <line x1="130" y1="300" x2="180" y2="300" stroke={selectedTrim.color} strokeWidth="2" />
                      
                      <rect x="380" y="270" width="50" height="60" fill="#87CEEB" stroke={selectedTrim.color} strokeWidth="4" />
                      <line x1="405" y1="270" x2="405" y2="330" stroke={selectedTrim.color} strokeWidth="2" />
                      <line x1="380" y1="300" x2="430" y2="300" stroke={selectedTrim.color} strokeWidth="2" />
                      
                      {/* Porch Windows */}
                      <rect x="230" y="310" width="90" height="50" fill="#87CEEB" stroke={selectedTrim.color} strokeWidth="4" />
                      <line x1="275" y1="310" x2="275" y2="360" stroke={selectedTrim.color} strokeWidth="2" />
                      
                      {/* Shutters */}
                      {selection.shutters !== "none" && (
                        <>
                          <rect x="115" y="268" width="12" height="64" fill={selectedShutters.color} />
                          <rect x="183" y="268" width="12" height="64" fill={selectedShutters.color} />
                          <rect x="365" y="268" width="12" height="64" fill={selectedShutters.color} />
                          <rect x="433" y="268" width="12" height="64" fill={selectedShutters.color} />
                        </>
                      )}
                      
                      {/* Door */}
                      <rect x="255" y="330" width="40" height="70" fill={selectedTrim.color === "#FFFFFF" ? "#4A3728" : selectedTrim.color} />
                      <circle cx="287" cy="365" r="3" fill="#D4AF37" />
                      
                      {/* Garage Door */}
                      <rect 
                        x="475" 
                        y="290" 
                        width="150" 
                        height="110" 
                        fill={selection.garage === "glass" ? "#374151" : "#4A5568"}
                        stroke={selectedTrim.color}
                        strokeWidth="3"
                      />
                      {/* Garage Door Details based on style */}
                      {selection.garage === "traditional" && (
                        <>
                          <line x1="475" y1="317" x2="625" y2="317" stroke="#374151" strokeWidth="2" />
                          <line x1="475" y1="345" x2="625" y2="345" stroke="#374151" strokeWidth="2" />
                          <line x1="475" y1="372" x2="625" y2="372" stroke="#374151" strokeWidth="2" />
                        </>
                      )}
                      {selection.garage === "carriage" && (
                        <>
                          <line x1="550" y1="290" x2="550" y2="400" stroke="#374151" strokeWidth="3" />
                          <rect x="490" y="305" width="30" height="20" fill="#87CEEB" stroke="#374151" strokeWidth="2" />
                          <rect x="580" y="305" width="30" height="20" fill="#87CEEB" stroke="#374151" strokeWidth="2" />
                        </>
                      )}
                      {selection.garage === "glass" && (
                        <>
                          <line x1="475" y1="317" x2="625" y2="317" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                          <line x1="475" y1="345" x2="625" y2="345" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                          <line x1="475" y1="372" x2="625" y2="372" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                          <line x1="510" y1="290" x2="510" y2="400" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                          <line x1="550" y1="290" x2="550" y2="400" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                          <line x1="590" y1="290" x2="590" y2="400" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                        </>
                      )}
                      {selection.garage === "modern" && (
                        <>
                          <line x1="475" y1="325" x2="625" y2="325" stroke="#374151" strokeWidth="1" />
                          <line x1="475" y1="360" x2="625" y2="360" stroke="#374151" strokeWidth="1" />
                        </>
                      )}
                      
                      {/* Wood Accent on Porch */}
                      <rect x="200" y="295" width="150" height="5" fill="#8B6914" />
                    </motion.svg>
                  </AnimatePresence>
                </div>
                
                {/* Selection Summary */}
                <div className="p-4 bg-charcoal/5 border-t">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-medium">
                      <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: selectedSiding.color }} />
                      {selectedSiding.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-medium">
                      <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: selectedShingles.color }} />
                      {selectedShingles.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-medium">
                      <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: selectedTrim.color }} />
                      {selectedTrim.name} Trim
                    </span>
                    {selection.shutters !== "none" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-medium">
                        <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: selectedShutters.color }} />
                        {selectedShutters.name} Shutters
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-medium">
                      {selectedGarage.name}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="mt-4 p-4 bg-wood/10 rounded-xl border border-wood/20">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-wood flex-shrink-0 mt-0.5" />
                <p className="text-sm text-charcoal/80">
                  <strong>Visual preview only.</strong> Final selections subject to confirmation. 
                  Colors may vary based on screen settings and actual materials.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Selection Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Customize Your Exterior</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-5 mb-6">
                    <TabsTrigger value="siding">Siding</TabsTrigger>
                    <TabsTrigger value="shingles">Roof</TabsTrigger>
                    <TabsTrigger value="trim">Trim</TabsTrigger>
                    <TabsTrigger value="shutters">Shutters</TabsTrigger>
                    <TabsTrigger value="garage">Garage</TabsTrigger>
                  </TabsList>

                  <TabsContent value="siding" className="mt-0">
                    <div className="space-y-4">
                      <p className="text-sm text-charcoal/70">
                        Select your main siding color. This sets the tone for your home's exterior.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {sidingColors.map((color) => (
                          <ColorSwatch
                            key={color.id}
                            item={color}
                            isSelected={selection.siding === color.id}
                            onClick={() => setSelection({ ...selection, siding: color.id })}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="shingles" className="mt-0">
                    <div className="space-y-4">
                      <p className="text-sm text-charcoal/70">
                        Choose your roof shingle color. Darker tones create contrast, while matching tones create harmony.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {shingleColors.map((color) => (
                          <ColorSwatch
                            key={color.id}
                            item={color}
                            isSelected={selection.shingles === color.id}
                            onClick={() => setSelection({ ...selection, shingles: color.id })}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="trim" className="mt-0">
                    <div className="space-y-4">
                      <p className="text-sm text-charcoal/70">
                        Window and door trim color. This accent color frames your windows and adds definition.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {trimColors.map((color) => (
                          <ColorSwatch
                            key={color.id}
                            item={color}
                            isSelected={selection.trim === color.id}
                            onClick={() => setSelection({ ...selection, trim: color.id })}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="shutters" className="mt-0">
                    <div className="space-y-4">
                      <p className="text-sm text-charcoal/70">
                        Optional decorative shutters. Add character with a contrasting color or skip them for a cleaner look.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {shutterColors.map((color) => (
                          <ColorSwatch
                            key={color.id}
                            item={color}
                            isSelected={selection.shutters === color.id}
                            onClick={() => setSelection({ ...selection, shutters: color.id })}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="garage" className="mt-0">
                    <div className="space-y-4">
                      <p className="text-sm text-charcoal/70">
                        Select your garage door style. This is a key design element that significantly impacts curb appeal.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {garageStyles.map((style) => (
                          <GarageOption
                            key={style.id}
                            item={style}
                            isSelected={selection.garage === style.id}
                            onClick={() => setSelection({ ...selection, garage: style.id })}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-charcoal mb-3">Ready to move forward?</h3>
                <p className="text-sm text-charcoal/70 mb-4">
                  Save your selections and schedule a call with our team to discuss pricing and availability.
                </p>
                <div className="flex gap-3">
                  <Button className="bg-wood hover:bg-wood-dark text-white flex-1">
                    Schedule a Call
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        Save Selections
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Coming soon: Save and share your design</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Section>
    </Layout>
  );
};

export default DesignStudio;

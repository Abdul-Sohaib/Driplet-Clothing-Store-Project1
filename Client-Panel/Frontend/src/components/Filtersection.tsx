import { useState, useMemo, useCallback, type JSX } from "react";
import { VscChecklist } from "react-icons/vsc";

interface Product {
  id: string | number;
  name: string;
  description: string;
  category: string;
  color: string;
  fabric: string;
  gender: "Men" | "Women" | "Unisex";
  variants: {
    price: number;
    imageUrls: string[];
    sizes: { size: string; stock: number }[];
  }[];
}

interface Filters {
  sizes: string[];
  priceRange: [number, number];
  colors: string[];
  fabrics: string[];
  stock: "in" | "out" | "all";
  gender: string[];
}

interface FilterSectionProps {
  products: Product[];
  renderProducts: (filteredProducts: Product[], isFilterVisible: boolean) => JSX.Element;

}

const FilterSection: React.FC<FilterSectionProps> = ({ products, renderProducts }) => {
  const [filters, setFilters] = useState<Filters>({
    sizes: [],
    priceRange: [0, 10000],
    colors: [],
    fabrics: [],
    stock: "all",
    gender: [],
  });

  const [isFilterVisible, setIsFilterVisible] = useState(true); // New state to toggle filter visibility

  const availableSizes = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((p) => p.variants.flatMap((v) => v.sizes.map((s) => s.size))))
      ).sort(),
    [products]
  );

  const availableColors = useMemo(
    () => Array.from(new Set(products.map((p) => p.color))).sort(),
    [products]
  );

  const availableFabrics = useMemo(
    () => Array.from(new Set(products.map((p) => p.fabric))).sort(),
    [products]
  );

  const availableGenders = useMemo(
    () => Array.from(new Set(products.map((p) => p.gender))).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const { sizes, priceRange, colors, fabrics, stock, gender } = filters;

      const hasSelectedSize =
        sizes.length === 0 ||
        product.variants.some((variant) =>
          variant.sizes.some((s) => sizes.includes(s.size) && s.stock > 0)
        );

      const withinPriceRange = product.variants.some(
        (variant) => variant.price >= priceRange[0] && variant.price <= priceRange[1]
      );

      const matchesColor = colors.length === 0 || colors.includes(product.color);
      const matchesFabric = fabrics.length === 0 || fabrics.includes(product.fabric);
      const matchesGender = gender.length === 0 || gender.includes(product.gender);

      const totalStock = product.variants.reduce(
        (total, variant) => total + variant.sizes.reduce((sum, s) => sum + s.stock, 0),
        0
      );
      const matchesStock =
        stock === "all" || (stock === "in" && totalStock > 0) || (stock === "out" && totalStock === 0);

      return (
        hasSelectedSize && withinPriceRange && matchesColor && matchesFabric && matchesStock && matchesGender
      );
    });
  }, [products, filters]);

  const toggleFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K] extends string[] ? string : never) => {
      setFilters((prev) => {
        if (Array.isArray(prev[key])) {
          const current = prev[key] as string[];
          return {
            ...prev,
            [key]: current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          };
        }
        return prev;
      });
    },
    []
  );

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
    const value = Number(e.target.value);
    setFilters((prev) => ({
      ...prev,
      priceRange: index === 0 ? [value, prev.priceRange[1]] : [prev.priceRange[0], value],
    }));
  }, []);

  const handleStockChange = useCallback((value: Filters["stock"]) => {
    setFilters((prev) => ({ ...prev, stock: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      sizes: [],
      priceRange: [0, 10000],
      colors: [],
      fabrics: [],
      stock: "all",
      gender: [],
    });
  }, []);

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prev) => !prev);
  };

  return (
    <div className="max-w-screen navfonts">
      {/* Toggle Button */}
      <button
        className="mb-3 sm:mb-4 relative group bg-transparent outline-none cursor-pointer uppercase ml-1 sm:ml-2 navfonts"
        onClick={toggleFilterVisibility}
      >
        <span
    className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-[250ms] group-active:translate-y-px "
  ></span>
  <div
    className="relative flex items-center justify-between py-2 sm:py-3 px-4 sm:px-6 text-base sm:text-lg text-black rounded-lg transform -translate-y-1 bg-white gap-2 sm:gap-3 transition duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-[250ms] group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700"
  >
  <VscChecklist className="w-4 sm:w-5" />
    <span className="select-none text-xs navfonts font-semibold">{isFilterVisible ? "Hide Filters" : "Show Filters"}</span>
  </div>
        
      </button>

      <div className="flex flex-col lg:flex-row gap-2">
        {/* Filter Sidebar */}
        {isFilterVisible && (
          <div className="w-full lg:w-1/4 p-3 sm:p-4 rounded-lg shadow-[0_4px_16px_rgba(128,90,213,0.3)] backdrop-blur-md border-2 border-purple-200 h-fit bg-transparent gap-5 sm:gap-7 flex flex-col">
            <div className="flex justify-between items-center mb-2 sm:mb-3 border-b-2 border-black">
              <h2 className="text-xl sm:text-2xl font-semibold textheading tracking-wide">Filters</h2>
              <button
                className="text-xs sm:text-sm text-[#fbca1f] hover:text-purple-800 font-bold navfonts cursor-pointer"
                onClick={resetFilters}
              >
                Reset All
              </button>
            </div>

            <div className="mb-3 sm:mb-4">
              <h3 className="textheading text-base sm:text-lg tracking-wider font-semibold mb-2">Size</h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {availableSizes.map((size) => (
                  <label key={size} className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <input
                      type="checkbox"
                      checked={filters.sizes.includes(size)}
                      onChange={() => toggleFilter("sizes", size)}
                      className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600"
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <h3 className="textheading text-base sm:text-lg tracking-wider font-semibold mb-2">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs sm:text-sm mt-2">
                <span>₹{filters.priceRange[0]}</span>
                <span>₹{filters.priceRange[1]}</span>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <h3 className="textheading text-base sm:text-lg tracking-wider font-semibold mb-2">Color</h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {availableColors.map((color) => (
                  <label key={color} className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <input
                      type="checkbox"
                      checked={filters.colors.includes(color)}
                      onChange={() => toggleFilter("colors", color)}
                      className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600"
                    />
                    <span>{color}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <h3 className="textheading text-base sm:text-lg tracking-wider font-semibold mb-2">Fabric</h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {availableFabrics.map((fabric) => (
                  <label key={fabric} className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <input
                      type="checkbox"
                      checked={filters.fabrics.includes(fabric)}
                      onChange={() => toggleFilter("fabrics", fabric)}
                      className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600"
                    />
                    <span>{fabric}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <h3 className="textheading text-base sm:text-lg tracking-wider font-semibold mb-2">Stock Status</h3>
              <div className="flex flex-col gap-1 sm:gap-2">
                <label className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                  <input
                    type="radio"
                    name="stock"
                    checked={filters.stock === "all"}
                    onChange={() => handleStockChange("all")}
                    className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600"
                  />
                  <span>All</span>
                </label>
                <label className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                  <input
                    type="radio"
                    name="stock"
                    checked={filters.stock === "in"}
                    onChange={() => handleStockChange("in")}
                    className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600"
                  />
                  <span>In Stock</span>
                </label>
                <label className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                  <input
                    type="radio"
                    name="stock"
                    checked={filters.stock === "out"}
                    onChange={() => handleStockChange("out")}
                    className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600"
                  />
                  <span>Out of Stock</span>
                </label>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <h3 className="textheading text-base sm:text-lg tracking-wider font-semibold mb-2">Gender</h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {availableGenders.map((gender) => (
                  <label key={gender} className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <input
                      type="checkbox"
                      checked={filters.gender.includes(gender)}
                      onChange={() => toggleFilter("gender", gender)}
                      className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600"
                    />
                    <span>{gender}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Display */}
        <div className="max-w-full flex justify-center w-full lg:w-full">{renderProducts(filteredProducts ,isFilterVisible)}</div>
      </div>
    </div>
  );
};

export default FilterSection;
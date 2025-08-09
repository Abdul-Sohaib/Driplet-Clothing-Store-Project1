/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";
import gsap from "gsap";
import axios from "axios";
import image from "../assets/image.png";
import Loading from "../components/Loading";
import { toast } from "react-toastify";
import cartgif from '@/assets/load.gif';
import wishlistlike from '@/assets/wishlist.png';
import Reviews from "../components/Reviews";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Category {
  id: number;
  name: string;
  ID: string;
  parent?: string;
  gender?: string;
  clothingType?: string;
  description?: string;
  imageUrl?: string;
}

interface Product {
  id: string | number;
  name: string;
  description: string;
  category: string;
  color: string;
  fabric: string;
  gender: "Men" | "Women" | "Unisex";
  fitType: string;
  neckType: string;
  pattern: string;
  variants: {
    price: number;
    imageUrls: string[];
    sizes: { size: string; stock: number }[];
  }[];
}

interface ProductCardProps {
  products?: Product[];
}

const ProductCard: React.FC<ProductCardProps> = ({ products: initialProducts }) => {
  const { id, categoryId } = useParams<{ id: string; categoryId?: string }>();
  const navigate = useNavigate();
  const imageIndex = useRef(0);
  const imageRefs = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const direction = useRef<"forward" | "backward">("forward");
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string | null>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE}/categories`, {
          withCredentials: true,
        });
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", (err as any).response?.data?.message || (err as any).message);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryId) {
      setLoading(true);
      setError(null);
      const fetchCategoryProducts = async () => {
        try {
          console.log(`Fetching products for categoryId: ${categoryId}`);
          const response = await axios.get(`${API_BASE}/products?category=${categoryId}`, {
            withCredentials: true,
          });
          if (response.data.length === 0) {
            const fallbackResponse = await axios.get(`${API_BASE}/products?categoryId=${categoryId}`, {
              withCredentials: true,
            });
            setProducts(fallbackResponse.data);
            console.log(`Fetched ${fallbackResponse.data.length} products using categoryId`, fallbackResponse.data);
          } else {
            setProducts(response.data);
            console.log(`Fetched ${response.data.length} products using category`, response.data);
          }
        } catch (err) {
          console.error("Error fetching category products:", (err as any).response?.data?.message || (err as any).message);
          setError("Failed to load products for this category.");
          setProducts([]);
        } finally {
          setLoading(false);
        }
      };
      fetchCategoryProducts();
    }
  }, [categoryId]);

  const product = id ? products.find((p) => p.id.toString() === id) : null;

  const images = useMemo(
    () => (product ? product.variants[selectedVariant]?.imageUrls || [] : []),
    [product, selectedVariant]
  );
  const totalStock = product?.variants.reduce(
    (total, variant) => total + variant.sizes.reduce((sum, s) => sum + s.stock, 0),
    0
  ) || 0;

  const categoryName = categories.find((cat) => cat.ID === (product?.category || categoryId))?.name || (product?.category || categoryId) || "Unknown";

  const similarProducts = product && id ? products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4) : [];

  useEffect(() => {
    console.log("Similar products:", similarProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      imageUrls: p.variants[0]?.imageUrls || []
    })));
  }, [similarProducts]);

  useEffect(() => {
    if (images.length <= 1) return;

    timer.current = setInterval(() => {
      if (!imageRefs.current) return;

      let current = imageIndex.current;

      if (direction.current === "forward") {
        current += 1;
        if (current >= images.length - 1) {
          direction.current = "backward";
        }
      } else {
        current -= 1;
        if (current <= 0) {
          direction.current = "forward";
        }
      }

      imageIndex.current = current;

      gsap.to(imageRefs.current, {
        x: `-${current * 100}%`,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }, 2000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [images]);

  // Reset selectedSize when selectedVariant changes in single-product view
  useEffect(() => {
    if (product) {
      setSelectedSizes((prev) => ({ ...prev, [product.id]: null }));
    }
  }, [selectedVariant, product]);

  const handleAddToCart = async (productId: string | number, size: string) => {
    if (isAddingToCart) return;
    setIsAddingToCart(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const res = await axios.post(
        `${API_BASE}/cart`,
        { productId, quantity: 1, size },
        { withCredentials: true }
      );
      console.log(`Added product ${productId} (size: ${size}) to cart`, res.data);
      toast.success("Added to cart!");
    } catch (err) {
      console.error("Add to cart error:", (err as any).response?.data?.message || (err as any).message);
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (productId: string | number, size: string) => {
    if (isAddingToWishlist) return;
    setIsAddingToWishlist(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const res = await axios.post(
        `${API_BASE}/wishlist`,
        { productId, quantity: 1, size },
        { withCredentials: true }
      );
      console.log(`Added product ${productId} (size: ${size}) to wishlist`, res.data);
      toast.success("Added to wishlist!");
    } catch (err) {
      console.error("Add to wishlist error:", (err as any).response?.data?.message || (err as any).message);
      toast.error("Failed to add item to wishlist. Please try again.");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (!product && id) {
    return <div className="text-center text-gray-600">Product not found.</div>;
  }

  const price = product?.variants[selectedVariant]?.price || 0;
  const mrp = price + 650;
  const discount = Math.floor(((mrp - price) / mrp) * 100);

  return (
    <div className="flex flex-col gap-3 justify-center inset-0 bg-[#F5F5DC] items-center w-screen px-10">
      <div className="flex w-screen mt-12 justify-center items-center">
        <button
          onClick={() => navigate("/")}
          className="relative flex w-fit right-[41vw] group bg-transparent outline-none cursor-pointer uppercase"
        >
          <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
          <div className="relative flex items-center justify-between py-3 px-6 text-lg text-black rounded-lg transform -translate-y-1 bg-white gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 -ml-1 transition duration-250 group-hover:-translate-x-1">
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              />
            </svg>
            <span className="select-none text-xs navfonts font-semibold">Back to Home</span>
          </div>
        </button>
      </div>

      {categoryId ? (
        <div className="w-full mt-6">
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-black navfonts mb-6 text-center">Products in {categoryName}</h2>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                  {products.map((prod) => {
                    const prodImages = prod.variants[0]?.imageUrls || [];
                    const prodPrice = prod.variants[0]?.price || 0;
                    const prodMrp = prodPrice + 650;
                    const prodDiscount = Math.floor(((prodMrp - prodPrice) / prodMrp) * 100);
                    const prodTotalStock = prod.variants.reduce(
                      (total, variant) => total + variant.sizes.reduce((sum, s) => sum + s.stock, 0),
                      0
                    );

                    return (
                      <div
                        key={prod.id}
                        className="group border-2 border-[#101A13] rounded-xl bg-[#DADAD0] shadow-md hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer h-fit"
                        onClick={() => navigate(`/product/${prod.id}`)}
                      >
                        {prodImages.length > 0 ? (
                          <div className="w-full h-[60vh] overflow-hidden">
                            <div className="flex h-[60vh]">
                              {prodImages.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={`img-${i}`}
                                  className="h-full object-cover flex-shrink-0 p-1"
                                  loading="lazy"
                                  onError={() => console.error(`Failed to load image: ${img} for product ${prod.name}`)}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-[60vh] overflow-hidden flex items-center justify-center bg-gray-200">
                            <span className="text-gray-600 font-semibold">No Image Available</span>
                          </div>
                        )}
                        <div className="flex justify-between px-3 py-2 text-sm items-center">
                          <div className="flex items-center gap-1 text-orange-500">
                            <AiFillStar className="text-[14px]" />
                            4.5 <span className="text-gray-600 ml-1">(241)</span>
                          </div>
                          <div className="text-xs border-2 border-[#101A13] px-2 py-1 rounded-md text-purple-600 font-bold">
                            {prodTotalStock} left
                          </div>
                        </div>
                        <div className="px-3 flex gap-2 items-center">
                          <p className="text-lg font-semibold text-black">₹{prodPrice}</p>
                          <p className="text-sm line-through text-gray-500">₹{prodMrp}</p>
                          <p className="text-sm text-green-600 font-semibold">{prodDiscount}% OFF</p>
                        </div>
                        <div className="px-3 py-1 text-sm text-black font-semibold line-clamp-2">
                          {prod.name}
                        </div>
                        <div className="mx-3 mb-3">
                          <div className="flex gap-2 flex-wrap mb-2">
                            {prod.variants[0]?.sizes.map((size, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (size.stock > 0) {
                                    setSelectedSizes({ ...selectedSizes, [prod.id]: size.size });
                                  }
                                }}
                                className={`px-3 py-1 border-2 rounded-md text-sm font-semibold navfonts uppercase cursor-pointer ${
                                  selectedSizes[prod.id] === size.size
                                    ? "border-[#101A13] bg-purple-100 text-purple-600"
                                    : size.stock > 0
                                    ? "border-purple-300 text-black hover:bg-purple-50"
                                    : "border-gray-300 text-gray-400 cursor-not-allowed"
                                }`}
                                disabled={size.stock === 0}
                              >
                                {size.size}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 border border-[#101A13] rounded-md overflow-hidden">
                            <button
                              className="text-sm font-semibold py-2 px-4 text-black hover:bg-white transition navfonts cursor-pointer border-r border-[#101A13] disabled:opacity-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedSizes[prod.id]) handleAddToCart(prod.id, selectedSizes[prod.id]!);
                                else toast.error("Please select a size before adding to cart.");
                              }}
                              disabled={isAddingToCart || !selectedSizes[prod.id]}
                            >
                              {isAddingToCart ? "Adding..." : "ADD TO CART"}
                            </button>
                            <button
                              className="text-sm font-semibold py-2 px-4 text-black hover:bg-white transition navfonts cursor-pointer uppercase flex justify-center items-center gap-2 disabled:opacity-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedSizes[prod.id]) handleAddToWishlist(prod.id, selectedSizes[prod.id]!);
                                else toast.error("Please select a size before adding to wishlist.");
                              }}
                              disabled={isAddingToWishlist || !selectedSizes[prod.id]}
                            >
                              {isAddingToWishlist ? <img src={wishlistlike} alt="" className="w-5" /> : "Add to wishlist"}
                              <img src={wishlistlike} alt="" className="w-8" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-600">No products available in this category.</div>
              )}
            </>
          )}
        </div>
      ) : product ? (
        <div className="flex flex-col w-fit px-2">
          <div className="flex flex-col md:flex-row justify-between items-start mt-6">
            <div className="flex justify-between w-full">
            <div className="md:w-[35vw] rounded-3xl">
              {images.length > 0 ? (
                <div className="w-full overflow-hidden">
                  <div
                    className="flex h-fit w-full"
                    ref={(el) => {
                      imageRefs.current = el;
                    }}
                  >
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`img-${i}`}
                        className="w-full  object-center object-cover flex-shrink-0 p-0.5 rounded-2xl border-3 border-yellow-500"
                       
                        loading="lazy"
                        onError={() => console.error(`Failed to load image: ${img} for product ${product.name}`)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full h-fit overflow-hidden rounded-2xl border-3 border-[#101A13] flex items-center justify-center bg-gray-200">
                  <span className="text-gray-600 font-semibold">No Image Available</span>
                </div>
              )}
            </div>

            <div className="md:w-1/2 flex flex-col gap-9">
              <h1 className="text-3xl font-semibold text-black tracking-wider navheading uppercase">{product.name}</h1>
              <div className="flex items-center gap-40">
                <div className="flex gap-3 items-center tracking-wider navheading">
                  <p className="text-2xl font-bold text-black">₹{price}</p>
                  <p className="text-base line-through text-gray-500">₹{mrp}</p>
                  <p className="text-base text-green-600 font-semibold">{discount}% OFF</p>
                </div>
                <div className="flex items-center gap-1 text-orange-500 tracking-wider navheading">
                  <AiFillStar className="text-sm" />
                  <span className="text-sm font-semibold tracking-wider navheading">4.5</span>
                  <span className="text-sm text-gray-600 ml-1 tracking-wider navheading">(166 reviews)</span>
                </div>
              </div>
              <div className="flex items-center gap-52 tracking-wider navheading">
                <p className="text-lg text-green-600 font-semibold">Stock: {totalStock} left</p>
                <p className="text-lg text-red-500 font-semibold">Buy 2 Get 1 Free</p>
              </div>

              <div className="flex gap-52 navfonts">
                <div className="flex gap-2 flex-wrap flex-col">
                  <h3 className="text-lg font-semibold text-black textheading">Variants</h3>
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(index)}
                      className={`px-4 py-2 border-2 rounded-md text-sm font-semibold navfonts cursor-pointer ${
                        selectedVariant === index
                          ? "border-purple-500 bg-purple-100 text-purple-600"
                          : "border-purple-300 text-black hover:bg-purple-50"
                      }`}
                    >
                      Variant {index + 1} (₹{variant.price})
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold text-black textheading">Select Size</h3>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {product.variants[selectedVariant]?.sizes.map((size, i) => (
                      <button
                        key={i}
                        onClick={() => size.stock > 0 && setSelectedSizes({ ...selectedSizes, [product.id]: size.size })}
                        className={`px-4 py-2 border-2 rounded-md text-sm font-semibold navfonts uppercase cursor-pointer ${
                          selectedSizes[product.id] === size.size
                            ? "border-purple-500 bg-purple-100 text-purple-600"
                            : size.stock > 0
                            ? "border-purple-300 text-black hover:bg-purple-50"
                            : "border-gray-300 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={size.stock === 0}
                      >
                        {size.size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full justify-around items-center">
                <button
                  className="relative group bg-transparent outline-none cursor-pointer uppercase w-full font-bold navfonts"
                  onClick={() => {
                    if (selectedSizes[product.id]) handleAddToCart(product.id, selectedSizes[product.id]!);
                    else toast.error("Please select a size before adding to cart.");
                  }}
                  disabled={isAddingToCart || !selectedSizes[product.id]}
                >
                  <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
                  <div
                    className={`relative flex items-center justify-center py-3 px-6 text-lg text-black rounded-lg transform -translate-y-1 bg-white gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700 ${
                      !selectedSizes[product.id] || isAddingToCart ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isAddingToCart ? (
                      <img src={cartgif} alt="Loading..." className="w-10" />
                    ) : (
                      "Add to Cart"
                    )}
                  </div>
                </button>
                <button
                  className="relative Group bg-transparent outline-none cursor-pointer uppercase w-full font-bold navfonts"
                  onClick={() => {
                    if (selectedSizes[product.id]) handleAddToWishlist(product.id, selectedSizes[product.id]!);
                    else toast.error("Please select a size before adding to wishlist.");
                  }}
                  disabled={isAddingToWishlist || !selectedSizes[product.id]}
                >
                  <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
                  <div className={`relative flex items-center justify-center py-3 px-6 text-lg rounded-lg transform -translate-y-1 bg-white gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700 active:text-red-400 ${
                    !selectedSizes[product.id] || isAddingToWishlist ? "opacity-50 cursor-not-allowed" : ""
                  }`}>
                    {isAddingToWishlist ? <img src={wishlistlike} alt="" className="w-5" /> : "Add to Wishlist"}
                    <img src={wishlistlike} alt="" className="w-8 transition duration-250 group-hover:-translate-x-1" />
                  </div>
                </button>
              </div>

              <div className="flex flex-col gap-9 navfonts mt-10 justify-between items-center">
                <h3 className="text-lg font-bold flex justify-center items-center textheading">PRODUCT DETAILS</h3>
                <ul className="grid grid-cols-3 gap-10">
                  {[
                    { label: "Fit Type", value: product.fitType },
                    { label: "Material", value: product.fabric },
                    { label: "Neck Type", value: product.neckType },
                    { label: "Pattern", value: product.pattern },
                    { label: "Color", value: product.color },
                    { label: "Gender", value: product.gender },
                    { label: "Category", value: categoryName },
                  ].map(({ label, value }) => (
                    <li key={label} className="flex flex-col gap-3">
                      <span className="font-semibold">{label}</span> <span className="flex w-full">{value}</span>
                      <hr className="border-t border-gray-300 mt-1" />
                    </li>
                  ))}
                </ul>
              </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-10 mt-6  w-full justify-between">
            <div className="md:w-1/2">
              <Reviews productId={product.id} />
            </div>
            <div className="md:w-1/2 flex flex-col gap-9 navfonts">
              <h2 className="font-bold text-lg text-center textheading">PRODUCT INFORMATION</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { title: "Product description", content: product.description },
                  { title: "7 Days Returns & Exchange", content: "Know about return & exchange policy" },
                  { title: "Shipping Info", content: "We Offer free shipping across India\nWe dispatch orders within 1-2 days\nWe usually take 2-5 working days depending on your location.Metros 2-3 days Rest of India 3-5 days" },
                ].map(({ title, content }, index) => (
                  <div key={index} className="flex flex-col gap-2 items-center">
                    <h3 className="font-bold text-md">{title}</h3>
                    <div className="bg-white border-2 border-[#101A13] rounded-lg p-3 w-full">
                      <p className="text-sm text-gray-600">{content}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center items-center mt-6 ">
                  <img src={image} alt="" className="w-[30vw] rounded-xl bg-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {similarProducts.length > 0 && (
        <div className="mt-20 flex flex-col gap-10 w-screen px-4 justify-center items-center navfonts">
          <h2 className="text-4xl font-bold text-black textheading uppercase mb-6">Similar Products</h2>
          <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-2">
            {similarProducts.map((similarProduct) => {
              const prodImages = similarProduct.variants[0]?.imageUrls || [];
              const prodPrice = similarProduct.variants[0]?.price || 0;
              const prodMrp = prodPrice + 650;
              const prodDiscount = Math.floor(((prodMrp - prodPrice) / prodMrp) * 100);
              const prodTotalStock = similarProduct.variants.reduce(
                (total, variant) => total + variant.sizes.reduce((sum, s) => sum + s.stock, 0),
                0
              );

              return (
                <div
                  key={similarProduct.id}
                  className="group border-2 border-[#101A13] rounded-xl bg-[#FAF3E0] shadow-md hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer h-fit w-full mb-5"
                  onClick={() => navigate(`/product/${similarProduct.id}`)}
                >
                  {prodImages.length > 0 ? (
                    <div className="w-full h-[60vh] overflow-hidden">
                      <div className="flex h-fit">
                        {prodImages.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`img-${i}`}
                            className="h-full object-cover flex-shrink-0  rounded-md"
                            loading="lazy"
                            onError={() => console.error(`Failed to load image: ${img} for similar product ${similarProduct.name}`)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-[60vh] overflow-hidden flex items-center justify-center bg-gray-200">
                      <span className="text-gray-600 font-semibold">No Image Available</span>
                    </div>
                  )}
                  <div className="flex justify-between px-3 py-2 text-sm items-center">
                    <div className="flex items-center gap-1 text-orange-500">
                      <AiFillStar className="text-[14px]" />
                      4.5 <span className="text-gray-600 ml-1">(241)</span>
                    </div>
                    <div className="text-xs button-55 text-black bg-transparent w-fit text-center p-1 font-bold">
                      {prodTotalStock} left
                    </div>
                  </div>
                  <div className="px-3 flex gap-2 items-center">
                    <p className="text-lg font-semibold text-black">₹{prodPrice}</p>
                    <p className="text-sm line-through text-gray-500">₹{prodMrp}</p>
                    <p className="text-sm text-green-600 font-semibold">{prodDiscount}% OFF</p>
                  </div>
                  <div className="px-3 py-1 text-sm text-black font-semibold line-clamp-2">
                    {similarProduct.name}
                  </div>
                  <div className="mx-3 mb-3">
                    <div className="flex gap-2 flex-wrap mb-2">
                      {similarProduct.variants[0]?.sizes.map((size, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (size.stock > 0) {
                              setSelectedSizes({ ...selectedSizes, [similarProduct.id]: size.size });
                            }
                          }}
                          className={`px-3 py-1 border-2 rounded-md text-sm font-semibold navfonts uppercase cursor-pointer ${
                            selectedSizes[similarProduct.id] === size.size
                              ? "border-[#101A13] bg-purple-100 text-purple-600"
                              : size.stock > 0
                              ? "border-purple-300 text-black hover:bg-purple-50"
                              : "border-gray-300 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={size.stock === 0}
                        >
                          {size.size}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 border border-[#101A13] rounded-md overflow-hidden">
                      <button
                        className="text-sm font-semibold py-2 px-4 text-black hover:bg-white transition navfonts cursor-pointer border-r border-[#101A13] disabled:opacity-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedSizes[similarProduct.id]) handleAddToCart(similarProduct.id, selectedSizes[similarProduct.id]!);
                          else toast.error("Please select a size before adding to cart.");
                        }}
                        disabled={isAddingToCart || !selectedSizes[similarProduct.id]}
                      >
                        {isAddingToCart ? "Adding..." : "ADD TO CART"}
                      </button>
                      <button
                        className="text-sm font-semibold py-2 px-4 text-black hover:bg-white transition navfonts cursor-pointer uppercase flex justify-center items-center gap-2 disabled:opacity-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedSizes[similarProduct.id]) handleAddToWishlist(similarProduct.id, selectedSizes[similarProduct.id]!);
                          else toast.error("Please select a size before adding to wishlist.");
                        }}
                        disabled={isAddingToWishlist || !selectedSizes[similarProduct.id]}
                      >
                        {isAddingToWishlist ? <img src={wishlistlike} alt="" className="w-5" /> : "Add to wishlist"}
                        <img src={wishlistlike} alt="" className="w-8" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
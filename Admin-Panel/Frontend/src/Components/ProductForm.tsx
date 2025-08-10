/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import type { Category } from "../Pages/Categories";
import { FiPlus, FiTrash2, FiSave, FiPackage, FiImage, FiTag } from "react-icons/fi";

export type ProductFormData = {
  name: string;
  price: string;
  description: string;
  category: string;
  fitType: string;
  neckType: string;
  pattern: string;
  variants: {
    price: string;
    images: File[];
    sizes: { size: string; stock: string }[];
  }[];
};

type Props = {
  onAdd: (data: ProductFormData) => void;
  categories: Category[];
  initialData?: any;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
};

const ProductForm = ({ onAdd, categories, initialData, setLoading, loading }: Props) => {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData
      ? {
          name: initialData.name,
          price: String(initialData.price),
          description: initialData.description,
          category: initialData.category,
          fitType: initialData.fitType || "Oversized",
          neckType: initialData.neckType || "Round Neck",
          pattern: initialData.pattern || "Graphic Print",
          variants: initialData.variants.map((v: any) => ({
            price: String(v.price),
            images: [],
            sizes: v.sizes.map((s: any) => ({ size: s.size, stock: String(s.stock) })),
          })),
        }
      : {
          name: "",
          price: "",
          description: "",
          category: "",
          fitType: "Oversized",
          neckType: "Round Neck",
          pattern: "Graphic Print",
          variants: [
            { price: "", images: [], sizes: [{ size: "", stock: "" }] },
          ],
        }
  );

  useEffect(() => {
    if (!formData.category && categories.length === 1) {
      setFormData((prev) => ({ ...prev, category: categories[0].ID }));
    }
  }, [categories, formData.category]);

  const isFormValid = () => {
    if (!formData.name.trim() || !formData.price || isNaN(Number(formData.price))) return false;
    if (!formData.category || !categories.find((cat) => cat.ID === formData.category)) return false;
    if (!formData.fitType || !formData.neckType || !formData.pattern) return false;
    return formData.variants.every((variant) =>
      variant.sizes.every(
        (s) =>
          s.size.trim() &&
          s.stock.trim() &&
          Number.isInteger(Number(s.stock)) &&
          Number(s.stock) >= 0
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert("Please fill in all required fields correctly.");
      return;
    }
    setLoading(true);
    try {
      onAdd(formData);
      setFormData({
        name: "",
        price: "",
        description: "",
        category: "",
        fitType: "Oversized",
        neckType: "Round Neck",
        pattern: "Graphic Print",
        variants: [{ price: "", images: [], sizes: [{ size: "", stock: "" }] }],
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    variantIndex?: number,
    sizeIndex?: number
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "images" && files && variantIndex !== undefined) {
      const newVariants = [...formData.variants];
      newVariants[variantIndex].images = Array.from(files);
      setFormData({ ...formData, variants: newVariants });
    } else if (name === "price" && variantIndex !== undefined) {
      const newVariants = [...formData.variants];
      newVariants[variantIndex].price = value;
      setFormData({ ...formData, variants: newVariants });
    } else if (name === "size" && variantIndex !== undefined && sizeIndex !== undefined) {
      const newVariants = [...formData.variants];
      newVariants[variantIndex].sizes[sizeIndex].size = value;
      setFormData({ ...formData, variants: newVariants });
    } else if (name === "stock" && variantIndex !== undefined && sizeIndex !== undefined) {
      const newVariants = [...formData.variants];
      newVariants[variantIndex].sizes[sizeIndex].stock = value;
      setFormData({ ...formData, variants: newVariants });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { price: "", images: [], sizes: [{ size: "", stock: "" }] }],
    });
  };

  const addSize = (variantIndex: number) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].sizes.push({ size: "", stock: "" });
    setFormData({ ...formData, variants: newVariants });
  };

  const removeSize = (variantIndex: number, sizeIndex: number) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].sizes.splice(sizeIndex, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariant = (variantIndex: number) => {
    const newVariants = formData.variants.filter((_, index) => index !== variantIndex);
    setFormData({ ...formData, variants: newVariants });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-lg space-y-4 sm:space-y-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FiPackage className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          {initialData ? "Edit Product" : "Add New Product"}
        </h2>
      </div>
      
      {/* Basic Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter product name"
            className="input w-full"
            required
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            name="price"
            type="number"
            placeholder="Enter price"
            value={formData.price}
            onChange={handleInputChange}
            className="input w-full"
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="input w-full"
            disabled={loading}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.ID} value={cat.ID}>
                {cat.name} {cat.gender && `(${cat.gender})`} {cat.clothingType && `- ${cat.clothingType}`}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Fit Type</label>
          <select
            name="fitType"
            value={formData.fitType}
            onChange={handleInputChange}
            className="input w-full"
            disabled={loading}
          >
            <option value="">Select Fit Type</option>
            <option value="Oversized">Oversized</option>
            <option value="Regular">Regular</option>
            <option value="Slim">Slim</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Neck Type</label>
          <select
            name="neckType"
            value={formData.neckType}
            onChange={handleInputChange}
            className="input w-full"
            disabled={loading}
          >
            <option value="">Select Neck Type</option>
            <option value="Round Neck">Round Neck</option>
            <option value="V-Neck">V-Neck</option>
            <option value="Collar">Collar</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Pattern</label>
          <select
            name="pattern"
            value={formData.pattern}
            onChange={handleInputChange}
            className="input w-full"
            disabled={loading}
          >
            <option value="">Select Pattern</option>
            <option value="Graphic Print">Graphic Print</option>
            <option value="Solid">Solid</option>
            <option value="Striped">Striped</option>
          </select>
        </div>
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          placeholder="Enter product description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={loading}
        />
      </div>
      
      {/* Variants Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FiTag className="w-5 h-5" />
          Product Variants
        </h3>
        
        {formData.variants.map((variant, variantIndex) => (
          <div key={variantIndex} className="border border-gray-200 p-4 sm:p-6 rounded-lg space-y-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="font-medium text-gray-700">Variant {variantIndex + 1}</h4>
              {formData.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(variantIndex)}
                  className="text-red-600 hover:text-red-700 bg-white border border-red-300 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center gap-2 text-sm self-start sm:self-auto"
                  disabled={loading}
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Remove Variant</span>
                </button>
              )}
            </div>
            
            {/* Variant Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Variant Price</label>
                <input
                  name="price"
                  type="number"
                  placeholder="Enter variant price"
                  value={variant.price}
                  onChange={(e) => handleInputChange(e, variantIndex)}
                  className="input w-full"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FiImage className="w-4 h-4" />
                  Images
                </label>
                <input
                  name="images"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange(e, variantIndex)}
                  className="input w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  multiple
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Sizes Section */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h5 className="font-medium text-gray-700">Sizes & Stock</h5>
                <button
                  type="button"
                  onClick={() => addSize(variantIndex)}
                  className="text-blue-600 hover:text-blue-700 bg-white border border-blue-300 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center gap-2 text-sm self-start sm:self-auto"
                  disabled={loading}
                >
                  <FiPlus className="w-4 h-4" />
                  Add Size
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {variant.sizes.map((size, sizeIndex) => (
                  <div key={sizeIndex} className="flex flex-col sm:flex-row gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <input
                        name="size"
                        placeholder="Size (e.g., S, M, L)"
                        value={size.size}
                        onChange={(e) => handleInputChange(e, variantIndex, sizeIndex)}
                        className="input w-full"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        name="stock"
                        placeholder="Stock quantity"
                        value={size.stock}
                        onChange={(e) => handleInputChange(e, variantIndex, sizeIndex)}
                        className="input w-full"
                        disabled={loading}
                      />
                    </div>
                    {variant.sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSize(variantIndex, sizeIndex)}
                        className="text-red-600 hover:text-red-700 bg-white border border-red-300 px-2 py-2 rounded-lg cursor-pointer transition-colors duration-200 self-start sm:self-auto"
                        disabled={loading}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addVariant}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
          disabled={loading}
        >
          <FiPlus className="w-4 h-4" />
          Add Variant
        </button>
      </div>
      
      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          disabled={loading}
        >
          <FiSave className="w-4 h-4" />
          {initialData ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
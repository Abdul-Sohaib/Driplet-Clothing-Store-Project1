/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import type { Category } from "../Pages/Categories";

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
      console.error("Submission failed:", error);
      alert("Failed to add product due to an error.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    variantIndex?: number,
    sizeIndex?: number
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (variantIndex !== undefined && sizeIndex !== undefined) {
      setFormData((prev) => {
        const variants = [...prev.variants];
        variants[variantIndex].sizes[sizeIndex][name as "size" | "stock"] = value;
        return { ...prev, variants };
      });
    } else if (variantIndex !== undefined && name === "images" && files) {
      setFormData((prev) => {
        const variants = [...prev.variants];
        variants[variantIndex].images = Array.from(files);
        return { ...prev, variants };
      });
    } else if (variantIndex !== undefined) {
      setFormData((prev) => {
        const variants = [...prev.variants];
        (variants[variantIndex] as any)[name] = value;
        return { ...prev, variants };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { price: "", images: [], sizes: [{ size: "", stock: "" }] }],
    }));
  };

  const addSize = (variantIndex: number) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants[variantIndex].sizes.push({ size: "", stock: "" });
      return { ...prev, variants };
    });
  };

  const removeSize = (variantIndex: number, sizeIndex: number) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants[variantIndex].sizes.splice(sizeIndex, 1);
      return { ...prev, variants };
    });
  };

  const removeVariant = (variantIndex: number) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants.splice(variantIndex, 1);
      return {
        ...prev,
        variants: variants.length
          ? variants
          : [{ price: "", images: [], sizes: [{ size: "", stock: "" }] }],
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-6">
      <h2 className="text-lg font-semibold">
        {initialData ? "Edit Product" : "Add New Product"}
      </h2>
      <div className="grid grid-cols-4 gap-6">
      <input
        name="name"
        placeholder="Product Name"
        value={formData.name}
        onChange={handleInputChange}
        className="input"
        disabled={loading}
      />
      <input
        name="price"
        placeholder="Base Price"
        value={formData.price}
        onChange={handleInputChange}
        className="input"
        disabled={loading}
      />
      
      <select
        name="category"
        value={formData.category}
        onChange={handleInputChange}
        className="input"
        disabled={loading}
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat.ID} value={cat.ID}>
            {cat.name} {cat.gender && `(${cat.gender})`} {cat.clothingType && `- ${cat.clothingType}`}
          </option>
        ))}
      </select>
      <select
        name="fitType"
        value={formData.fitType}
        onChange={handleInputChange}
        className="input"
        disabled={loading}
      >
        <option value="">Select Fit Type</option>
        <option value="Oversized">Oversized</option>
        <option value="Regular">Regular</option>
        <option value="Slim">Slim</option>
      </select>
      <select
        name="neckType"
        value={formData.neckType}
        onChange={handleInputChange}
        className="input"
        disabled={loading}
      >
        <option value="">Select Neck Type</option>
        <option value="Round Neck">Round Neck</option>
        <option value="V-Neck">V-Neck</option>
        <option value="Collar">Collar</option>
      </select>
      <select
        name="pattern"
        value={formData.pattern}
        onChange={handleInputChange}
        className="input"
        disabled={loading}
      >
        <option value="">Select Pattern</option>
        <option value="Graphic Print">Graphic Print</option>
        <option value="Solid">Solid</option>
        <option value="Striped">Striped</option>
      </select>
      <input
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleInputChange}
        className="input w-full border rounded p-2 col-span-2 h-16"
        disabled={loading}
      />
      </div>
      {formData.variants.map((variant, variantIndex) => (
        <div key={variantIndex} className="border p-2 space-y-2">
          <input
            name="price"
            placeholder="Variant Price"
            value={variant.price}
            onChange={(e) => handleInputChange(e, variantIndex)}
            className="input"
            disabled={loading}
          />
          <input
            name="images"
            type="file"
            accept="image/*"
            onChange={(e) => handleInputChange(e, variantIndex)}
            className="input"
            multiple
            disabled={loading}
          />
          {variant.sizes.map((size, sizeIndex) => (
            <div key={sizeIndex} className="flex gap-2 mt-2">
              <input
                name="size"
                placeholder="Size"
                value={size.size}
                onChange={(e) => handleInputChange(e, variantIndex, sizeIndex)}
                className="input"
                disabled={loading}
              />
              <input
                name="stock"
                placeholder="Stock"
                value={size.stock}
                onChange={(e) => handleInputChange(e, variantIndex, sizeIndex)}
                className="input"
                disabled={loading}
              />
              {variant.sizes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSize(variantIndex, sizeIndex)}
                  className="text-red-600 mt-2 ml-4 bg-white border-2 border-black px-4 py-2 rounded cursor-pointer"
                  disabled={loading}
                >
                  Remove Size
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSize(variantIndex)}
            className="text-white mt-2 bg-blue-600  px-4 py-2 rounded cursor-pointer"
            disabled={loading}
          >
            + Add Size
          </button>
          {formData.variants.length > 1 && (
            <button
              type="button"
              onClick={() => removeVariant(variantIndex)}
              className="text-red-600 mt-2 ml-4 bg-white border-2 border-black px-4 py-2 rounded cursor-pointer"
              disabled={loading}
            >
              Remove Variant
            </button>
          )}
        </div>
      ))}
      <div className="flex gap-4">
      <button
        type="button"
        onClick={addVariant}
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
        disabled={loading}
      >
        + Add Variant
      </button>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
        disabled={loading}
      >
        {initialData ? "Update" : "Submit"}
      </button>
      </div>
    </form>
  );
};

export default ProductForm;
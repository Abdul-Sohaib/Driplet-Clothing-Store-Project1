/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import ProductForm, { type ProductFormData } from "../Components/ProductForm";
import ProductList from "../Components/ProductList";
import Loading from "../Components/Loading";
import type { Category } from "./Categories";

export interface Product {
  id: string | number;
  name: string;
  price: number;
  description: string;
  category: string;
  fitType: string;
  neckType: string;
  pattern: string;
  variants: {
    price: number;
    imageUrls: string[];
    sizes: { size: string; stock: number }[];
  }[];
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      const mapped = data.map((cat: any) => ({
        id: cat._id || cat.id,
        name: cat.name,
        ID: cat.ID,
        parent: cat.parent,
        gender: cat.gender,
        clothingType: cat.clothingType,
        description: cat.description,
        imageUrl: cat.imageUrl,
      }));
      setCategories(mapped);
    } catch (err: any) {
      setError(err.message || "Error fetching categories");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const mapped = data.map((p: any) => ({
        id: p._id || p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        category: p.category,
        fitType: p.fitType || "Oversized",
        neckType: p.neckType || "Round Neck",
        pattern: p.pattern || "Graphic Print",
        variants: p.variants,
      }));
      setProducts(mapped);
    } catch (err: any) {
      setError(err.message || "Error fetching products");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", data.price);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("fitType", data.fitType);
      formData.append("neckType", data.neckType);
      formData.append("pattern", data.pattern);

      data.variants.forEach((v, index) => {
        formData.append(`variants[${index}][price]`, v.price);
        formData.append(`variants[${index}][sizes]`, JSON.stringify(
          v.sizes.map((s) => ({
            size: s.size,
            stock: parseInt(s.stock),
          }))
        ));
        v.images?.forEach((file) => {
          formData.append(`variants[${index}][images]`, file);
        });
      });

      const url = productToEdit
        ? `${import.meta.env.VITE_API_BASE_URL}/products/${productToEdit.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/products`;
      const res = await fetch(url, {
        method: productToEdit ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server response:", errorText);
        throw new Error(`Failed to submit: ${errorText || "Internal Server Error"}`);
      }

      await fetchProducts();
      alert(`Product ${productToEdit ? "updated" : "added"} successfully!`);
      setProductToEdit(null);
    } catch (err: any) {
      setError(err.message || "Error submitting product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete product");
      await fetchProducts();
    } catch (err: any) {
      setError(err.message || "Error deleting product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white bg-opacity-70">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all duration-300 cursor-pointer text-sm sm:text-base self-start"
          disabled={loading}
        >
          ← Back to Home
        </button>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">Manage Products</h1>
      </div>
      
      {/* Form and List */}
      <div className="space-y-6">
        <ProductForm
          categories={categories}
          onAdd={handleSubmit}
          initialData={productToEdit || undefined}
          setLoading={setLoading}
          loading={loading}
        />
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Products;
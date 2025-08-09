/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import CategoryForm from "../Components/CategoryForm";
import CategoryList from "../Components/CategoryList";
import Loading from "../Components/Loading";

export type Category = {
  id: number;
  name: string;
  ID: string;
  parent?: string;
  gender?: string;
  clothingType?: string;
  description?: string;
  imageUrl?: string;
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const fixedCategories = ["Oversized T-shirt", "Topware", "Bottom Ware", "New Arrival", "Center Stage", "CLASSIC FIT T-SHIRTS"];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
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
    } catch (err) {
      console.error("Error fetching categories:", err);
      alert("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data: { categories: (Omit<Category, "id"> & { image?: File | null })[] }) => {
    setLoading(true);
    try {
      const token = await getToken();
      for (const category of data.categories) {
        const formData = new FormData();
        formData.append("name", category.name);
        formData.append("ID", category.ID);
        if (category.parent && !fixedCategories.includes(category.parent)) {
          alert(`Invalid parent "${category.parent}" for category "${category.name}". Must be one of the fixed categories or left empty!`);
          return;
        }
        if (category.parent) formData.append("parent", category.parent);
        if (category.gender) formData.append("gender", category.gender);
        if (category.clothingType) formData.append("clothingType", category.clothingType);
        if (category.description) formData.append("description", category.description);
        if (category.image) formData.append("image", category.image);

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Failed to add category "${category.name}":`, errorText);
          throw new Error(`Failed to add category: ${category.name} - ${errorText}`);
        }

        const newCategory = await res.json();
        setCategories((prev) => [...prev, {
          ...newCategory,
          id: newCategory._id || newCategory.id,
        }]);
      }
    } catch (err) {
      console.error("Error adding category:", err);
      if (err instanceof Error) {
        alert(`Error adding category: ${err.message}`);
      } else {
        alert("Error adding category: An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (updated: Category & { image?: File | null }) => {
    setLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("name", updated.name);
      formData.append("ID", updated.ID);
      if (updated.parent && !fixedCategories.includes(updated.parent)) {
        alert("Parent must be one of the fixed categories or left empty!");
        return;
      }
      if (updated.parent) formData.append("parent", updated.parent);
      if (updated.gender) formData.append("gender", updated.gender);
      if (updated.clothingType) formData.append("clothingType", updated.clothingType);
      if (updated.description) formData.append("description", updated.description);
      if (updated.image instanceof File) formData.append("image", updated.image);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories/${updated.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      const result = await response.json();
      setCategories((prev) =>
        prev.map((cat) => (cat.id === updated.id ? { ...result, id: result._id || result.id } : cat))
      );
    } catch (err) {
      console.error("Error updating category:", err);
      alert("Error updating category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Error deleting category");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white bg-opacity-70">
        <Loading />
      </div>
    );
  }

  return (
    <>
    <div className="p-6 space-y-6 bg-gray-100 h-screen">
    <div className="flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all duration-300 cursor-pointer"
          disabled={loading}
        >
          Back to Home
        </button>
        <h1 className="text-2xl font-bold text-black">Manage Category</h1>
      </div>
    <div className="p-6 space-y-6">
      <CategoryForm onAdd={handleAdd} categories={categories} setLoading={setLoading} loading={loading} />
      <CategoryList categories={categories} onDelete={handleDelete} onEdit={handleEdit} loading={loading} />
    </div>
    </div>
    </>
  );
};

export default Categories;
import { useState, useEffect } from "react";
import type { Category } from "../Pages/Categories";
import { FiPlus, FiImage, FiFileText } from "react-icons/fi";

type Props = {
  onAdd: (data: { categories: (Omit<Category, "id"> & { image?: File | null })[] }) => void;
  categories: Category[];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
};

type FormState = {
  name: string;
  ID: string;
  parent?: string;
  gender?: string;
  clothingType?: string;
  description?: string;
  image: File | null;
};

const initialState: FormState = {
  name: "",
  ID: "",
  parent: undefined,
  gender: undefined,
  clothingType: undefined,
  description: undefined,
  image: null,
};

const CategoryForm = ({ onAdd, categories, setLoading, loading }: Props) => {
  const [form, setForm] = useState<FormState>(initialState);
  const fixedCategories = ["Oversized T-shirt", "Topware", "Bottom Ware", "New Arrival", "Center Stage", "CLASSIC FIT T-SHIRTS"];

  useEffect(() => {
    const lastCategory = categories.length > 0 ? categories[categories.length - 1] : null;
    if (lastCategory?.parent && !form.parent) {
      setForm((prev) => ({ ...prev, parent: lastCategory.parent }));
    }
  }, [categories, form.parent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image" && files) {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value || undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.ID || categories.some((cat) => cat.ID === form.ID)) {
      alert(`Category ${form.name} with ID ${form.ID} is invalid or ID must be unique!`);
      return;
    }

    setLoading(true);
    try {
      const newCategories = [{
        name: form.name,
        ID: form.ID,
        parent: form.parent,
        gender: form.gender,
        clothingType: form.clothingType,
        description: form.description,
        image: form.image,
      }];

      console.log("Submitting category:", newCategories);
      await onAdd({ categories: newCategories });
      setForm((prev) => ({
        ...prev,
        name: "",
        ID: "",
      }));
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to add category due to an error.");
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = ["", "Men", "Women", "Unisex", "Kids"];
  const clothingTypeOptions = [
    "",
    "Professional",
    "Casual",
    "Formal",
    "Activewear",
    "Sleepwear",
    "Accessories",
    "Sustainable",
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg space-y-3 sm:space-y-4 md:space-y-6 border border-gray-200 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">Add New Category</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Category Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter category name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Category ID</label>
          <input
            name="ID"
            value={form.ID}
            onChange={handleChange}
            placeholder="Enter category ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2 sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Parent Category</label>
          <select
            name="parent"
            value={form.parent || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
            disabled={loading}
          >
            <option value="">No Parent</option>
            {fixedCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            name="gender"
            value={form.gender || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
            disabled={loading}
          >
            {genderOptions.map((option) => (
              <option key={option} value={option}>
                {option || "Select Gender"}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Clothing Type</label>
          <select
            name="clothingType"
            value={form.clothingType || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
            disabled={loading}
          >
            {clothingTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option || "Select Clothing Type"}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FiImage className="w-4 h-4" />
            Category Image
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base transition-all duration-200 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            disabled={loading}
          />
          {form.image && (
            <div className="mt-2 flex justify-center sm:justify-start">
              <img
                src={URL.createObjectURL(form.image)}
                alt="Category Preview"
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FiFileText className="w-4 h-4" />
          Description
        </label>
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          placeholder="Enter category description"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm sm:text-base transition-all duration-200"
          rows={3}
          disabled={loading}
        />
      </div>
      
      <div className="flex justify-center sm:justify-start">
        <button
          type="submit"
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-sm hover:shadow-md"
          disabled={loading}
        >
          <FiPlus className="w-4 h-4" />
          <span className="hidden sm:inline">{loading ? "Submitting..." : "Add Category"}</span>
          <span className="sm:hidden">{loading ? "..." : "Add"}</span>
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
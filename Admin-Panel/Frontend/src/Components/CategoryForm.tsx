import { useState, useEffect } from "react";
import type { Category } from "../Pages/Categories";

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
      className="bg-white p-4 rounded shadow space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Category Name"
          className="input"
          required
          disabled={loading}
        />
        <input
          name="ID"
          value={form.ID}
          onChange={handleChange}
          placeholder="Category ID"
          className="input"
          required
          disabled={loading}
        />
        <select
          name="parent"
          value={form.parent || ""}
          onChange={handleChange}
          className="input col-span-2"
          disabled={loading}
        >
          <option value="">No Parent</option>
          {fixedCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          name="gender"
          value={form.gender || ""}
          onChange={handleChange}
          className="input col-span-2"
          disabled={loading}
        >
          {genderOptions.map((option) => (
            <option key={option} value={option}>
              {option || "Select Gender"}
            </option>
          ))}
        </select>
        <select
          name="clothingType"
          value={form.clothingType || ""}
          onChange={handleChange}
          className="input col-span-2"
          disabled={loading}
        >
          {clothingTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option || "Select Clothing Type"}
            </option>
          ))}
        </select>
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="input col-span-2"
          disabled={loading}
        />
        {form.image && (
          <div className="col-span-2">
            <img
              src={URL.createObjectURL(form.image)}
              alt="Category Preview"
              className="w-20 h-20 object-cover rounded"
            />
          </div>
        )}
      </div>
      <textarea
        name="description"
        value={form.description || ""}
        onChange={handleChange}
        placeholder="Description"
        className="w-full border rounded p-2 col-span-2"
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-purple-600 text-white px-4 py-2 rounded col-span-2 cursor-pointer"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Add Category"}
      </button>
    </form>
  );
};

export default CategoryForm;
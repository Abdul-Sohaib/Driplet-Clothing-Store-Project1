import type { Category } from "../Pages/Categories";

type Props = {
  categories: Category[];
  onDelete: (id: number) => void;
  onEdit: (category: Category) => void;
  loading: boolean;
};

const CategoryList = ({ categories, onDelete, onEdit, loading }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {categories
        .filter((cat) => {
          if (!cat.id) {
            console.warn(`Category "${cat.name}" is missing an id`);
            return false;
          }
          return true;
        })
        .map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
            style={{ marginLeft: cat.parent ? "20px" : "0" }}
          >
            <div>
              <h2 className="text-lg font-bold">{cat.name || "Unnamed Category"}</h2>
              {cat.parent && (
                <p className="text-sm text-gray-500">Parent: {cat.parent}</p>
              )}
              <p className="text-gray-600 text-sm">
                {cat.description || "No description"}
              </p>
              <p className="text-sm">ID: {cat.ID || "N/A"}</p>
              {cat.gender && <p className="text-sm">Gender: {cat.gender}</p>}
              {cat.clothingType && (
                <p className="text-sm">Clothing Type: {cat.clothingType}</p>
              )}
              <div className="mt-2 relative">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name || "Category"}
                    className="w-20 h-20 object-cover rounded"
                    loading="lazy"
                    onError={(e) => {
                      console.warn(`Failed to load image: ${cat.imageUrl}`);
                      e.currentTarget.style.display = "none";
                      const nextSibling = e.currentTarget.nextSibling;
                      if (nextSibling instanceof HTMLElement) {
                        nextSibling.style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded text-gray-500 text-sm"
                  style={{ display: cat.imageUrl ? "none" : "flex" }}
                >
                  No Image
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(cat)}
                className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer"
                disabled={loading}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(cat.id)}
                className="bg-red-600 text-white px-3 py-1 rounded cursor-pointer"
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default CategoryList;
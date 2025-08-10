import type { Category } from "../Pages/Categories";
import { FiEdit2, FiTrash2, FiImage, FiFolder } from "react-icons/fi";

type Props = {
  categories: Category[];
  onDelete: (id: number) => void;
  onEdit: (category: Category) => void;
  loading: boolean;
};

const CategoryList = ({ categories, onDelete, onEdit, loading }: Props) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Categories ({categories.length})</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
              className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-purple-300"
              style={{ marginLeft: cat.parent ? "10px" : "0" }}
            >
              <div className="space-y-2 sm:space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                      {cat.name || "Unnamed Category"}
                    </h2>
                    {cat.parent && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <FiFolder className="w-3 h-3" />
                        Parent: {cat.parent}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                  {cat.description || "No description available"}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div className="bg-gray-50 px-2 sm:px-3 py-2 rounded-md">
                    <span className="font-medium text-gray-700">ID:</span>
                    <span className="ml-2 text-gray-600 font-mono">{cat.ID || "N/A"}</span>
                  </div>
                  {cat.gender && (
                    <div className="bg-gray-50 px-2 sm:px-3 py-2 rounded-md">
                      <span className="font-medium text-gray-700">Gender:</span>
                      <span className="ml-2 text-gray-600">{cat.gender}</span>
                    </div>
                  )}
                  {cat.clothingType && (
                    <div className="bg-gray-50 px-2 sm:px-3 py-2 rounded-md sm:col-span-2">
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="ml-2 text-gray-600">{cat.clothingType}</span>
                    </div>
                  )}
                </div>

                {/* Image Section */}
                <div className="mt-3 sm:mt-4">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name || "Category"}
                      className="w-full h-24 sm:h-28 md:h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
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
                  ) : (
                    <div className="w-full h-24 sm:h-28 md:h-32 bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200">
                      <div className="text-center text-gray-500">
                        <FiImage className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                        <span className="text-xs sm:text-sm">No Image</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onEdit(cat)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-2 sm:px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm shadow-sm hover:shadow-md"
                    disabled={loading}
                  >
                    <FiEdit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Edit</span>
                    <span className="sm:hidden">Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(cat.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-2 sm:px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm shadow-sm hover:shadow-md"
                    disabled={loading}
                  >
                    <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Delete</span>
                    <span className="sm:hidden">Del</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CategoryList;
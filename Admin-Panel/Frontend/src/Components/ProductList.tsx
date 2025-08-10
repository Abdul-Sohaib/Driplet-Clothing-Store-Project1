/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Product } from "../Pages/Products";
import { FiEdit2, FiTrash2, FiPackage, FiTag, FiDollarSign, FiGrid } from "react-icons/fi";

type ProductListProps = {
  products: Product[];
  onDelete: (id: string | number) => void;
  onEdit: (product: Product) => void;
  loading: boolean;
};

const ProductList = ({ products, onDelete, onEdit, loading }: ProductListProps) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <FiPackage className="w-6 h-6" />
        Product List
      </h2>
      
      {products.length === 0 ? (
        <div className="text-center py-8">
          <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No products available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {products.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 bg-gray-50">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {product.description || "No description available"}
                    </p>
                  </div>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white px-3 py-2 rounded-md border border-gray-200">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4" />
                      Price:
                    </span>
                    <span className="ml-6 text-gray-600">₹{product.price.toLocaleString()}</span>
                  </div>
                  
                  <div className="bg-white px-3 py-2 rounded-md border border-gray-200">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <FiGrid className="w-4 h-4" />
                      Category:
                    </span>
                    <span className="ml-6 text-gray-600">{product.category}</span>
                  </div>
                  
                  <div className="bg-white px-3 py-2 rounded-md border border-gray-200">
                    <span className="font-medium text-gray-700">Fit Type:</span>
                    <span className="ml-2 text-gray-600">{product.fitType || "Oversized"}</span>
                  </div>
                  
                  <div className="bg-white px-3 py-2 rounded-md border border-gray-200">
                    <span className="font-medium text-gray-700">Neck Type:</span>
                    <span className="ml-2 text-gray-600">{product.neckType || "Round Neck"}</span>
                  </div>
                  
                  <div className="bg-white px-3 py-2 rounded-md border border-gray-200 sm:col-span-2">
                    <span className="font-medium text-gray-700">Pattern:</span>
                    <span className="ml-2 text-gray-600">{product.pattern || "Graphic Print"}</span>
                  </div>
                </div>

                {/* Variants Section */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <FiTag className="w-4 h-4" />
                    Variants ({product.variants.length})
                  </h4>
                  
                  {product.variants.length > 0 ? (
                    <div className="space-y-3">
                      {product.variants.map((variant, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700">Variant {idx + 1}</span>
                            <span className="text-sm font-medium text-green-600">
                              ₹{variant.price.toLocaleString()}
                            </span>
                          </div>
                          
                          {/* Sizes */}
                          <div className="mb-3">
                            <span className="text-sm text-gray-600">Sizes: </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {variant.sizes.length > 0 ? (
                                variant.sizes.map((s, sizeIdx) => (
                                  <span
                                    key={sizeIdx}
                                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {s.size} (Stock: {s.stock})
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">No sizes</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Images */}
                          {Array.isArray((variant as any).imageUrls) && (variant as any).imageUrls.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto">
                              {(variant as any).imageUrls.map((imgUrl: string, i: number) => (
                                <img
                                  key={i}
                                  src={imgUrl}
                                  alt={`Variant ${idx + 1} Image ${i + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-200">
                      No variants available
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
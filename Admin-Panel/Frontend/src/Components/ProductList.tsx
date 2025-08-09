/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import type { Product } from "../Pages/Products";

type ProductListProps = {
  products: Product[];
  onDelete: (id: string | number) => void;
  onEdit: (product: Product) => void;
  loading: boolean;
};

const ProductList: React.FC<ProductListProps> = ({ products, onDelete, onEdit, loading }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Product List</h2>
      {products.length === 0 ? (
        <p className="text-gray-600">No products available.</p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-md font-medium text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.description || "No description"}</p>
                  <p className="text-sm text-gray-600">Base Price: ₹{product.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Category-ID: {product.category}</p>
                  <p className="text-sm text-gray-600">Fit Type: {product.fitType || "Oversized"}</p>
                  <p className="text-sm text-gray-600">Neck Type: {product.neckType || "Round Neck"}</p>
                  <p className="text-sm text-gray-600">Pattern: {product.pattern || "Graphic Print"}</p>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Variants:</p>
                    {product.variants.length > 0 ? (
                      <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                        {product.variants.map((variant, idx) => (
                          <li key={idx}>
                            <div>
                              Variant {idx + 1}: ₹{variant.price.toLocaleString()} —{" "}
                              {variant.sizes.length > 0
                                ? variant.sizes
                                    .map((s) => `${s.size} (Stock: ${s.stock})`)
                                    .join(", ")
                                : "No sizes"}
                              {Array.isArray((variant as any).imageUrls) &&
                                (variant as any).imageUrls.map((imgUrl: string, i: number) => (
                                  <img
                                    key={i}
                                    src={imgUrl}
                                    alt={`Variant ${idx + 1} Image ${i + 1}`}
                                    className="inline-block ml-2 mt-1 w-10 h-10 object-cover rounded border"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">No variants</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm cursor-pointer"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm cursor-pointer"
                    disabled={loading}
                  >
                    Delete
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
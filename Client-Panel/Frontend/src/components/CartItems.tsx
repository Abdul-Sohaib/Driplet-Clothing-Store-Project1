import type { CartItem } from "../Pages/Checkoutpage";

interface CartItemsProps {
  cartItems: CartItem[];
}

const CartItems: React.FC<CartItemsProps> = ({ cartItems }) => {
  return (
    <div className="max-h-[200px] overflow-y-auto my-3 sm:my-4">
      <h3 className="text-sm sm:text-md font-semibold mb-2 navheading tracking-wider uppercase">Cart Items</h3>
      {cartItems.length === 0 ? (
        <div className="text-sm sm:text-base">No items in cart.</div>
      ) : (
        cartItems.map(item => (
          <div key={`${item.productId}-${item.size}-${item.variantIndex || 0}`} className="flex items-center gap-2 sm:gap-4 mb-2 p-2 sm:p-3 bg-white/50 rounded-lg">
            <img
              src={item.product.imageUrls[0] || "/placeholder.jpg"}
              alt={item.product.name}
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md border-2 border-black flex-shrink-0"
              onError={(e) => {
                console.error(`Failed to load cart item image: ${item.product.imageUrls[0]}`);
                e.currentTarget.src = "/placeholder.jpg";
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-semibold truncate">{item.product.name}</div>
              <div className="text-xs sm:text-sm text-gray-600">
                Qty: {item.quantity} | Size: {item.size} 
                {item.variantIndex !== undefined ? ` | Variant: ${item.variantIndex + 1}` : ""} 
                | ₹{item.product.price * item.quantity}
              </div>
            </div>
          </div>
        ))
      )}
      <hr className="my-2 sm:my-3" />
    </div>
  );
};

export default CartItems;
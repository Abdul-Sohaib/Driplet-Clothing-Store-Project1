import type { CartItem } from "../Pages/Checkoutpage";

interface CartItemsProps {
  cartItems: CartItem[];
}

const CartItems: React.FC<CartItemsProps> = ({ cartItems }) => {
  return (
    <div className="max-h-[160px] xs:max-h-[180px] sm:max-h-[200px] overflow-y-auto my-2 xs:my-3 sm:my-4">
      <h3 className="text-xs xs:text-sm sm:text-md font-semibold mb-2 navheading tracking-wider uppercase">Cart Items</h3>
      {cartItems.length === 0 ? (
        <div className="text-xs xs:text-sm sm:text-base">No items in cart.</div>
      ) : (
        cartItems.map(item => (
          <div key={`${item.productId}-${item.size}-${item.variantIndex ?? 0}`} className="flex items-center gap-1 xs:gap-2 sm:gap-3 mb-2 p-1 xs:p-2 sm:p-3 bg-white/50 rounded-lg">
            <img
              src={item.product.imageUrls[0] || "/placeholder.jpg"}
              alt={item.product.name}
              className="w-8 xs:w-10 sm:w-12 h-8 xs:h-10 sm:h-12 object-cover rounded-md border-2 border-black flex-shrink-0"
              loading="lazy"
              onError={(e) => {
                console.error(`Failed to load cart item image: ${item.product.imageUrls[0]}`);
                e.currentTarget.src = "/placeholder.jpg";
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs xs:text-sm font-semibold truncate">{item.product.name}</div>
              <div className="text-xs xs:text-sm text-gray-600">
                Qty: {item.quantity} | Size: {item.size} 
                {item.variantIndex !== undefined ? ` | Variant: ${item.variantIndex + 1}` : ""} 
                | ₹{item.product.price * item.quantity}
              </div>
            </div>
          </div>
        ))
      )}
      <hr className="my-2 xs:my-3" />
    </div>
  );
};

export default CartItems;
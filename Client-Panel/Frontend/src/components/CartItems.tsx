import type { CartItem } from "../Pages/Checkoutpage";

interface CartItemsProps {
  cartItems: CartItem[];
}

const CartItems: React.FC<CartItemsProps> = ({ cartItems }) => {
  return (
    <div className="max-h-[200px] overflow-y-auto my-4">
      <h3 className="text-md font-semibold mb-2 navheading tracking-wider uppercase">Cart Items</h3>
      {cartItems.length === 0 ? (
        <div>No items in cart.</div>
      ) : (
        cartItems.map(item => (
          <div key={`${item.productId}-${item.size}-${item.variantIndex || 0}`} className="flex items-center gap-4 mb-2">
            <img
              src={item.product.imageUrls[0] || "/placeholder.jpg"}
              alt={item.product.name}
              className="w-16 object-cover rounded-md border-2 border-black"
              onError={(e) => {
                console.error(`Failed to load cart item image: ${item.product.imageUrls[0]}`);
                e.currentTarget.src = "/placeholder.jpg";
              }}
            />
            <div>
              <strong>{item.product.name}</strong> | Qty: {item.quantity} | Size: {item.size} 
              {item.variantIndex !== undefined ? ` | Variant: ${item.variantIndex + 1}` : ""} 
              | ₹{item.product.price * item.quantity}
            </div>
          </div>
        ))
      )}
      <hr />
    </div>
  );
};

export default CartItems;
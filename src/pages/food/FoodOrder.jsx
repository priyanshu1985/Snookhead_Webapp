import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import "../../styles/foodOrder.css";

const foodItems = [
  { id: 1, name: "Veg Burger", price: 120 },
  { id: 2, name: "French Fries", price: 90 },
  { id: 3, name: "Cold Coffee", price: 150 },
  { id: 4, name: "Pizza Slice", price: 180 },
  { id: 5, name: "Momos", price: 140 },
];

const FoodOrder = () => {
  const [cart, setCart] = useState([]);

  const addItem = (item) => {
    const exists = cart.find((c) => c.id === item.id);
    if (exists) {
      setCart(
        cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const updateQty = (id, type) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, qty: type === "inc" ? item.qty + 1 : item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <div className="food-page">
          <h5 className="mb-3">← Food & Order</h5>

          <div className="food-layout">
            {/* FOOD LIST */}
            <div className="food-list">
              {foodItems.map((item) => (
                <div className="food-card" key={item.id}>
                  <h6>{item.name}</h6>
                  <p>₹ {item.price}</p>
                  <button onClick={() => addItem(item)}>Add</button>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div className="order-summary">
              <h6>Order Summary</h6>

              {cart.length === 0 && <p className="empty">No items added</p>}

              {cart.map((item) => (
                <div className="order-item" key={item.id}>
                  <span>{item.name}</span>
                  <div className="qty">
                    <button onClick={() => updateQty(item.id, "dec")}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, "inc")}>+</button>
                  </div>
                </div>
              ))}

              <div className="price-box">
                <div>
                  <span>Subtotal</span>
                  <span>₹ {subtotal}</span>
                </div>
                <div>
                  <span>Tax</span>
                  <span>₹ {tax.toFixed(2)}</span>
                </div>
                <div className="total">
                  <strong>Total</strong>
                  <strong>₹ {total.toFixed(2)}</strong>
                </div>
              </div>

              <button className="pay-btn">Proceed to Pay</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodOrder;

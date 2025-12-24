import { useContext } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import "../../styles/upgradeSubscription.css";

const plans = [
  {
    name: "Basic",
    price: 29,
    features: [
      "Manage up to 1 location",
      "Table booking system",
      "Menu & pricing setup",
      "Daily sales reports",
      "Email support",
    ],
  },
  {
    name: "Medium",
    price: 46,
    features: [
      "Manage up to 3 locations",
      "Advanced table booking",
      "Menu & pricing setup",
      "Daily sales reports",
      "Staff permissions",
    ],
  },
  {
    name: "Premium",
    price: 69,
    features: [
      "Unlimited locations",
      "Advanced booking",
      "Credit system",
      "Multi-branch analytics",
      "Priority support",
    ],
  },
];

const UpgradeSubscription = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="upgrade-page">
          <h5>← Upgrade & Subscription</h5>

          <div className="upgrade-header">
            <h3>☕ Powerful Café Plans</h3>
            <p>Simple, transparent pricing built for your café operations.</p>
          </div>

          <div className="plans">
            {plans.map((plan) => (
              <div className="plan-card" key={plan.name}>
                <h4>{plan.name}</h4>
                <h2>
                  ${plan.price}
                  <span>/month</span>
                </h2>

                <ul>
                  {plan.features.map((f, i) => (
                    <li key={i}>✔ {f}</li>
                  ))}
                </ul>

                <button>Start free 7 days trial</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeSubscription;

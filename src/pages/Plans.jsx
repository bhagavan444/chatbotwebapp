import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Plans.css";

function Plans() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly/yearly toggle

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      badge: "Free",
      features: [
        { text: "Unlimited basic chats", tooltip: "Chat as much as you want" },
        { text: "General AI responses", tooltip: "Standard AI replies" },
        { text: "No sign-up required", tooltip: "Quick access without login" },
        { text: "Secure & Private", tooltip: "Encrypted and private" },
        { text: "Mobile & desktop access", tooltip: "Works on all devices" },
        { text: "No premium models", tooltip: "Access to advanced AI unavailable", disabled: true },
        { text: "No chat history", tooltip: "Previous chats not saved", disabled: true },
        { text: "Limited daily usage", tooltip: "You can chat only a limited number of times", disabled: true },
      ],
      btnText: "Start For Free",
      btnAction: () => navigate("/chat"),
      featured: true,
      btnDisabled: false
    },
    {
      name: "Pro",
      price: { monthly: 12, yearly: 120 },
      badge: "Pro ⭐ Most Popular",
      features: [
        { text: "Access to latest AI models" },
        { text: "Priority customer support" },
        { text: "Save & organize conversation history" },
        { text: "Code & Math problem solving" },
        { text: "Advanced document Q&A (PDF, Word)" },
        { text: "Early access to new features" },
        { text: "Multi-device sync" },
        { text: "No team collaboration", disabled: true },
      ],
      btnText: "Notify Me",
      btnDisabled: true
    },
    {
      name: "Plus",
      price: { monthly: 24, yearly: 240 },
      badge: "Plus",
      features: [
        { text: "Everything in Pro" },
        { text: "Faster responses & reliability" },
        { text: "Team collaboration spaces" },
        { text: "API access for developers" },
        { text: "Extended memory & context window" },
        { text: "Beta features & experiments" },
        { text: "Export chats (PDF, Word, Excel)" },
        { text: "Analytics dashboard for insights" },
      ],
      btnText: "Notify Me",
      btnDisabled: true
    },
  ];

  return (
    <main className="plans-main">
      {/* === Hero Section === */}
      <section className="plans-hero">
        <h1>
          Choose Your <span className="plans-highlight">ChatBot</span> Plan
        </h1>
        <p className="plans-subtitle">
          From casual chatting to advanced AI features, pick the plan that suits your needs.
        </p>

        {/* Billing Toggle */}
        <div className="pricing-toggle">
          <span
            className={billingCycle === "monthly" ? "active" : ""}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </span>
          <span
            className={billingCycle === "yearly" ? "active" : ""}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly - Save 20%
          </span>
        </div>
      </section>

      {/* === Plan Cards === */}
      <section className="plans-cards">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`plan-card ${plan.featured ? "featured-plan" : ""}`}
          >
            <div className={`plan-badge ${plan.name.toLowerCase()}`}>{plan.badge}</div>
            <div className="plan-price">
              ${plan.price[billingCycle]} <span>/ {billingCycle}</span>
            </div>
            <ul className="plan-features">
              {plan.features.map((feature, idx) => (
                <li
                  key={idx}
                  title={feature.tooltip || ""}
                  className={feature.disabled ? "disabled-feature" : ""}
                >
                  {feature.disabled ? "❌" : "✔️"} {feature.text}
                </li>
              ))}
            </ul>
            <button
              className={`plan-btn ${plan.name.toLowerCase()}`}
              onClick={plan.btnAction}
              disabled={plan.btnDisabled}
            >
              {plan.btnText}
            </button>
          </div>
        ))}
      </section>

      {/* === Comparison Table === */}
      <section className="plans-comparison">
        <h2 className="comparison-title">Compare Plans Side by Side</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Features</th>
              <th>Free</th>
              <th>Pro</th>
              <th>Plus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Unlimited Basic Chats</td>
              <td>✔️</td>
              <td>✔️</td>
              <td>✔️</td>
            </tr>
            <tr>
              <td>Access to Premium AI Models</td>
              <td>❌</td>
              <td>✔️</td>
              <td>✔️</td>
            </tr>
            <tr>
              <td>Conversation History</td>
              <td>❌</td>
              <td>✔️</td>
              <td>✔️</td>
            </tr>
            <tr>
              <td>Code & Math Solving</td>
              <td>❌</td>
              <td>✔️</td>
              <td>✔️</td>
            </tr>
            <tr>
              <td>Team Collaboration</td>
              <td>❌</td>
              <td>❌</td>
              <td>✔️</td>
            </tr>
            <tr>
              <td>API Access</td>
              <td>❌</td>
              <td>❌</td>
              <td>✔️</td>
            </tr>
            <tr>
              <td>Export Chats (PDF/Word/Excel)</td>
              <td>❌</td>
              <td>❌</td>
              <td>✔️</td>
            </tr>
            <tr>
              <td>Priority Customer Support</td>
              <td>❌</td>
              <td>✔️</td>
              <td>✔️</td>
            </tr>
            <tr>
              <td>Analytics Dashboard</td>
              <td>❌</td>
              <td>❌</td>
              <td>✔️</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default Plans;

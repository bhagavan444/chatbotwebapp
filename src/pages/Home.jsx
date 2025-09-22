import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [activeFAQ, setActiveFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const useCases = [
    { title: "Education Assistant", emoji: "🎓", description: "Helps students learn faster, answers questions, and tutors in real-time." },
    { title: "Customer Support", emoji: "🏢", description: "Instantly solves customer queries, reducing workload and response time." },
    { title: "Developer Helper", emoji: "🧑‍💻", description: "Generates code snippets, debugs issues, and explains concepts." },
    { title: "Career/Resume Guide", emoji: "💼", description: "Assists users in creating resumes, preparing for interviews, and career guidance." }
  ];

  const faqs = [
    { question: "Is my data safe?", answer: "Yes, we implement end-to-end encryption and follow industry-standard privacy protocols." },
    { question: "Does it support multiple languages?", answer: "Yes, our AI supports English, Telugu, Hindi, and more coming soon." },
    { question: "Can I access chat history?", answer: "Pro and Plus users can save and organize all past conversations." },
    { question: "Is there an API for developers?", answer: "Yes, Plus plan users get API access for integration and automation." }
  ];

  return (
    <main className="homepage-main">
      {/* Hero Section */}
      <section className="homepage-hero-section">
        <div className="homepage-hero-content">
          <h1 className="homepage-hero-title">
            Elevate Your Communication with{" "}
            <span className="homepage-highlight">Advanced AI Precision</span>
          </h1>
          <p className="homepage-hero-subtitle">
            Seamless, intelligent, real-time AI ChatBot that adapts, assists,
            and evolves with your business needs. Automate tasks, enhance
            productivity, and deliver exceptional experiences.
          </p>
          <div className="homepage-hero-buttons">
            <button
              className="homepage-btn homepage-get-started"
              onClick={() => navigate("/login")}
            >
              Get Started
            </button>
            <button
              className="homepage-btn homepage-plans"
              onClick={() => navigate("/plans")}
            >
              Explore Pricing
            </button>
          </div>
        </div>
        <div className="homepage-hero-image">
          {/* Optional AI Illustration / Animation */}
        </div>
      </section>

      {/* Features Section */}
      <section className="homepage-features-section">
        <h2 className="homepage-section-title">
          Why Partner with Our AI ChatBot?
        </h2>
        <div className="homepage-features-list">
          <div className="homepage-feature-card">
            <div className="homepage-feature-icon">🤖</div>
            <h3>Intelligent & Adaptive AI</h3>
            <p>
              Context-aware responses, constantly learning to improve your
              experience.
            </p>
          </div>
          <div className="homepage-feature-card">
            <div className="homepage-feature-icon">⏱️</div>
            <h3>24/7 Availability</h3>
            <p>
              Real-time assistance anytime, ensuring reliability for teams and
              clients.
            </p>
          </div>
          
          <div className="homepage-feature-card">
            <div className="homepage-feature-icon">📈</div>
            <h3>Enhanced Efficiency</h3>
            <p>
              Automates tasks, provides actionable insights, and streamlines
              workflows.
            </p>
          </div>
          <div className="homepage-feature-card">
            <div className="homepage-feature-icon">🤝</div>
            <h3>User-Centric Design</h3>
            <p>
              Intuitive interface for all devices and user demographics.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="homepage-usecases-section">
        <h2 className="homepage-section-title">Use Cases</h2>
        <div className="homepage-usecases-list">
          {useCases.map((uc, index) => (
            <div
              key={index}
              className="homepage-usecase-card"
              title={uc.description}
            >
              {uc.emoji} {uc.title}
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="homepage-how-section">
        <h2 className="homepage-section-title">How It Works</h2>
        <div className="homepage-how-steps">
          <div className="homepage-step">1️⃣ Sign Up / Login</div>
          <div className="homepage-step">2️⃣ Ask Questions</div>
          <div className="homepage-step">3️⃣ Get Smart Responses</div>
          <div className="homepage-step">4️⃣ Track History</div>
          <div className="homepage-step">5️⃣ Export Results (Pro/Plus)</div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="homepage-testimonials-section">
        <h2 className="homepage-section-title">What Users Say</h2>
        <div className="homepage-testimonials-list">
          <blockquote>
            “This chatbot saved me hours of work every day.” – Student
          </blockquote>
          <blockquote>
            “Customer queries are solved instantly, boosting our productivity!” – Startup Founder
          </blockquote>
          <blockquote>
            “The AI integration helped our team automate repetitive tasks efficiently.” – Business Analyst
          </blockquote>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="homepage-pricing-section">
        <h2 className="homepage-section-title">Plans for Everyone</h2>
        <div className="homepage-pricing-list">
          <div className="homepage-pricing-card featured-plan">
            <h3>Free</h3>
            <p>Basic Features</p>
          </div>
          <div className="homepage-pricing-card most-popular">
            <h3>Pro</h3>
            <p>Advanced Features</p>
          </div>
          <div className="homepage-pricing-card">
            <h3>Enterprise</h3>
            <p>Full Customization</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="homepage-faq-section">
        <h2 className="homepage-section-title">FAQ</h2>
        <div className="homepage-faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`homepage-faq-item ${
                activeFAQ === index ? "active" : ""
              }`}
              onClick={() => toggleFAQ(index)}
            >
              <strong>{faq.question}</strong>
              {activeFAQ === index && <p>{faq.answer}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="homepage-cta-section">
        <h2>Ready to experience AI-driven conversations?</h2>
        <button
          className="homepage-btn homepage-get-started"
          onClick={() => navigate("/login")}
        >
          Get Started Now →
        </button>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <p>© 2025 AI ChatBot. All rights reserved.</p>
        <div className="homepage-footer-links">
          <a href="/about">About</a> | <a href="/contact">Contact</a> |{" "}
          <a href="/privacy">Privacy</a>
        </div>
      </footer>
    </main>
  );
}

export default Home;

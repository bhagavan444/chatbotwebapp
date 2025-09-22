import React from "react";
import "./About.css";

function About() {
  return (
    <main className="abt-main">
      {/* Hero Intro/Profile */}
      <section className="abt-hero">
        <div className="abt-hero-inner">
          <div className="abt-avatar-card">
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              alt="G S S S Bhagavan"
              className="abt-avatar"
            />
          </div>
          <div className="abt-intro">
            <h1 className="abt-name">
              G S S S Bhagavan
              <div className="abt-title">
                B.Tech (Artificial Intelligence & Data Science) | ChatBot Developer
              </div>
            </h1>
            <div className="abt-location">
              <span>Ramachandra College of Engineering,</span>
              <br />
              <span>Eluru, Andhra Pradesh, India</span>
            </div>
            <blockquote className="abt-quote">
              <span>“Committed to designing intelligent, user-centric conversational AI solutions that transform technology interaction.”</span>
            </blockquote>

            {/* Call-to-Action */}
            <a href="/chat" className="abt-cta-btn">Try the ChatBot</a>
          </div>
        </div>
      </section>

      {/* Skills / Tech Stack */}
      <section className="abt-card abt-skills-card">
        <h2 className="abt-section-title">Skills & Tech Stack</h2>
        <div className="abt-skills">
          <span className="abt-skill">React</span>
          <span className="abt-skill">Firebase</span>
          <span className="abt-skill">Flask</span>
          <span className="abt-skill">Python</span>
          <span className="abt-skill">TensorFlow</span>
          <span className="abt-skill">NLP</span>
          <span className="abt-skill">Data Analysis</span>
        </div>
      </section>

      {/* Project Story/Values */}
      <section className="abt-card abt-project-card">
        <h2 className="abt-section-title">About the ChatBot Project</h2>
        <p className="abt-description">
          This ChatBot project is the culmination of my academic expertise in Artificial Intelligence and Data Science, coupled with a professional commitment to solving real-world problems through innovative technology. Developed as a robust virtual assistant, it offers accessible, efficient, and intelligent support, designed to enhance user experience across diverse applications.
        </p>
        <ul className="abt-values">
          <li><span className="abt-value-icon">🤖</span> <strong>Innovative AI Solutions:</strong> Delivers precise, context-aware responses for optimal user assistance.</li>
          <li><span className="abt-value-icon">🧠</span> <strong>Adaptive Learning:</strong> Continuously evolves through iterative development to improve functionality and accuracy.</li>
          <li><span className="abt-value-icon">💬</span> <strong>Seamless Interaction:</strong> Provides intuitive, professional-grade conversational experiences available 24/7.</li>
          <li><span className="abt-value-icon">🔐</span> <strong>Data Security:</strong> Ensures robust privacy and security protocols in every user interaction.</li>
        </ul>
      </section>

      {/* Timeline / Milestones */}
      <section className="abt-card abt-timeline-card">
        <h2 className="abt-section-title">Project Timeline</h2>
        <ul className="abt-timeline">
          <li><strong>Week 1:</strong> Dataset collection & preprocessing</li>
          <li><strong>Week 2:</strong> Model training with MobileNetV2</li>
          <li><strong>Week 3:</strong> Flask backend & React frontend integration</li>
          <li><strong>Week 4:</strong> UI improvements & deployment</li>
        </ul>
      </section>

      {/* Mission & Contact "Profile" card */}
      <section className="abt-card abt-personal-card">
        <h2 className="abt-section-title">Professional Mission</h2>
        <p className="abt-description">
          My mission is to harness the power of AI to create impactful, user-focused solutions that bridge the gap between technology and human needs. As an aspiring developer, I aim to develop cutting-edge tools that drive innovation, enhance productivity, and contribute positively to the global tech ecosystem.
        </p>
        <div className="abt-profile">
          <div><strong>Name:</strong> G S S S Bhagavan</div>
          <div><strong>Role:</strong> B.Tech Student, AI & Data Science Specialist</div>
          <div><strong>Institution:</strong> Ramachandra College of Engineering</div>
          <div><strong>Location:</strong> Eluru, Andhra Pradesh, India</div>
          <div className="abt-contact-links">
            <a href="https://github.com/YourGitHub" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/YourLinkedIn" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;

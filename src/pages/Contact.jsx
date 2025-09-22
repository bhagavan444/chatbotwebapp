import React from "react";
import "./Contact.css";

function Contact() {
  return (
    <main className="contact-main">
      <section className="contact-card">
        <h1 className="contact-title">
          <span className="contact-emoji">📬</span> Professional Contact
        </h1>
        <p className="contact-intro">
          I welcome opportunities for collaboration, inquiries, or professional discussions. <br />
          <span className="contact-highlight">Please feel free to reach out at your convenience.</span>
        </p>
        
        <div className="contact-methods">
          <a className="contact-method" href="tel:+917569205626" aria-label="Call +91 7569205626">
            <span className="contact-icon">📞</span>
            <span className="contact-details">+91 7569205626</span>
          </a>
          <a className="contact-method" href="mailto:g.sivasatyasaibhagavan@gmail.com" aria-label="Email g.sivasatyasaibhagavan@gmail.com">
            <span className="contact-icon">✉️</span>
            <span className="contact-details">g.sivasatyasaibhagavan@gmail.com</span>
          </a>
        </div>

        <div className="contact-socials">
          <a
            href="https://github.com/bhagavan444"
            className="contact-social-btn github"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
          >
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" />
            <span className="contact-social-text">GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/bhagavan444"
            className="contact-social-btn linkedin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
          >
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" />
            <span className="contact-social-text">LinkedIn</span>
          </a>
        </div>
      </section>
    </main>
  );
}

export default Contact;


import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; 

const HomePage: React.FC = () => {
  return (
    <div className="homepage-container">
      <section className="hero-section">
        <h1 className="hero-title">
          Bienvenidos a los <span className="award-name">Marrino Awards</span>
        </h1>
        <p className="hero-subtitle">
          Celebrando la comunidad marrina durante el año
        </p>
        <div className="hero-actions">
          <Link to="/votacion" className="hero-button">
            Votar
          </Link>
          <Link to="/categorias" className="hero-button outline-button">
            Categorías Marrinas
          </Link>
        </div>
      </section>

      <section className="about-awards-section">
        <div className="about-content">
          <h2>¿Qué son los Marrino Awards?</h2>
          <p>
            Los Marrino Awards son nuestra forma de reconocer y celebrar los mejores momentos del año a nivel marrino. 
            Desde las decisiones más 1/michi hasta las
            anécdotas más N , aquí premiamos las hazañas que han marcado nuestros días.
          </p>
          <p>
            Es un tributo a la comunidad marrina, donde votaremos al mejor o peor de cada categoria del año
          </p>
        </div>
        <div className="image-placeholder">
          {}
        </div>
      </section>

      {}
    </div>
  );
};

export default HomePage;
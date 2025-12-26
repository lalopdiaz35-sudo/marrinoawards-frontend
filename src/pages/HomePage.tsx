

import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; 

const HomePage: React.FC = () => {
  return (
    <div className="homepage-container">
      <section className="hero-section">
        <h1 className="hero-title">
          Bienvenidos a los <span className="award-name">Marrino Awards 2025</span>
        </h1>
        <p className="hero-subtitle">
          Premios a todos los marrinos por sus logros este año
        </p>
        <div className="hero-actions">
          <Link to="/votacion" className="hero-button">
            Votar
          </Link>
          <Link to="/categorias" className="hero-button outline-button">
            Categorías Marrino Awards
          </Link>
        </div>
      </section>

      <section className="about-awards-section">
        <div className="about-content">
          <h2>¿Qué son los Marrino Awards?</h2>
          <p>
            Los Marrino Awards son nuestra forma de reconocer a cada marrino por sus logros en el año 
            o en algunos casos premios a la mediocridad , desde crecimeindo personal , academico , laboral o lo 
            que chingados sea , hay premios para todos.
            
          </p>
          <p>
            En este año se agrego una pagina web para inmortalizar las hazañas de todos los marrinos.
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
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; 


const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" onClick={() => setIsOpen(false)}>🏆 MARRINO AWARDS</Link>
            </div>
            
            <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
                {isOpen ? '✕' : '☰'}
            </button>

            <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
                <li>
                    <Link to="/" onClick={() => setIsOpen(false)}>Inicio</Link>
                </li>
                <li>
                    <Link to="/categorias" onClick={() => setIsOpen(false)}>Categorías</Link>
                </li>
                <li>
                    <Link to="/participantes" onClick={() => setIsOpen(false)}>Participantes</Link>
                </li>
                
                <li>
                    <Link to="/resultados" onClick={() => setIsOpen(false)}>📊 Resultados</Link>
                </li>
                
                <li className="nav-item-votar">
                    <Link to="/votacion" onClick={() => setIsOpen(false)}>Votar</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
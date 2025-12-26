import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';  

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleResultadosClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsOpen(false);

        const fechaApertura = new Date('2025-12-28T01:00:00');
        const ahora = new Date();

        if (ahora >= fechaApertura) {
            navigate("/resultados");
        } else {
            const diferencia = fechaApertura.getTime() - ahora.getTime();
            const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
            const minutos = Math.floor((diferencia / (1000 * 60)) % 60);

            const mensajeTiempo = `Faltan ${dias}d ${horas}h ${minutos}m para la gran revelación.`;
            
            const password = prompt(
                `${mensajeTiempo}\n\nLos resultados están bloqueados hasta el 28 de diciembre a la 1:00 AM.\n\nSolo el administrador puede verlos antes. Introduce la contraseña:`
            );

            if (password === "meridiano10") {
                navigate("/resultados");
            } else if (password !== null) {
                alert("❌ Contraseña incorrecta o acceso aún no disponible.");
            }
        }
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
                <li><Link to="/" onClick={() => setIsOpen(false)}>Inicio</Link></li>
                <li><Link to="/categorias" onClick={() => setIsOpen(false)}>Categorías</Link></li>
                <li><Link to="/participantes" onClick={() => setIsOpen(false)}>Participantes</Link></li>
                <li>
                    <Link to="/resultados" onClick={handleResultadosClick}>📊 Resultados</Link>
                </li>
                <li className="nav-item-votar">
                    <Link to="/votacion" onClick={() => setIsOpen(false)}>Votar</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
import React from 'react';
import './LoginPage.css';


const LoginPage: React.FC = () => {

    const handleGoogleLogin = async () => {
        try {
            
            console.log("Login de Google simulado exitoso.");

            localStorage.setItem('MarrinoAuthToken', 'true');
            window.location.href = '/votacion';
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
            alert("No se pudo iniciar sesión. Por favor, inténtalo de nuevo.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Inicia Sesión para Votar 🗳️</h1>
                <p className="login-subtitle">
                    Tu autenticación con Google asegura un voto único y legítimo para los Marrino Awards.
                </p>
                
                <button 
                    className="google-login-button" 
                    onClick={handleGoogleLogin}
                >
                    <img 
                        src="/google-logo.svg" 
                        alt="Google logo" 
                        className="google-icon"
                    />
                    Continuar con Google
                </button>

                <p className="login-note">
                    Al continuar, aceptas las reglas de votación de los Marrino Awards.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
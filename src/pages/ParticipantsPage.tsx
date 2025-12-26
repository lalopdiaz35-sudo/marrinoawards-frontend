import React, { useState, useEffect } from 'react';
import './ParticipantsPage.css';
import axios from 'axios'; 

const API_BASE_URL = 'https://marrinoawards-api.vercel.app/api'; 

interface ParticipantType {
    _id: string; 
    name: string;
    nickname: string;
    occupation: string;
    specialAbility: string;
    imageUrl: string;
}

interface ImageModalProps {
    imageUrl: string;
    title: string;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, title, onClose }) => (
    <div className="image-modal-overlay" onClick={onClose}>
        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={onClose}>×</button>
            <img 
                src={imageUrl} 
                alt={`Imagen ampliada de ${title}`} 
                className="modal-image"
            />
            <div className="modal-caption">{title}</div>
        </div>
    </div>
);


interface ParticipantCardProps {
    participant: ParticipantType;
    onImageClick: (participant: ParticipantType) => void; 
}


const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, onImageClick }) => (
    <div className="participant-card">
        <div 
            className="card-image-wrapper"
            onClick={() => onImageClick(participant)} 
        >
            <img 
                src={participant.imageUrl} 
                alt={`Foto de ${participant.name}`} 
                className="participant-image"
            />
        </div>
        <div className="card-info">
            <h2 className="participant-nickname">{participant.nickname}</h2>
            <p className="participant-name">{participant.name}</p>
            
            <div className="details-section">
                <p><strong>Ocupación:</strong> {participant.occupation}</p>
                <p><strong>Habilidad Especial:</strong> {participant.specialAbility}</p>
            </div>
        </div>
    </div>
);


const ParticipantsPage: React.FC = () => {
    const [participants, setParticipants] = useState<ParticipantType[]>([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<ParticipantType | null>(null);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/participantes`);
                setParticipants(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching participants:", err);
                setError('No se pudieron cargar los participantes. ¿Está el backend corriendo?');
                setLoading(false);
            }
        };

        fetchParticipants();
    }, []); 

    const handleImageClick = (participant: ParticipantType) => {
        setSelectedImage(participant);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    if (loading) {
        return <div className="participants-container"><p>Cargando participantes...</p></div>;
    }

    if (error) {
        return <div className="participants-container"><p style={{color: 'red', fontWeight: 'bold'}}>{error}</p></div>;
    }


    return (
        <div className="participants-container">
            <header className="page-header">
                <h1>✨ Nuestros Marrinos Participantes ✨</h1>
                <p>Conoce a los nominados de este año y sus grandes hazañas.</p>
            </header>

            <div className="participants-grid">
                {participants.map(p => (
                    <ParticipantCard 
                        key={p._id} 
                        participant={p}
                        onImageClick={handleImageClick}
                    />
                ))}
            </div>
            
            {selectedImage && (
                <ImageModal
                    imageUrl={selectedImage.imageUrl}
                    title={selectedImage.nickname}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default ParticipantsPage;
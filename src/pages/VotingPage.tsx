import React, { useState, useMemo, useEffect } from 'react';
import './VotingPage.css';
import axios from 'axios';

const API_BASE_URL = "https://marrinoawards-api.vercel.app/api";
const API_VOTES_URL = `${API_BASE_URL}/votos`;
const API_PARTICIPANTS_URL = `${API_BASE_URL}/participantes`;
const API_CATEGORIES_URL = `${API_BASE_URL}/categorias`;
const OPEN_ENDED_CATEGORIES = ["Top pendejito externo", "Mejor momento del año"]; 

interface CategoryType {
    _id: string;
    name: string;
}

interface ParticipantType {
    _id: string;
    nickname: string;
}

type Votes = { 
    [categoryId: string]: string | null; 
};

interface OpenEndedInputProps {
    categoryId: string;
    initialValue: string;
    onTextChange: (categoryId: string, textValue: string) => void;
    categoryName: string;
}

const OpenEndedInput: React.FC<OpenEndedInputProps> = ({ categoryId, initialValue, onTextChange, categoryName }) => {
    const [localValue, setLocalValue] = useState(initialValue);
    
    useEffect(() => {
        setLocalValue(initialValue);
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        onTextChange(categoryId, newValue); 
    };

    return (
        <div className="open-ended-input-group">
            <label htmlFor={`vote-text-${categoryId}`}>Tu Nominación / Voto Personal</label>
            <textarea
                id={`vote-text-${categoryId}`}
                value={localValue}
                onChange={handleChange}
                placeholder={`Escribe tu nominado para ${categoryName} (máx. 255 caracteres)`}
                maxLength={255}
                required
                rows={3}
                className="open-ended-textarea"
            />
        </div>
    );
};

interface VotingCategorySectionProps {
    category: CategoryType;
    index: number;
    votes: Votes;
    participants: ParticipantType[];
    handleClosedVote: (categoryId: string, participantId: string) => void;
    handleOpenVote: (categoryId: string, textValue: string) => void;
}

const VotingCategorySection: React.FC<VotingCategorySectionProps> = ({ category, index, votes, participants, handleClosedVote, handleOpenVote }) => {
    const rawVoteValue = votes[category._id];
    const voteValue: string = rawVoteValue === null || rawVoteValue === undefined ? '' : rawVoteValue; 
    
    const isOpenEnded = OPEN_ENDED_CATEGORIES.includes(category.name);

    const getParticipantNickname = (id: string): string => {
        if (!id) return '';
        const participant = participants.find(p => p._id === id); 
        return participant ? participant.nickname : 'Desconocido';
    };

    return (
        <div className="voting-section">
            <div className="category-header-vote">
                <span className="category-number">{index}</span> 
                <h2 className="category-title-vote">{category.name}</h2>
            </div>

            {isOpenEnded ? (
                <OpenEndedInput
                    categoryId={category._id}
                    initialValue={voteValue}
                    onTextChange={handleOpenVote}
                    categoryName={category.name}
                />
            ) : (
                <ul className="participant-radio-list">
                    {participants.map(p => (
                        <li 
                            key={p._id}
                            className={`participant-list-item ${voteValue === p._id ? 'selected' : ''}`}
                            onClick={() => handleClosedVote(category._id, p._id)} 
                        >
                            <span className="participant-name-vote">{p.nickname}</span>
                            
                            <input
                                type="radio"
                                name={`vote-${category._id}`} 
                                value={p._id} 
                                checked={voteValue === p._id}
                                onChange={() => handleClosedVote(category._id, p._id)} 
                            />
                        </li>
                    ))}
                </ul>
            )}
            
            <div className="vote-status">
                {isOpenEnded 
                    ? (voteValue ? `¡Respuesta registrada: "${voteValue.substring(0, 30)}${voteValue.length > 30 ? '...' : ''}"` : 'Aún no has escrito tu voto.')
                    : (voteValue ? `¡Voto registrado para ${getParticipantNickname(voteValue)}!` : 'Aún no has votado en esta categoría.')
                }
            </div>
        </div>
    );
};

const MemoizedVotingCategorySection = React.memo(VotingCategorySection);


const VotingPage: React.FC = () => {
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [participants, setParticipants] = useState<ParticipantType[]>([]);

    const [email, setEmail] = useState('');
    const [votes, setVotes] = useState<Votes>({});
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingParticipants, setLoadingParticipants] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const categoriesPerPage = 3;
    const [currentPage, setCurrentPage] = useState(1);
    
    const totalPages = Math.ceil(categories.length / categoriesPerPage);

    const currentCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * categoriesPerPage;
        const endIndex = startIndex + categoriesPerPage;
        return categories.slice(startIndex, endIndex);
    }, [currentPage, categories]); 

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(API_CATEGORIES_URL);
                setCategories(response.data);
            } catch (err) {
                console.error("Error al obtener categorías:", err);
                setError('❌ No se pudieron cargar las categorías. Verifica la API.');
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await axios.get(API_PARTICIPANTS_URL);
                setParticipants(response.data);
            } catch (err) {
                console.error("Error al obtener participantes:", err);
                setError(prev => prev || '❌ No se pudieron cargar los participantes. Verifica la API.');
            } finally {
                setLoadingParticipants(false);
            }
        };

        fetchParticipants();
    }, []);
    
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                if (!message.startsWith('⚠️')) {
                    setMessage(null);
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const validateEmail = (): boolean => {
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setMessage("🚨 ¡CORREO REQUERIDO! Por favor Marrano, introduce un correo válido en la primera página para poder votar");
            return false;
        }
        setMessage(null);
        return true;
    };
    
    const goToPage = (pageNumber: number) => {
        if (currentPage === 1 && pageNumber > 1 && !validateEmail()) {
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
            return; 
        }

        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }
    };
    
    const handleClosedVote = (categoryId: string, participantId: string) => {
        setVotes(prevVotes => ({
            ...prevVotes,
            [categoryId]: participantId,
        }));
    };
    
    const handleOpenVote = (categoryId: string, textValue: string) => {
        setVotes(prevVotes => ({
            ...prevVotes,
            [categoryId]: textValue,
        }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting) return; 
        setIsSubmitting(true);
        
        if (!validateEmail()) {
            setIsSubmitting(false);
            return;
        }

        const totalCategories = categories.length; 
        const votedCount = Object.keys(votes).length;
        
        const allVotesAreValid = categories.every(cat => {
            const voteValue = votes[cat._id];
            
            if (OPEN_ENDED_CATEGORIES.includes(cat.name)) {
                return typeof voteValue === 'string' && voteValue.trim() !== '';
            }
            return typeof voteValue === 'string' && voteValue !== ''; 
        });


        if (votedCount < totalCategories || !allVotesAreValid) {
            setMessage(`🚨 ¡Atención! Solo has votado en ${votedCount} de ${totalCategories} categorías o hay campos de texto vacíos. ¡Vota en todas para enviar!`);
            setIsSubmitting(false);
            return;
        }

        const finalData = { 
            email, 
            votes, 
            timestamp: new Date().toISOString() 
        };

        try {
            const response = await fetch(API_VOTES_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            });
            
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 409) { 
                    setMessage(`⚠️ ¡VOTO DUPLICADO! El correo ${email} ya ha emitido su voto.`);
                } else {
                    throw new Error(result.message || 'Error desconocido al enviar voto.');
                }
            } else {
                setMessage("✅ ¡VOTOS ENVIADOS! Gracias por participar en los Marrino Awards");
            }

        } catch (error) {
            console.error("Error al enviar el voto:", error);
            setMessage("🔴 ERROR DE CONEXIÓN. Hubo un error al enviar el voto.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const allVotesAreValid = categories.every(cat => {
        const voteValue = votes[cat._id];
        
        if (OPEN_ENDED_CATEGORIES.includes(cat.name)) {
            return typeof voteValue === 'string' && voteValue.trim() !== '';
        }
        return typeof voteValue === 'string' && voteValue !== ''; 
    });


    const PaginationControls: React.FC = () => (
        <div className="pagination-controls numeric">
            {categories.length > 0 && Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
                <button
                    key={pageNumber}
                    type="button"
                    onClick={() => goToPage(pageNumber)}
                    disabled={isSubmitting || loadingCategories || loadingParticipants || pageNumber === currentPage}
                    className={`page-number-button ${pageNumber === currentPage ? 'active' : ''}`}
                >
                    {pageNumber}
                </button>
            ))}
        </div>
    );


    if (loadingCategories || loadingParticipants) {
        return <div className="voting-container"><p>⏳ Cargando datos para la votación...</p></div>;
    }

    if (error) {
        return <div className="voting-container"><p style={{color: 'red', fontWeight: 'bold'}}>{error}</p></div>;
    }
    
    if (categories.length === 0 || participants.length === 0) {
        return <div className="voting-container"><p style={{color: 'orange'}}>⚠️ Faltan datos: Asegúrate de que haya categorías ({categories.length}) y participantes ({participants.length}) en la base de datos.</p></div>;
    }
    
    return (
        <div className="voting-container">
            {message && (
                <div className={`toast-notification ${message.includes('🚨') || message.includes('⚠️') || message.includes('🔴') ? 'error' : 'success'}`}>
                    {message}
                    <button onClick={() => setMessage(null)} className="toast-close-button">×</button>
                </div>
            )}
            
            <header className="page-header">
                <h1> Vota para decidir ganadores de cada categoria de los Marrino Awards 2025</h1>
                <p>Tu voto es único. Navega por las {categories.length} categorías</p>
                <div className="pagination-info">Página {currentPage} de {totalPages}</div>
            </header>

            <form onSubmit={handleSubmit}>
                {currentPage === 1 && (
                    <div className="email-input-group">
                        <label htmlFor="email">Tu Correo Electrónico (correo valido y nomas uno pendejo )</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@marrino.com"
                            required
                            disabled={isSubmitting}
                            onBlur={() => currentPage === 1 && validateEmail()} 
                        />
                    </div>
                )}
                
                <PaginationControls />

                {currentCategories.map((category, index) => {
                    const realIndex = (currentPage - 1) * categoriesPerPage + index + 1;
                    return (
                        <MemoizedVotingCategorySection 
                            key={category._id} 
                            category={category}
                            index={realIndex}
                            votes={votes}
                            participants={participants}
                            handleClosedVote={handleClosedVote}
                            handleOpenVote={handleOpenVote}
                        />
                    );
                })}
                
                <PaginationControls />

                {currentPage === totalPages && (
                    <>
                        <button 
                            type="submit" 
                            className="submit-button-vote"
                            disabled={!allVotesAreValid || isSubmitting} 
                        >
                            {isSubmitting
                                ? 'Enviando Votos...'
                                : !allVotesAreValid
                                    ? `Votar (${Object.keys(votes).length} / ${categories.length} completado)`
                                    : 'ENVIAR VOTOS FINALES'
                            }
                        </button>
                        <p className="final-note">Asegúrate de haber seleccionado o escrito un voto en todas las categorías antes de enviar.</p>
                    </>
                )}
            </form>
        </div>
    );
};

export default VotingPage;
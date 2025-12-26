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
    description?: string;
    imageUrl?: string;
}

interface ParticipantType {
    _id: string;
    nickname: string;
    imageUrl?: string;
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
                <div className="category-image-vote-container">
                     <img 
                        src={category.imageUrl || "/category-default.jpg"} 
                        alt={category.name} 
                        className="category-image-vote" 
                    />
                </div>
                <div className="category-text-info">
                    <span className="category-number">Categoría {index}</span> 
                    <h2 className="category-title-vote">{category.name}</h2>
                    {category.description && <p className="category-desc-vote">{category.description}</p>}
                </div>
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
                            <div className="participant-info-vote">
                                <div className="participant-avatar-vote-container">
                                    <img 
                                        src={p.imageUrl || "/default-avatar.png"} 
                                        alt={p.nickname} 
                                        className="participant-avatar-vote" 
                                    />
                                </div>
                                <span className="participant-name-vote">{p.nickname}</span>
                            </div>
                            
                            <input
                                type="radio"
                                name={`vote-${category._id}`} 
                                value={p._id} 
                                checked={voteValue === p._id}
                                readOnly
                            />
                        </li>
                    ))}
                </ul>
            )}
            
            <div className="vote-status">
                {isOpenEnded 
                    ? (voteValue ? `📝 Respuesta lista` : 'Aún no has escrito tu voto.')
                    : (voteValue ? `✅ Seleccionado: ${getParticipantNickname(voteValue)}` : 'Aún no has votado en esta categoría.')
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
                setMessage('❌ No se pudieron cargar las categorías.');
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
                setMessage('❌ No se pudieron cargar los participantes.');
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
            setMessage("🚨 ¡CORREO REQUERIDO! Por favor introduce un correo válido.");
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
        setVotes(prevVotes => ({ ...prevVotes, [categoryId]: participantId }));
    };
    
    const handleOpenVote = (categoryId: string, textValue: string) => {
        setVotes(prevVotes => ({ ...prevVotes, [categoryId]: textValue }));
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
            setMessage(`🚨 ¡Atención! Solo has votado en ${votedCount} de ${totalCategories} categorías.`);
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(API_VOTES_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, votes, timestamp: new Date().toISOString() }),
            });
            
            if (!response.ok) {
                if (response.status === 409) { 
                    setMessage(`⚠️ ¡VOTO DUPLICADO! El correo ${email} ya ha votado.`);
                } else {
                    throw new Error('Error al enviar voto.');
                }
            } else {
                setMessage("✅ ¡VOTOS ENVIADOS! Gracias por participar.");
            }
        } catch (error) {
            setMessage("🔴 ERROR DE CONEXIÓN.");
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
                    disabled={isSubmitting || pageNumber === currentPage}
                    className={`page-number-button ${pageNumber === currentPage ? 'active' : ''}`}
                >
                    {pageNumber}
                </button>
            ))}
        </div>
    );

    if (loadingCategories || loadingParticipants) return <div className="voting-container"><p>⏳ Cargando...</p></div>;

    return (
        <div className="voting-container">
            {message && (
                <div className={`toast-notification ${message.includes('🚨') || message.includes('⚠️') || message.includes('🔴') || message.includes('❌') ? 'error' : 'success'}`}>
                    {message}
                    <button onClick={() => setMessage(null)} className="toast-close-button">×</button>
                </div>
            )}
            
            <header className="page-header">
                <h1>Marrino Awards 2025</h1>
                <p>Navega por las {categories.length} categorías</p>
                <div className="pagination-info">Página {currentPage} de {totalPages}</div>
            </header>

            <form onSubmit={handleSubmit}>
                {currentPage === 1 && (
                    <div className="email-input-group">
                        <label htmlFor="email">Tu Correo Electrónico</label>
                        <input 
                            type="email" id="email" value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@marrino.com" required
                            disabled={isSubmitting}
                        />
                    </div>
                )}
                
                <PaginationControls />

                {currentCategories.map((category, index) => (
                    <MemoizedVotingCategorySection 
                        key={category._id} 
                        category={category}
                        index={(currentPage - 1) * categoriesPerPage + index + 1}
                        votes={votes}
                        participants={participants}
                        handleClosedVote={handleClosedVote}
                        handleOpenVote={handleOpenVote}
                    />
                ))}
                
                <PaginationControls />

                {currentPage === totalPages && (
                    <div className="submit-section">
                        <button 
                            type="submit" 
                            className="submit-button-vote"
                            disabled={!allVotesAreValid || isSubmitting} 
                        >
                            {isSubmitting ? 'Enviando...' : 'ENVIAR VOTOS FINALES'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default VotingPage;
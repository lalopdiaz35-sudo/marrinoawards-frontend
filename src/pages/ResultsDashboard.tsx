import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './ResultsDashboard.css';

const API_BASE_URL = "https://marrinoawards-api.vercel.app/api";
const API_CATEGORIES_URL = `${API_BASE_URL}/categorias`;
const API_PARTICIPANTS_URL = `${API_BASE_URL}/participantes`;
const API_RESULTS_URL = `${API_BASE_URL}/resultados`;
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

interface AggregationResult {
    _id: { categoryId: string; participantId: string; };
    count: number;
}

interface CategoryResult {
    categoryName: string;
    categoryDescription: string;
    categoryImage: string;
    totalVotes: number;
    participants: {
        nickname: string;
        votes: number;
        percentage: number;
        userImage: string;
    }[];
    isOpenEnded: boolean;
}

const ResultsDashboard: React.FC = () => {
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [participants, setParticipants] = useState<ParticipantType[]>([]);
    const [rawResults, setRawResults] = useState<AggregationResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, participantsRes, resultsRes] = await Promise.all([
                    axios.get(API_CATEGORIES_URL),
                    axios.get(API_PARTICIPANTS_URL),
                    axios.get(API_RESULTS_URL)
                ]);
                setCategories(categoriesRes.data);
                setParticipants(participantsRes.data);
                setRawResults(resultsRes.data);
            } catch (err) {
                setError('❌ Error al cargar los resultados.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const dashboardData: CategoryResult[] = useMemo(() => {
        if (rawResults.length === 0 || categories.length === 0 || participants.length === 0) {
            return [];
        }

        const categoryMap = new Map(categories.map(c => [
            c._id, 
            { name: c.name, img: c.imageUrl, desc: c.description || "" }
        ]));
        
        const participantMap = new Map(participants.map(p => [
            p._id, 
            { nickname: p.nickname, img: p.imageUrl }
        ]));
        
        const groupedResults = new Map<string, { total: number, participants: { id: string, count: number }[] }>();

        for (const result of rawResults) {
            const catId = result._id.categoryId;
            if (!groupedResults.has(catId)) {
                groupedResults.set(catId, { total: 0, participants: [] });
            }
            const categoryEntry = groupedResults.get(catId)!;
            categoryEntry.total += result.count;
            categoryEntry.participants.push({ id: result._id.participantId, count: result.count });
        }

        return Array.from(groupedResults.entries()).map(([catId, data]) => {
            const catInfo = categoryMap.get(catId);
            const categoryName = catInfo?.name || "Desconocida";
            const isOpenEnded = OPEN_ENDED_CATEGORIES.includes(categoryName);

            return {
                categoryName: categoryName,
                categoryDescription: catInfo?.desc || "Sin descripción disponible.",
                categoryImage: catInfo?.img || "/category-default.jpg",
                totalVotes: data.total,
                isOpenEnded: isOpenEnded,
                participants: data.participants
                    .map(p => {
                        const pInfo = participantMap.get(p.id);
                        return {
                            nickname: isOpenEnded ? p.id : pInfo?.nickname || "Anónimo",
                            userImage: pInfo?.img || "/default-avatar.png", 
                            votes: p.count,
                            percentage: (p.count / data.total) * 100
                        };
                    })
                    .sort((a, b) => b.votes - a.votes)
            };
        });
    }, [rawResults, categories, participants]);

    const currentCategory = dashboardData[currentPage - 1];

    if (loading) return <div className="dashboard-container"><p>⏳ Cargando resultados...</p></div>;
    if (error) return <div className="dashboard-container"><p>{error}</p></div>;
    if (dashboardData.length === 0) return <div className="dashboard-container"><p>No hay resultados disponibles.</p></div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Ganadores Marrino Awards 2025</h1>
                <p>Categoría {currentPage} de {dashboardData.length}</p>
            </header>

            <div 
                className={`category-card ${showResults ? 'card-expanded' : 'card-collapsed'}`}
                onClick={() => setShowResults(!showResults)}
            >
                <div className="category-info-wrapper">
                    <div className="category-image-container">
                        <img 
                            src={currentCategory.categoryImage} 
                            alt={currentCategory.categoryName} 
                            className="category-image" 
                        />
                    </div>
                    <h2 className="category-title">{currentCategory.categoryName}</h2>
                    
                    <p className="category-description-text">
                        {currentCategory.categoryDescription}
                    </p>

                    {!showResults && <p className="click-prompt">Haz clic para revelar resultados</p>}
                </div>

                {showResults && (
                    <div className="results-list">
                        {currentCategory.participants.map((p, index) => (
                            <div key={index} className={`participant-result ${index === 0 ? 'winner' : ''}`}>
                                <span className="rank">{index + 1}.</span>
                                
                                <div className="participant-avatar-container">
                                    <img 
                                        src={p.userImage} 
                                        alt={p.nickname} 
                                        className="participant-avatar" 
                                    />
                                </div>

                                <span className="name">{p.nickname}</span>
                                
                                <div className="bar-container">
                                    <div 
                                        className="vote-bar" 
                                        style={{ width: `${p.percentage}%` }}
                                    ></div>
                                </div>
                                
                                <span className="vote-count">
                                    <strong>{p.votes}</strong> {p.votes === 1 ? 'voto' : 'votos'}
                                </span>
                                
                                {index === 0 && <span className="trophy">🏆</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="pagination-controls">
                <button 
                    onClick={() => {setCurrentPage(p => p - 1); setShowResults(false)}} 
                    disabled={currentPage === 1}
                >
                    Anterior
                </button>
                <span>{currentPage} / {dashboardData.length}</span>
                <button 
                    onClick={() => {setCurrentPage(p => p + 1); setShowResults(false)}} 
                    disabled={currentPage === dashboardData.length}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default ResultsDashboard;
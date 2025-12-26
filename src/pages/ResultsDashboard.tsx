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
}

interface ParticipantType {
    _id: string;
    nickname: string;
}

interface AggregationResult {
    _id: {
        categoryId: string;
        participantId: string;
    };
    count: number;
}

interface CategoryResult {
    categoryName: string;
    totalVotes: number;
    participants: {
        nickname: string;
        votes: number;
        percentage: number;
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
                console.error("Error al cargar datos del dashboard:", err);
                setError('❌ Error al cargar los resultados. Asegúrate de que todas las APIs estén funcionando.');
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

        const categoryMap = new Map(categories.map(c => [c._id, c.name]));
        const participantMap = new Map(participants.map(p => [p._id, p.nickname]));
          const groupedResults = new Map<string, { total: number, participants: { id: string, count: number }[] }>();

        for (const result of rawResults) {
            const catId = result._id.categoryId;
            const partId = result._id.participantId;
            const count = result.count;

            if (!groupedResults.has(catId)) {
                groupedResults.set(catId, { total: 0, participants: [] });
            }

            const categoryEntry = groupedResults.get(catId)!;
            categoryEntry.total += count;
            categoryEntry.participants.push({ id: partId, count: count });
        }

         const finalResults: CategoryResult[] = [];
        for (const [catId, data] of groupedResults.entries()) {
            const categoryName = categoryMap.get(catId) || `Categoría ID: ${catId}`;
            const isOpenEnded = OPEN_ENDED_CATEGORIES.includes(categoryName);

            const processedParticipants = data.participants
                .map(p => {
                    const nicknameOrText = isOpenEnded
                        ? p.id
                        : participantMap.get(p.id) || `Participante ID: ${p.id}`;

                    return {
                        nickname: nicknameOrText,
                        votes: p.count,
                        percentage: (p.count / data.total) * 100
                    };
                })
                .sort((a, b) => b.votes - a.votes);

            finalResults.push({
                categoryName: categoryName,
                totalVotes: data.total,
                participants: processedParticipants,
                isOpenEnded: isOpenEnded,
            });
        }
        return finalResults;    
    }, [rawResults, categories, participants]);

    const totalPages = dashboardData.length;
    const currentCategory = dashboardData[currentPage - 1];

    const handlePageChange = (direction: 'next' | 'prev') => {
        setShowResults(false);
        if (direction === 'next') {
            setCurrentPage(prev => Math.min(totalPages, prev + 1));
        } else {
            setCurrentPage(prev => Math.max(1, prev - 1));
        }
    };  

    if (loading) return <div className="dashboard-container"><p>⏳ Cargando resultados...</p></div>;
    if (error) return <div className="dashboard-container"><p className="error-message">{error}</p></div>;
    if (dashboardData.length === 0) return <div className="dashboard-container"><p>⚠️ No hay datos registrados.</p></div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>📊 Resultados Marrino Awards 2025</h1>
                <p>Análisis de votos: Categoría {currentPage} de {totalPages}</p>
                <div className="total-votes-summary">
                    Votos en esta categoría: <strong>{currentCategory.totalVotes}</strong>
                </div>
            </header>

            <div 
                className={`category-card ${showResults ? 'card-expanded' : 'card-collapsed'}`}
                onClick={() => setShowResults(!showResults)}
            >   
                {/* Contenedor centralizado para título y mensaje */}
                <div className="category-info-wrapper">
                    <h2 className="category-title">{currentCategory.categoryName}</h2>
                    
                    {!showResults && (
                        <div className="click-prompt">
                            <p>Haz clic para revelar la clasificación de esta categoría</p>
                        </div>
                    )}
                </div>

                {showResults && (
                    <div className="results-list">
                        {currentCategory.participants.map((p, index) => (
                            <div key={p.nickname + index} className={`participant-result ${index === 0 ? 'winner' : ''}`}>
                                <span className="rank">{index + 1}.</span>
                                <span className="name">
                                    {currentCategory.isOpenEnded && p.nickname.length > 50
                                        ? p.nickname.substring(0, 50) + '...'
                                        : p.nickname
                                    }
                                </span>
                                <div className="bar-container">
                                    <div 
                                        className="vote-bar" 
                                        style={{ width: `${p.percentage.toFixed(1)}%` }}
                                    ></div>
                                </div>
                                <span className="vote-count">
                                    <strong>{p.votes}</strong> ({p.percentage.toFixed(1)}%)
                                </span>
                                {index === 0 && <span className="trophy">🏆</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="pagination-controls">
                <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>
                    &larr; Anterior
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages}>
                    Siguiente &rarr;
                </button>
            </div>
        </div>
    );
};

    export default ResultsDashboard;
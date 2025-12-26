import React, { useState, useEffect } from 'react';
import './CategoriesPage.css';
import axios from 'axios';

const API_BASE_URL = 'https://marrinoawards-api.vercel.app/api'; 

interface CategoryType {
    _id: string;
    name: string;
    description: string;
    imageUrl: string;
}

interface ImageModalProps {
    imageUrl: string;
    name: string;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, name, onClose }) => {
    return (
        <div className="image-modal-overlay" onClick={onClose}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>×</button>
                <img 
                    src={imageUrl} 
                    alt={`Imagen ampliada de ${name}`} 
                    className="modal-image"
                />
                <div className="modal-caption">{name}</div>
            </div>
        </div>
    );
};

interface CategoryCardProps {
    category: CategoryType;
    onImageClick: (category: CategoryType) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onImageClick }) => (
    <div className="category-card" onClick={() => onImageClick(category)}>
        <div className="card-content">
            <h3 className="card-title">{category.name}</h3> 
            <p className="card-description">{category.description}</p>
        </div>
        <div className="card-image-container">
            <img 
                src={category.imageUrl} 
                alt={`Imagen relacionada con ${category.name}`} 
                className="card-image"
            />
        </div>
    </div>
);


const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedImage, setSelectedImage] = useState<CategoryType | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/categorias`);
                setCategories(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError('No se pudieron cargar las categorías. Verifica la conexión a la API.');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []); 
    
    const handleImageClick = (category: CategoryType) => {
        setSelectedImage(category);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    if (loading) {
        return <div className="categories-container"><p>Cargando categorías...</p></div>;
    }

    if (error) {
        return <div className="categories-container"><p style={{color: 'red', fontWeight: 'bold'}}>{error}</p></div>;
    }

    return (
        <div className="categories-container">
            <header className="page-header">
                <h1>🏆Categorías de los Marrino Awards🏆</h1>
                <p>Descubre las categorias marrinas y su consexo</p>
            </header>

            <div className="categories-grid">
                {categories.map(category => (
                    <CategoryCard 
                        key={category._id}
                        category={category} 
                        onImageClick={handleImageClick}
                    />
                ))}
            </div>

            {selectedImage && (
                <ImageModal
                    imageUrl={selectedImage.imageUrl}
                    name={selectedImage.name}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default CategoriesPage;
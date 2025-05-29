import React, { useState } from 'react';

const [aiDescription, setAiDescription] = useState('');
const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
        setSelectedImage(URL.createObjectURL(file));

        // Create form data
        const formData = new FormData();
        formData.append('image', file);

        try {
            setIsGeneratingDescription(true);
            const response = await fetch('/api/categorize-product', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            setCategories(data.categories);
            setAiDescription(data.suggested_description);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsGeneratingDescription(false);
        }
    }
};

return (
    <form onSubmit={handleSubmit} className="product-upload-form">
        {/* Existing image upload UI */}

        <div className="form-group">
            <label>Product Description</label>
            <textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder="AI-generated description will appear here..."
                className="form-control"
                rows="4"
            />
            {isGeneratingDescription && (
                <div className="generating-message">
                    <span className="spinner"></span>
                    Generating AI description...
                </div>
            )}
            <small className="form-text text-muted">
                This description is AI-generated based on the product image. Feel free to edit it.
            </small>
        </div>

        {/* Rest of the form */}
    </form>
); 
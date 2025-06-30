import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/products/ProductForm';
import { createProduct } from '../services/productService';

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await createProduct(formData);
      console.log('Product created:', result);
      alert('Product created successfully!');
      navigate('/admin/products'); // Redirect to product list page
    } catch (err) {
      setError(err.message);
      alert(`Error creating product: ${err.message}`);
      setSubmitting(false);
    }
    // No finally block for setSubmitting(false) here, as navigation occurs on success.
  };

  return (
    <div>
      <h1 className="page-title">Create New Product</h1>
      <div className="content-wrapper">
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        <ProductForm onSubmit={handleSubmit} />
        {submitting && <p>Submitting...</p>}
      </div>
    </div>
  );
};

export default ProductCreatePage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../components/products/ProductForm';
import { getProductById, updateProduct } from '../services/productService';

const ProductEditPage = () => {
  const { id: productId } = useParams(); // Get product ID from URL params
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("No product ID provided.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await getProductById(productId);
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          setError(response.error || 'Product not found.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await updateProduct(productId, formData);
      console.log('Product updated:', result);
      alert('Product updated successfully!');
      navigate('/admin/products'); // Redirect to product list page
    } catch (err) {
      setError(err.message);
      alert(`Error updating product: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading product details...</p>;
  if (error && !product) return <p style={{ color: 'red' }}>Error: {error}</p>; // Show error only if product couldn't be loaded
  if (!product) return <p>Product not found.</p>; // Should be caught by error state mostly

  return (
    <div>
      <h1 className="page-title">Edit Product: {product.name}</h1>
      <div className="content-wrapper">
        {error && <p style={{ color: 'red' }}>Submit Error: {error}</p>}
        <ProductForm initialData={product} onSubmit={handleSubmit} isEditMode={true} />
        {submitting && <p>Submitting changes...</p>}
      </div>
    </div>
  );
};

export default ProductEditPage;

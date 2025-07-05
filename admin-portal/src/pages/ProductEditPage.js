import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Card, Typography, Alert } from 'antd'; // Import Tabs, Card, Typography, Alert
import ProductForm from '../components/products/ProductForm';
import UnderwritingRulesManager from '../components/products/UnderwritingRulesManager'; // Import the new component
import { getProductById, updateProduct } from '../services/productService';

const { TabPane } = Tabs;

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
    <div style={{ padding: '20px' }}>
      <Typography.Title level={2} style={{ marginBottom: '20px' }}>
        Edit Product: {product.name}
      </Typography.Title>

      {error && !submitting && <Alert message={`Error: ${error}`} type="error" showIcon style={{ marginBottom: '20px' }} />}
      {/* Display submit error separately if needed, or rely on messages from service */}

      <Tabs defaultActiveKey="1">
        <TabPane tab="Product Details" key="1">
          <Card>
            <ProductForm initialData={product} onSubmit={handleSubmit} isEditMode={true} />
            {submitting && <p style={{marginTop: '10px'}}>Submitting changes...</p>}
          </Card>
        </TabPane>
        <TabPane tab="Underwriting Rules" key="2" disabled={!product._id || !!error}>
          {/* Also disable if there was an error loading the product initially */}
          <Card>
            {product._id ? (
              <UnderwritingRulesManager productId={product._id} />
            ) : (
              <Alert message="Product details must be loaded and saved successfully before managing underwriting rules." type="info" showIcon />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProductEditPage;

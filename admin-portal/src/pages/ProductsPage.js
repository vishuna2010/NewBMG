import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For Create and Edit buttons
import { getAllProducts, deleteProduct } from '../services/productService';
import MainLayout from '../components/layout/MainLayout';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllProducts();
      setProducts(response.data || []); // Assuming API returns { success, count, data }
    } catch (err) {
      setError(err.message);
      setProducts([]); // Clear products on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p._id !== id)); // Remove from UI
        alert('Product deleted successfully!');
      } catch (err) {
        setError(err.message);
        alert(`Failed to delete product: ${err.message}`);
      }
    }
  };

  const actions = (
    <Link 
      to="/admin/products/new" 
      style={{ 
        padding: '8px 16px', 
        backgroundColor: '#007bff', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <span>+</span> Create New Product
    </Link>
  );

  if (loading) return <MainLayout pageTitle="Products" actions={actions}><p>Loading products...</p></MainLayout>;
  // Error display can be more sophisticated
  if (error && products.length === 0) return <MainLayout pageTitle="Products" actions={actions}><p style={{ color: 'red' }}>Error fetching products: {error}</p></MainLayout>;

  return (
    <MainLayout pageTitle="Products" actions={actions}>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Base Price</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Active</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{product.name}</td>
                <td style={{ padding: '8px' }}>{product.productType}</td>
                <td style={{ padding: '8px' }}>{product.basePrice} {product.currency}</td>
                <td style={{ padding: '8px' }}>{product.isActive ? 'Yes' : 'No'}</td>
                <td style={{ padding: '8px' }}>
                  <Link to={`/admin/products/edit/${product._id}`} style={{ marginRight: '10px', color: '#007bff' }}>Edit</Link>
                  <button onClick={() => handleDelete(product._id)} style={{ color: 'red', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </MainLayout>
  );
};

export default ProductsPage;

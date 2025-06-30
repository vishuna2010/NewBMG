import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For Create and Edit buttons
import { getAllProducts, deleteProduct } from '../services/productService';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  if (loading) return <p>Loading products...</p>;
  // Error display can be more sophisticated
  if (error) return <p style={{ color: 'red' }}>Error fetching products: {error}</p>;

  return (
    <div>
      <h1 className="page-title">Insurance Product Management</h1>
      <div className="content-wrapper">
        <Link to="/admin/products/new" style={{ marginBottom: '20px', display: 'inline-block', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          + Create New Product
        </Link>

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
      </div>
    </div>
  );
};

export default ProductsPage;

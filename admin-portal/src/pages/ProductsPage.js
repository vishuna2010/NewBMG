import React from 'react';

const ProductsPage = () => {
  return (
    <div>
      <h1 className="page-title">Insurance Product Management</h1>
      <div className="content-wrapper">
        <p>This section will be used to define and manage insurance products.</p>
        <ul>
          <li>View Product List</li>
          <li>Create New Product</li>
          <li>Edit Product Details (coverage, terms, rates)</li>
          <li>Manage Underwriting Rules</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductsPage;

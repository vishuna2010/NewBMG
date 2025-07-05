import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuote } from '../services/quoteService';
import { getAllProducts } from '../services/productService';
import { getAllUsers } from '../services/userService';
import { calculatePremium, getRatingFactors } from '../services/premiumCalculationService';
import MainLayout from '../components/layout/MainLayout';

const QuoteCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    productId: '',
    customerId: '',
    quoteInputs: {},
    notes: ''
  });
  
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratingFactors, setRatingFactors] = useState([]);
  const [premiumCalculation, setPremiumCalculation] = useState(null);
  const [calculatingPremium, setCalculatingPremium] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsResponse, customersResponse] = await Promise.all([
          getAllProducts(),
          getAllUsers({ role: 'customer' })
        ]);
        
        setProducts(productsResponse.data || []);
        setCustomers(customersResponse.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductChange = async (e) => {
    const productId = e.target.value;
    setFormData(prev => ({ ...prev, productId }));
    
    const product = products.find(p => p._id === productId);
    setSelectedProduct(product);
    
    // Reset quote inputs and premium calculation when product changes
    setFormData(prev => ({ ...prev, quoteInputs: {} }));
    setPremiumCalculation(null);
    
    // Fetch rating factors for this product type
    if (product) {
      try {
        const factorsResponse = await getRatingFactors(product.productType);
        setRatingFactors(factorsResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch rating factors:', err);
        setRatingFactors([]);
      }
    }
  };

  const handleQuoteInputChange = async (key, value) => {
    const newQuoteInputs = {
      ...formData.quoteInputs,
      [key]: value
    };
    
    setFormData(prev => ({
      ...prev,
      quoteInputs: newQuoteInputs
    }));

    // Calculate premium when we have enough data
    if (selectedProduct && Object.keys(newQuoteInputs).length >= 3) {
      await calculatePremiumForQuote(selectedProduct._id, newQuoteInputs);
    }
  };

  const calculatePremiumForQuote = async (productId, quoteInputs) => {
    if (!productId || Object.keys(quoteInputs).length === 0) return;

    setCalculatingPremium(true);
    try {
      const calculationData = {
        productId,
        quoteInputs
      };
      
      const result = await calculatePremium(calculationData);
      if (result.success) {
        setPremiumCalculation(result.data);
      } else {
        setPremiumCalculation(null);
      }
    } catch (err) {
      console.error('Premium calculation failed:', err);
      setPremiumCalculation(null);
    } finally {
      setCalculatingPremium(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productId) {
      setToast({ msg: 'Please select a product', type: 'error' });
      setTimeout(() => setToast(null), 2000);
      return;
    }
    
    setSaving(true);
    try {
      const response = await createQuote(formData);
      setToast({ msg: 'Quote created successfully!', type: 'success' });
      setTimeout(() => {
        setToast(null);
        navigate(`/quotes/${response.data._id}`);
      }, 1000);
    } catch (err) {
      setToast({ msg: `Error creating quote: ${err.message}`, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const renderRatingFactorField = (factor) => {
    const value = formData.quoteInputs[factor.code] || '';
    
    switch (factor.dataType) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleQuoteInputChange(factor.code, e.target.value)}
            required={factor.required}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Select {factor.name}</option>
            {factor.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        if (factor.ranges && factor.ranges.length > 0) {
          return (
            <select
              value={value}
              onChange={(e) => handleQuoteInputChange(factor.code, e.target.value)}
              required={factor.required}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">Select {factor.name}</option>
              {factor.ranges.map(range => (
                <option key={range.label} value={range.min}>
                  {range.label}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleQuoteInputChange(factor.code, parseInt(e.target.value))}
            required={factor.required}
            placeholder={`Enter ${factor.name.toLowerCase()}`}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleQuoteInputChange(factor.code, e.target.value)}
            required={factor.required}
            placeholder={`Enter ${factor.name.toLowerCase()}`}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        );
    }
  };

  const groupRatingFactors = (factors) => {
    const groups = {
      required: [],
      optional: []
    };
    
    factors.forEach(factor => {
      if (factor.required) {
        groups.required.push(factor);
      } else {
        groups.optional.push(factor);
      }
    });
    
    return groups;
  };

  const renderFactorGroup = (factors, title, isRequired = false) => {
    if (factors.length === 0) return null;
    
    return (
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ 
          marginBottom: '16px', 
          color: isRequired ? '#dc3545' : '#6c757d',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          {title} {isRequired && <span style={{ color: '#dc3545' }}>*</span>}
        </h4>
        <div style={{ display: 'grid', gap: '16px' }}>
          {factors.map((factor) => (
            <div key={factor.code} style={{ 
              background: '#f8f9fa', 
              padding: '16px', 
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                {factor.name} {factor.required && <span style={{ color: '#dc3545' }}>*</span>}
              </label>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '12px' }}>
                {factor.description}
              </div>
              {renderRatingFactorField(factor)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const actions = (
    <>
      <button 
        onClick={() => navigate('/quotes')}
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#6c757d', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Cancel
      </button>
    </>
  );

  if (loading) {
    return (
      <MainLayout pageTitle="Create New Quote" actions={actions}>
        <div className="content-wrapper">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="Create New Quote" actions={actions}>
      <div className="content-wrapper">
        {toast && (
          <div style={{ position: 'fixed', top: 24, right: 24, background: toast.type === 'error' ? '#dc3545' : '#28a745', color: '#fff', padding: '12px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 2000, fontWeight: 500 }}>
            {toast.msg}
          </div>
        )}

        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          {/* Main Form */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Product Selection */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Product *
                  </label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleProductChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - {product.productType} (${product.basePrice})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Selection */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Customer
                  </label>
                  <select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="">Select a customer (optional)</option>
                    {customers.map(customer => (
                      <option key={customer._id} value={customer._id}>
                        {customer.firstName} {customer.lastName} ({customer.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Details Display */}
                {selectedProduct && (
                  <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '4px' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '12px' }}>Product Details</h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <div><strong>Name:</strong> {selectedProduct.name}</div>
                      <div><strong>Type:</strong> {selectedProduct.productType}</div>
                      <div><strong>Base Price:</strong> ${selectedProduct.basePrice}</div>
                      <div><strong>Description:</strong> {selectedProduct.description}</div>
                    </div>
                  </div>
                )}

                {/* Rating Factors */}
                {ratingFactors.length > 0 && (
                  <div>
                                          <h4 style={{ marginBottom: '16px' }}>Rating Factors</h4>
                      {(() => {
                        const groups = groupRatingFactors(ratingFactors);
                        return (
                          <div>
                            {renderFactorGroup(groups.required, 'Required Factors', true)}
                            {renderFactorGroup(groups.optional, 'Optional Factors', false)}
                          </div>
                        );
                      })()}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes about this quote..."
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
                  />
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/quotes')}
                    style={{
                      padding: '10px 20px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '10px 20px',
                      background: saving ? '#ccc' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {saving ? 'Creating...' : 'Create Quote'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Premium Calculation Sidebar */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'fit-content' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Premium Calculation</h3>
            
            {calculatingPremium && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Calculating premium...</div>
              </div>
            )}

            {premiumCalculation && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ background: '#e8f5e8', padding: '16px', borderRadius: '6px', border: '1px solid #28a745' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', marginBottom: '8px' }}>
                    ${premiumCalculation.premium.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Calculated Premium</div>
                </div>

                <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '6px' }}>
                  <h5 style={{ marginTop: 0, marginBottom: '12px' }}>Breakdown</h5>
                  <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Base Premium:</span>
                      <span>${premiumCalculation.breakdown.basePremium.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Rating Factors:</span>
                      <span>{premiumCalculation.breakdown.factorAdjustments.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Geographic Factor:</span>
                      <span>{premiumCalculation.breakdown.geographicAdjustment.factor}</span>
                    </div>
                  </div>
                </div>

                {premiumCalculation.breakdown.factorAdjustments.length > 0 && (
                  <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '6px' }}>
                    <h5 style={{ marginTop: 0, marginBottom: '12px' }}>Applied Factors</h5>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                      {premiumCalculation.breakdown.factorAdjustments.map((factor, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          padding: '4px 0',
                          borderBottom: index < premiumCalculation.breakdown.factorAdjustments.length - 1 ? '1px solid #dee2e6' : 'none'
                        }}>
                          <span style={{ fontWeight: '500' }}>{factor.factorName}:</span>
                          <span style={{ color: '#28a745' }}>{factor.factorValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {premiumCalculation.breakdown.adjustments.length > 0 && (
                  <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '6px' }}>
                    <h5 style={{ marginTop: 0, marginBottom: '12px' }}>Adjustments</h5>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                      {premiumCalculation.breakdown.adjustments.map((adjustment, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          padding: '4px 0',
                          borderBottom: index < premiumCalculation.breakdown.adjustments.length - 1 ? '1px solid #dee2e6' : 'none'
                        }}>
                          <span style={{ fontWeight: '500' }}>{adjustment.name}:</span>
                          <span style={{ 
                            color: adjustment.type === 'discount' ? '#28a745' : '#dc3545',
                            fontWeight: '500'
                          }}>
                            {adjustment.type === 'discount' ? '-' : '+'}${Math.abs(adjustment.amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!calculatingPremium && !premiumCalculation && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <div style={{ fontSize: '14px' }}>Fill in the rating factors to see premium calculation</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuoteCreatePage; 
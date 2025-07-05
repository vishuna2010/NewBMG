import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { getAllRateTables, createRateTable, updateRateTable, deleteRateTable } from '../services/rateTableService';
import Modal from '../components/common/Modal';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import EmptyState from '../components/common/EmptyState';

const initialFormState = {
  name: '',
  code: '',
  description: '',
  productType: 'Auto',
  baseRates: [
    { coverageLevel: 'basic', baseAmount: 500, currency: 'USD' },
    { coverageLevel: 'standard', baseAmount: 800, currency: 'USD' },
    { coverageLevel: 'premium', baseAmount: 1200, currency: 'USD' }
  ],
  adjustments: [],
  geographicFactors: [
    { region: 'CA', factor: 1.3, description: 'California' },
    { region: 'NY', factor: 1.4, description: 'New York' },
    { region: 'TX', factor: 1.1, description: 'Texas' }
  ],
  version: 1,
  isActive: true
};

const productTypes = ['Auto', 'Home', 'Life'];
const coverageLevels = ['basic', 'standard', 'premium', 'comprehensive'];
const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

const RateTablesPage = () => {
  const [rateTables, setRateTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchRateTables();
  }, []);

  const fetchRateTables = async () => {
    setLoading(true);
    try {
      const res = await getAllRateTables();
      setRateTables(res.data || []);
    } catch (err) {
      setToast({ msg: 'Failed to load rate tables', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearch(e.target.value);
  const handleFilterProduct = (e) => setFilterProduct(e.target.value);

  const filteredRateTables = rateTables.filter(rt =>
    (!search || rt.name.toLowerCase().includes(search.toLowerCase()) || rt.code.toLowerCase().includes(search.toLowerCase())) &&
    (!filterProduct || rt.productType === filterProduct)
  );

  const openModal = (rateTable = null) => {
    setEditMode(!!rateTable);
    setForm(rateTable ? { ...rateTable } : initialFormState);
    setSelectedId(rateTable ? rateTable._id : null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialFormState);
    setSelectedId(null);
    setEditMode(false);
    setActiveTab('basic');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBaseRateChange = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      baseRates: prev.baseRates.map((rate, i) => 
        i === index ? { ...rate, [field]: value } : rate
      )
    }));
  };

  const addBaseRate = () => {
    setForm(prev => ({
      ...prev,
      baseRates: [...prev.baseRates, { coverageLevel: 'basic', baseAmount: 500, currency: 'USD' }]
    }));
  };

  const removeBaseRate = (index) => {
    setForm(prev => ({
      ...prev,
      baseRates: prev.baseRates.filter((_, i) => i !== index)
    }));
  };

  const handleAdjustmentChange = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      adjustments: prev.adjustments.map((adj, i) => 
        i === index ? { ...adj, [field]: value } : adj
      )
    }));
  };

  const addAdjustment = () => {
    setForm(prev => ({
      ...prev,
      adjustments: [...prev.adjustments, {
        name: '',
        type: 'discount',
        value: 10,
        valueType: 'percentage',
        conditions: {},
        maxAmount: 0
      }]
    }));
  };

  const removeAdjustment = (index) => {
    setForm(prev => ({
      ...prev,
      adjustments: prev.adjustments.filter((_, i) => i !== index)
    }));
  };

  const handleGeoFactorChange = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      geographicFactors: prev.geographicFactors.map((geo, i) => 
        i === index ? { ...geo, [field]: value } : geo
      )
    }));
  };

  const addGeoFactor = () => {
    setForm(prev => ({
      ...prev,
      geographicFactors: [...prev.geographicFactors, { region: '', factor: 1.0, description: '' }]
    }));
  };

  const removeGeoFactor = (index) => {
    setForm(prev => ({
      ...prev,
      geographicFactors: prev.geographicFactors.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateRateTable(selectedId, form);
        setToast({ msg: 'Rate table updated', type: 'success' });
      } else {
        await createRateTable(form);
        setToast({ msg: 'Rate table created', type: 'success' });
      }
      closeModal();
      fetchRateTables();
    } catch (err) {
      setToast({ msg: 'Error saving rate table', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rate table?')) return;
    try {
      await deleteRateTable(id);
      setToast({ msg: 'Rate table deleted', type: 'success' });
      fetchRateTables();
    } catch (err) {
      setToast({ msg: 'Error deleting rate table', type: 'error' });
    }
  };

  const handleToggleActive = async (rateTable) => {
    try {
      await updateRateTable(rateTable._id, { ...rateTable, isActive: !rateTable.isActive });
      fetchRateTables();
    } catch (err) {
      setToast({ msg: 'Error updating status', type: 'error' });
    }
  };

  // Table columns
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'productType', label: 'Product' },
    { key: 'version', label: 'Version', render: (val) => `v${val}` },
    { key: 'isActive', label: 'Active', render: (val, row) => (
      <input type="checkbox" checked={val} onChange={() => handleToggleActive(row)} />
    ) },
    { key: 'actions', label: 'Actions', render: (val, row) => (
      <div className="flex gap-2 justify-center">
        <Button variant="secondary" size="small" onClick={() => openModal(row)}>Edit</Button>
        <Button variant="danger" size="small" onClick={() => handleDelete(row._id)}>Delete</Button>
      </div>
    ) }
  ];

  return (
    <MainLayout pageTitle="Rate Tables">
      <div className="content-wrapper">
        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type === 'error' ? 'error' : 'success'}
            onClose={() => setToast(null)}
          />
        )}
        <Card
          title="Rate Tables"
          headerActions={
            <Button variant="primary" onClick={() => openModal()}>
              + Add New
            </Button>
          }
          className="mb-6"
        >
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search name or code..."
              value={search}
              onChange={handleSearch}
              size="medium"
              style={{ maxWidth: 240 }}
            />
            <Select
              value={filterProduct}
              onChange={handleFilterProduct}
              options={[{ value: '', label: 'All Products' }, ...productTypes.map(pt => ({ value: pt, label: pt }))]}
              size="medium"
              style={{ maxWidth: 180 }}
            />
          </div>
          <Table
            columns={columns}
            data={filteredRateTables}
            loading={loading}
            emptyMessage={<EmptyState title="No rate tables found." />}
          />
        </Card>
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editMode ? 'Edit Rate Table' : 'Add Rate Table'}
          size="large"
        >
          <form onSubmit={handleSubmit}>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              {['basic', 'rates', 'adjustments', 'geographic'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium focus:outline-none transition-colors duration-150 ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="grid gap-4">
                <Input name="name" label="Name" value={form.name} onChange={handleFormChange} required />
                <Input name="code" label="Code" value={form.code} onChange={handleFormChange} required />
                <Input name="description" label="Description" value={form.description} onChange={handleFormChange} />
                <Select
                  name="productType"
                  label="Product Type"
                  value={form.productType}
                  onChange={handleFormChange}
                  options={productTypes.map(pt => ({ value: pt, label: pt }))}
                  required
                />
                <div className="flex items-center gap-2">
                  <label className="font-medium">Active</label>
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleFormChange} />
                </div>
              </div>
            )}
            {/* Base Rates Tab */}
            {activeTab === 'rates' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-semibold">Base Rates</h4>
                  <Button variant="success" type="button" onClick={addBaseRate}>+ Add Rate</Button>
                </div>
                {form.baseRates.map((rate, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 mb-3 items-end">
                    <Select
                      value={rate.coverageLevel}
                      onChange={e => handleBaseRateChange(index, 'coverageLevel', e.target.value)}
                      options={coverageLevels.map(cl => ({ value: cl, label: cl }))}
                      label="Coverage Level"
                    />
                    <Input
                      type="number"
                      value={rate.baseAmount}
                      onChange={e => handleBaseRateChange(index, 'baseAmount', parseFloat(e.target.value))}
                      label="Amount"
                    />
                    <Select
                      value={rate.currency}
                      onChange={e => handleBaseRateChange(index, 'currency', e.target.value)}
                      options={currencies.map(c => ({ value: c, label: c }))}
                      label="Currency"
                    />
                    <Button variant="danger" type="button" onClick={() => removeBaseRate(index)}>Remove</Button>
                  </div>
                ))}
              </div>
            )}
            {/* Adjustments Tab */}
            {activeTab === 'adjustments' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-semibold">Adjustments</h4>
                  <Button variant="success" type="button" onClick={addAdjustment}>+ Add Adjustment</Button>
                </div>
                {form.adjustments.map((adj, index) => (
                  <div key={index} className="border border-gray-200 p-4 rounded-lg mb-3">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <Input
                        value={adj.name}
                        onChange={e => handleAdjustmentChange(index, 'name', e.target.value)}
                        label="Adjustment Name"
                      />
                      <Select
                        value={adj.type}
                        onChange={e => handleAdjustmentChange(index, 'type', e.target.value)}
                        options={[{ value: 'discount', label: 'Discount' }, { value: 'surcharge', label: 'Surcharge' }]}
                        label="Type"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <Input
                        type="number"
                        value={adj.value}
                        onChange={e => handleAdjustmentChange(index, 'value', parseFloat(e.target.value))}
                        label="Value"
                      />
                      <Select
                        value={adj.valueType}
                        onChange={e => handleAdjustmentChange(index, 'valueType', e.target.value)}
                        options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed Amount' }]}
                        label="Value Type"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={adj.maxAmount}
                        onChange={e => handleAdjustmentChange(index, 'maxAmount', parseFloat(e.target.value))}
                        label="Max Amount"
                        style={{ width: 150 }}
                      />
                      <Button variant="danger" type="button" onClick={() => removeAdjustment(index)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Geographic Factors Tab */}
            {activeTab === 'geographic' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-semibold">Geographic Factors</h4>
                  <Button variant="success" type="button" onClick={addGeoFactor}>+ Add Factor</Button>
                </div>
                {form.geographicFactors.map((geo, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 mb-3 items-end">
                    <Input
                      value={geo.region}
                      onChange={e => handleGeoFactorChange(index, 'region', e.target.value)}
                      label="Region"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={geo.factor}
                      onChange={e => handleGeoFactorChange(index, 'factor', parseFloat(e.target.value))}
                      label="Factor"
                    />
                    <Input
                      value={geo.description}
                      onChange={e => handleGeoFactorChange(index, 'description', e.target.value)}
                      label="Description"
                    />
                    <Button variant="danger" type="button" onClick={() => removeGeoFactor(index)}>Remove</Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 justify-end mt-8">
              <Button variant="secondary" onClick={closeModal} type="button">Cancel</Button>
              <Button variant="primary" type="submit">{editMode ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default RateTablesPage; 
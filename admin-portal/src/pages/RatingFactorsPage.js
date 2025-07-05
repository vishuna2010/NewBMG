import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { getAllRatingFactors, createRatingFactor, updateRatingFactor, deleteRatingFactor } from '../services/ratingFactorService';
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
  factorType: 'multiplier',
  dataType: 'number',
  options: [],
  ranges: [],
  required: false,
  applicableProducts: [],
  displayOrder: 1,
  isActive: true
};

const factorTypes = ['multiplier', 'additive', 'percentage', 'fixed'];
const dataTypes = ['number', 'select', 'boolean', 'string'];
const productTypes = ['Auto', 'Home', 'Life'];

const RatingFactorsPage = () => {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchFactors();
  }, []);

  const fetchFactors = async () => {
    setLoading(true);
    try {
      const res = await getAllRatingFactors();
      setFactors(res.data || []);
    } catch (err) {
      setToast({ msg: 'Failed to load rating factors', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearch(e.target.value);
  const handleFilterProduct = (e) => setFilterProduct(e.target.value);

  const filteredFactors = factors.filter(f =>
    (!search || f.name.toLowerCase().includes(search.toLowerCase()) || f.code.toLowerCase().includes(search.toLowerCase())) &&
    (!filterProduct || f.applicableProducts.includes(filterProduct))
  );

  const openModal = (factor = null) => {
    setEditMode(!!factor);
    setForm(factor ? { ...factor } : initialFormState);
    setSelectedId(factor ? factor._id : null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialFormState);
    setSelectedId(null);
    setEditMode(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProductToggle = (product) => {
    setForm(prev => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(product)
        ? prev.applicableProducts.filter(p => p !== product)
        : [...prev.applicableProducts, product]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateRatingFactor(selectedId, form);
        setToast({ msg: 'Rating factor updated', type: 'success' });
      } else {
        await createRatingFactor(form);
        setToast({ msg: 'Rating factor created', type: 'success' });
      }
      closeModal();
      fetchFactors();
    } catch (err) {
      setToast({ msg: 'Error saving factor', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rating factor?')) return;
    try {
      await deleteRatingFactor(id);
      setToast({ msg: 'Rating factor deleted', type: 'success' });
      fetchFactors();
    } catch (err) {
      setToast({ msg: 'Error deleting factor', type: 'error' });
    }
  };

  const handleToggleActive = async (factor) => {
    try {
      await updateRatingFactor(factor._id, { ...factor, isActive: !factor.isActive });
      fetchFactors();
    } catch (err) {
      setToast({ msg: 'Error updating status', type: 'error' });
    }
  };

  // Table columns
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'factorType', label: 'Type' },
    { key: 'dataType', label: 'Data' },
    { key: 'applicableProducts', label: 'Products', render: (val) => val.join(', ') },
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
    <MainLayout pageTitle="Rating Factors">
      <div className="content-wrapper">
        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type === 'error' ? 'error' : 'success'}
            onClose={() => setToast(null)}
          />
        )}
        <Card
          title="Rating Factors"
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
            data={filteredFactors}
            loading={loading}
            emptyMessage={<EmptyState title="No rating factors found." />}
          />
        </Card>
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editMode ? 'Edit Rating Factor' : 'Add Rating Factor'}
          size="medium"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" label="Name" value={form.name} onChange={handleFormChange} required />
            <Input name="code" label="Code" value={form.code} onChange={handleFormChange} required />
            <Input name="description" label="Description" value={form.description} onChange={handleFormChange} />
            <div className="flex gap-4">
              <Select
                name="factorType"
                label="Factor Type"
                value={form.factorType}
                onChange={handleFormChange}
                options={factorTypes.map(ft => ({ value: ft, label: ft }))}
                required
              />
              <Select
                name="dataType"
                label="Data Type"
                value={form.dataType}
                onChange={handleFormChange}
                options={dataTypes.map(dt => ({ value: dt, label: dt }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Products</label>
              <div className="flex gap-4">
                {productTypes.map(pt => (
                  <label key={pt} className="flex items-center gap-2 font-normal">
                    <input type="checkbox" checked={form.applicableProducts.includes(pt)} onChange={() => handleProductToggle(pt)} /> {pt}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium">Required</label>
              <input type="checkbox" name="required" checked={form.required} onChange={handleFormChange} />
            </div>
            <Input name="displayOrder" label="Display Order" type="number" value={form.displayOrder} onChange={handleFormChange} />
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="secondary" onClick={closeModal} type="button">Cancel</Button>
              <Button variant="primary" type="submit">{editMode ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default RatingFactorsPage; 
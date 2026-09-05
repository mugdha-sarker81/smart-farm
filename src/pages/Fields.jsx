// src/pages/Fields.jsx
import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { MapPin, Plus, Edit, Sprout, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Fields = () => {
  const { fields, crops, addField, updateField, getTasksByField, loading } = useFarm();
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    location: '',
    soil_type: '',
    status: 'healthy'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingField) {
        await updateField(editingField.id, formData);
      } else {
        await addField(formData);
      }
      setShowModal(false);
      setEditingField(null);
      setFormData({ name: '', size: '', location: '', soil_type: '', status: 'healthy' });
    } catch (error) {
      console.error('Error saving field:', error);
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      size: field.size,
      location: field.location,
      soil_type: field.soil_type || '',
      status: field.status || 'healthy'
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': return 'bg-green-100 text-green-700';
      case 'attention': return 'bg-yellow-100 text-yellow-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getFieldCrop = (fieldId) => {
    const crop = crops.find(c => c.field_id === fieldId);
    return crop;
  };

  const getFieldTasks = (fieldId) => {
    return getTasksByField(fieldId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Fields</h2>
        <button
          onClick={() => {
            setEditingField(null);
            setFormData({ name: '', size: '', location: '', soil_type: '', status: 'healthy' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Field
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No fields yet</h3>
          <p className="text-gray-500 mt-2">Add your first field to start managing your farm.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => {
            const crop = getFieldCrop(field.id);
            const tasks = getFieldTasks(field.id);
            const completed = tasks.filter(t => t.status === 'completed').length;
            const pending = tasks.filter(t => t.status === 'pending').length;
            
            return (
              <div key={field.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{field.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(field.status)}`}>
                    {field.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📍 {field.location || 'No location'}</p>
                  <p>📐 {field.size || 'N/A'} acres</p>
                  <p>🌱 {field.soil_type || 'Soil type not specified'}</p>
                </div>

                {crop && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sprout className="h-4 w-4 text-farm-green" />
                        <span className="font-medium text-gray-800">{crop.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-farm-green">{crop.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-farm-green rounded-full h-2 transition-all duration-500"
                        style={{ width: `${crop.progress || 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {tasks.length > 0 && (
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      {completed}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Clock className="h-4 w-4" />
                      {pending}
                    </span>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/crops?field=${field.id}`}
                    className="flex-1 text-center btn-outline text-sm py-1"
                  >
                    Manage Crops
                  </Link>
                  <button
                    onClick={() => handleEdit(field)}
                    className="p-2 text-gray-500 hover:text-farm-green transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingField ? 'Edit Field' : 'Add New Field'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size (acres) *</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                <input
                  type="text"
                  value={formData.soil_type}
                  onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                >
                  <option value="healthy">Healthy</option>
                  <option value="attention">Needs Attention</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingField ? 'Update' : 'Add'} Field
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingField(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fields;
// src/pages/Crops.jsx
import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { Sprout, Plus, Edit, Trash2, Search, ChevronRight } from 'lucide-react';

const CROP_OPTIONS = [
  { name: 'Rice', icon: '🌾' },
  { name: 'Maize', icon: '🌽' },
  { name: 'Potato', icon: '🥔' },
  { name: 'Tomato', icon: '🍅' },
  { name: 'Onion', icon: '🧅' },
  { name: 'Cucumber', icon: '🥒' },
  { name: 'Chilli', icon: '🌶️' },
  { name: 'Eggplant', icon: '🍆' },
  { name: 'Cabbage', icon: '🥬' },
  { name: 'Carrot', icon: '🥕' },
  { name: 'Garlic', icon: '🧄' },
  { name: 'Ginger', icon: '🫚' },
  { name: 'Pumpkin', icon: '🎃' },
  { name: 'Watermelon', icon: '🍉' },
  { name: 'Mango', icon: '🥭' },
  { name: 'Banana', icon: '🍌' },
  { name: 'Papaya', icon: '🍈' },
  { name: 'Guava', icon: '🍐' },
  { name: 'Lemon', icon: '🍋' },
  { name: 'Coconut', icon: '🥥' },
];

const GROWTH_STAGES = [
  { id: 'seedling', label: 'Seedling', icon: '🌱' },
  { id: 'vegetative', label: 'Vegetative', icon: '🌿' },
  { id: 'flowering', label: 'Flowering', icon: '🌸' },
  { id: 'harvest', label: 'Harvest', icon: '🍅' },
];

const Crops = () => {
  const { fields, crops, addCrop, updateCrop, getFieldById, loading } = useFarm();
  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [formData, setFormData] = useState({
    field_id: '',
    name: '',
    planting_date: '',
    expected_harvest: '',
    progress: 0,
    growth_stage: 'seedling',
    water_requirement: 'Medium',
    fertilizer_requirement: 'Medium',
    notes: ''
  });

  const filteredCrops = CROP_OPTIONS.filter(crop =>
    crop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCrop) {
        await updateCrop(editingCrop.id, formData);
      } else {
        await addCrop(formData);
      }
      setShowModal(false);
      setEditingCrop(null);
      setFormData({
        field_id: '',
        name: '',
        planting_date: '',
        expected_harvest: '',
        progress: 0,
        growth_stage: 'seedling',
        water_requirement: 'Medium',
        fertilizer_requirement: 'Medium',
        notes: ''
      });
      setSelectedCrop(null);
    } catch (error) {
      console.error('Error saving crop:', error);
    }
  };

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setFormData({
      field_id: crop.field_id,
      name: crop.name,
      planting_date: crop.planting_date || '',
      expected_harvest: crop.expected_harvest || '',
      progress: crop.progress || 0,
      growth_stage: crop.growth_stage || 'seedling',
      water_requirement: crop.water_requirement || 'Medium',
      fertilizer_requirement: crop.fertilizer_requirement || 'Medium',
      notes: crop.notes || ''
    });
    setShowModal(true);
  };

  const handleSelectCrop = (cropName) => {
    setFormData({ ...formData, name: cropName });
    setSelectedCrop(cropName);
  };

  const getGrowthStageIcon = (stage) => {
    const found = GROWTH_STAGES.find(s => s.id === stage);
    return found ? found.icon : '🌱';
  };

  const getGrowthStageLabel = (stage) => {
    const found = GROWTH_STAGES.find(s => s.id === stage);
    return found ? found.label : stage;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Crops</h2>
        <button
          onClick={() => {
            setEditingCrop(null);
            setFormData({
              field_id: '',
              name: '',
              planting_date: '',
              expected_harvest: '',
              progress: 0,
              growth_stage: 'seedling',
              water_requirement: 'Medium',
              fertilizer_requirement: 'Medium',
              notes: ''
            });
            setSelectedCrop(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Crop
        </button>
      </div>

      {crops.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Sprout className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No crops yet</h3>
          <p className="text-gray-500 mt-2">Add your first crop to start tracking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => {
            const field = getFieldById(crop.field_id);
            return (
              <div key={crop.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{crop.name}</h3>
                    <p className="text-sm text-gray-500">{field?.name || 'No field assigned'}</p>
                  </div>
                  <span className="text-2xl">
                    {CROP_OPTIONS.find(c => c.name === crop.name)?.icon || '🌱'}
                  </span>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-semibold">{crop.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-farm-green rounded-full h-2 transition-all duration-500"
                      style={{ width: `${crop.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-600">
                    {getGrowthStageIcon(crop.growth_stage)} {getGrowthStageLabel(crop.growth_stage)}
                  </p>
                  {crop.planting_date && (
                    <p className="text-gray-500">🌱 Planted: {new Date(crop.planting_date).toLocaleDateString()}</p>
                  )}
                  {crop.expected_harvest && (
                    <p className="text-gray-500">🍅 Harvest: {new Date(crop.expected_harvest).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    💧 {crop.water_requirement}
                  </span>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                    🧪 {crop.fertilizer_requirement}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(crop)}
                    className="flex-1 btn-outline text-sm py-1"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingCrop ? 'Edit Crop' : 'Add New Crop'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Field *</label>
                <select
                  required
                  value={formData.field_id}
                  onChange={(e) => setFormData({ ...formData, field_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                >
                  <option value="">Select a field</option>
                  {fields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
              </div>

              {!editingCrop && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Crop</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search crops..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                    />
                  </div>
                  {searchTerm && (
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                      {filteredCrops.map((crop) => (
                        <button
                          key={crop.name}
                          type="button"
                          onClick={() => handleSelectCrop(crop.name)}
                          className={`p-2 rounded-lg text-left hover:bg-gray-100 transition-colors ${
                            formData.name === crop.name ? 'bg-green-100 border-2 border-farm-green' : ''
                          }`}
                        >
                          <span className="text-lg">{crop.icon}</span> {crop.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!editingCrop && formData.name && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Selected: <span className="font-semibold">{formData.name}</span>
                  </p>
                </div>
              )}

              {editingCrop && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
                  <input
                    type="date"
                    value={formData.planting_date}
                    onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest</label>
                  <input
                    type="date"
                    value={formData.expected_harvest}
                    onChange={(e) => setFormData({ ...formData, expected_harvest: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-center text-sm font-semibold text-farm-green">{formData.progress}%</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Growth Stage</label>
                <select
                  value={formData.growth_stage}
                  onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                >
                  {GROWTH_STAGES.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.icon} {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Water Requirement</label>
                  <select
                    value={formData.water_requirement}
                    onChange={(e) => setFormData({ ...formData, water_requirement: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizer Requirement</label>
                  <select
                    value={formData.fertilizer_requirement}
                    onChange={(e) => setFormData({ ...formData, fertilizer_requirement: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                  placeholder="Add any notes about this crop..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={!formData.name || !formData.field_id}
                >
                  {editingCrop ? 'Update' : 'Add'} Crop
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCrop(null);
                    setSelectedCrop(null);
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

export default Crops;
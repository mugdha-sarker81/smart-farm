// src/pages/Workers.jsx
import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Users, Plus, Edit, CheckCircle, Clock, Phone, Mail } from 'lucide-react';

const Workers = () => {
  const { workers, tasks, addWorker, updateWorker, getTasksByWorker } = useFarm();
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Field Worker',
    phone: '',
    email: '',
    status: 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        await updateWorker(editingWorker.id, formData);
      } else {
        await addWorker(formData);
      }
      setShowModal(false);
      setEditingWorker(null);
      setFormData({ name: '', role: 'Field Worker', phone: '', email: '', status: 'active' });
    } catch (error) {
      console.error('Error saving worker:', error);
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      role: worker.role || 'Field Worker',
      phone: worker.phone || '',
      email: worker.email || '',
      status: worker.status || 'active'
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Workers</h2>
        <button
          onClick={() => {
            setEditingWorker(null);
            setFormData({ name: '', role: 'Field Worker', phone: '', email: '', status: 'active' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Worker
        </button>
      </div>

      {workers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No workers yet</h3>
          <p className="text-gray-500 mt-2">Add workers to assign tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => {
            const workerTasks = getTasksByWorker(worker.id);
            const completed = workerTasks.filter(t => t.status === 'completed').length;
            const pending = workerTasks.filter(t => t.status === 'pending').length;
            
            return (
              <div key={worker.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-farm-green flex items-center justify-center text-white font-bold text-lg">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{worker.name}</h3>
                      <p className="text-sm text-gray-500">{worker.role || 'Field Worker'}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    worker.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {worker.status}
                  </span>
                </div>

                {(worker.phone || worker.email) && (
                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    {worker.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {worker.phone}
                      </p>
                    )}
                    {worker.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {worker.email}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {completed} completed
                  </span>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Clock className="h-4 w-4" />
                    {pending} pending
                  </span>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => handleEdit(worker)}
                    className="w-full btn-outline text-sm py-1"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingWorker ? 'Edit Worker' : 'Add New Worker'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                  placeholder="Field Worker"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingWorker ? 'Update' : 'Add'} Worker
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingWorker(null);
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

export default Workers;
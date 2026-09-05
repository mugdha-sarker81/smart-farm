// src/pages/Tasks.jsx
import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { CheckSquare, Plus, Edit, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

const Tasks = () => {
  const { tasks, fields, crops, workers, addTask, updateTask, getFieldById, getCropById, getWorkerById } = useFarm();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    field_id: '',
    crop_id: '',
    worker_id: '',
    due_date: '',
    priority: 'medium',
    status: 'pending'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await addTask(formData);
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        field_id: '',
        crop_id: '',
        worker_id: '',
        due_date: '',
        priority: 'medium',
        status: 'pending'
      });
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      field_id: task.field_id || '',
      crop_id: task.crop_id || '',
      worker_id: task.worker_id || '',
      due_date: task.due_date || '',
      priority: task.priority || 'medium',
      status: task.status || 'pending'
    });
    setShowModal(true);
  };

  const handleStatusToggle = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(task.id, { ...task, status: newStatus });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'overdue') {
      return task.status === 'pending' && isPast(parseISO(task.due_date));
    }
    return true;
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <button
            onClick={() => {
              setEditingTask(null);
              setFormData({
                title: '',
                description: '',
                field_id: '',
                crop_id: '',
                worker_id: '',
                due_date: '',
                priority: 'medium',
                status: 'pending'
              });
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Task
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No tasks found</h3>
          <p className="text-gray-500 mt-2">Create a new task to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const field = getFieldById(task.field_id);
            const crop = getCropById(task.crop_id);
            const worker = getWorkerById(task.worker_id);
            const isOverdue = task.status === 'pending' && task.due_date && isPast(parseISO(task.due_date));
            
            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center justify-between gap-3 transition-all ${
                  task.status === 'completed' ? 'opacity-60' : ''
                } ${isOverdue ? 'border-l-4 border-red-500' : ''}`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <button
                    onClick={() => handleStatusToggle(task)}
                    className={`flex-shrink-0 p-1 rounded-full transition-colors ${
                      task.status === 'completed' 
                        ? 'text-green-500 hover:text-green-600' 
                        : 'text-gray-300 hover:text-gray-500'
                    }`}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Clock className="h-6 w-6" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      {field && <span>📍 {field.name}</span>}
                      {crop && <span>🌱 {crop.name}</span>}
                      {worker && <span>👤 {worker.name}</span>}
                      {task.due_date && (
                        <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                          📅 {format(parseISO(task.due_date), 'MMM d, yyyy')}
                          {isOverdue && ' ⚠️ Overdue'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-1 text-gray-400 hover:text-farm-green transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                <select
                  value={formData.field_id}
                  onChange={(e) => setFormData({ ...formData, field_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                >
                  <option value="">Select field</option>
                  {fields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                <select
                  value={formData.crop_id}
                  onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                >
                  <option value="">Select crop</option>
                  {crops.map(crop => (
                    <option key={crop.id} value={crop.id}>{crop.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Worker</label>
                <select
                  value={formData.worker_id}
                  onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                >
                  <option value="">Select worker</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>{worker.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              {editingTask && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingTask ? 'Update' : 'Add'} Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
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

export default Tasks;
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const FarmContext = createContext();

export const useFarm = () => useContext(FarmContext);

export const FarmProvider = ({ children }) => {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedField, setSelectedField] = useState(null);

  // Fetch all data
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
  setLoading(true);

  try {
    const results = await Promise.allSettled([
      fetchFields(),
      fetchCrops(),
      fetchTasks(),
      fetchWorkers(),
      fetchExpenses()
    ]);

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const names = ['Fields', 'Crops', 'Tasks', 'Workers', 'Expenses'];
        console.error(`❌ ${names[index]} fetch failed:`, result.reason);
      }
    });

  } catch (error) {
    console.error('❌ Error fetching farm data:', error);
  } finally {
    setLoading(false);
  }
};
  

  const fetchFields = async () => {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    setFields(data || []);
    return data;
  };

  const fetchCrops = async () => {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    setCrops(data || []);
    return data;
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });
    if (error) throw error;
    setTasks(data || []);
    return data;
  };

  const fetchWorkers = async () => {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    setWorkers(data || []);
    return data;
  };

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    setExpenses(data || []);
    return data;
  };

  // Add field
  const addField = async (fieldData) => {
    const { data, error } = await supabase
      .from('fields')
      .insert([{ ...fieldData, user_id: user.id }])
      .select();
    if (error) throw error;
    setFields([data[0], ...fields]);
    return data[0];
  };

  // Update field
  const updateField = async (id, updates) => {
    const { data, error } = await supabase
      .from('fields')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    setFields(fields.map(f => f.id === id ? data[0] : f));
    return data[0];
  };

  // Add crop
  const addCrop = async (cropData) => {
    const { data, error } = await supabase
      .from('crops')
      .insert([{ ...cropData, user_id: user.id }])
      .select();
    if (error) throw error;
    setCrops([data[0], ...crops]);
    return data[0];
  };

  // Update crop
  const updateCrop = async (id, updates) => {
    const { data, error } = await supabase
      .from('crops')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    setCrops(crops.map(c => c.id === id ? data[0] : c));
    return data[0];
  };

  // Add task
  const addTask = async (taskData) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...taskData, user_id: user.id }])
      .select();
    if (error) throw error;
    setTasks([data[0], ...tasks]);
    return data[0];
  };

  // Update task
  const updateTask = async (id, updates) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    setTasks(tasks.map(t => t.id === id ? data[0] : t));
    return data[0];
  };

  // Add worker
  const addWorker = async (workerData) => {
    const { data, error } = await supabase
      .from('workers')
      .insert([{ ...workerData, user_id: user.id }])
      .select();
    if (error) throw error;
    setWorkers([data[0], ...workers]);
    return data[0];
  };

  // Update worker
  const updateWorker = async (id, updates) => {
    const { data, error } = await supabase
      .from('workers')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    setWorkers(workers.map(w => w.id === id ? data[0] : w));
    return data[0];
  };

  // Add expense
  const addExpense = async (expenseData) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expenseData, user_id: user.id }])
      .select();
    if (error) throw error;
    setExpenses([data[0], ...expenses]);
    return data[0];
  };

  const getCropById = (id) => crops.find(c => c.id === id);
  const getFieldById = (id) => fields.find(f => f.id === id);
  const getWorkerById = (id) => workers.find(w => w.id === id);
  const getTasksByField = (fieldId) => tasks.filter(t => t.field_id === fieldId);
  const getTasksByCrop = (cropId) => tasks.filter(t => t.crop_id === cropId);
  const getTasksByWorker = (workerId) => tasks.filter(t => t.worker_id === workerId);

  const value = {
    fields,
    crops,
    tasks,
    workers,
    expenses,
    loading,
    selectedCrop,
    selectedField,
    setSelectedCrop,
    setSelectedField,
    fetchAllData,
    fetchFields,
    fetchCrops,
    fetchTasks,
    fetchWorkers,
    fetchExpenses,
    addField,
    updateField,
    addCrop,
    updateCrop,
    addTask,
    updateTask,
    addWorker,
    updateWorker,
    addExpense,
    getCropById,
    getFieldById,
    getWorkerById,
    getTasksByField,
    getTasksByCrop,
    getTasksByWorker
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
};
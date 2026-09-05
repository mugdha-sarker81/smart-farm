import React from 'react';
import { useFarm } from '../context/FarmContext';
import { BarChart3, TrendingUp, DollarSign, Users, MapPin, Sprout, CheckSquare } from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Reports = () => {
  const { fields, crops, tasks, workers, expenses } = useFarm();

  const totalFields = fields.length;
  const totalCrops = crops.length;
  const totalWorkers = workers.length;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const totalTasks = tasks.length;

  // Calculate crop progress distribution
  const cropProgressData = {
    labels: crops.map(c => c.name).slice(0, 10),
    datasets: [
      {
        label: 'Progress (%)',
        data: crops.map(c => c.progress || 0).slice(0, 10),
        backgroundColor: 'rgba(45, 106, 79, 0.8)',
        borderColor: 'rgba(45, 106, 79, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Expense by category
  const categoryExpenses = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const expenseCategoryData = {
    labels: Object.keys(categoryExpenses),
    datasets: [
      {
        data: Object.values(categoryExpenses),
        backgroundColor: [
          'rgba(45, 106, 79, 0.8)',
          'rgba(82, 183, 136, 0.8)',
          'rgba(244, 162, 97, 0.8)',
          'rgba(230, 57, 70, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(155, 89, 182, 0.8)',
        ],
        borderColor: [
          'rgba(45, 106, 79, 1)',
          'rgba(82, 183, 136, 1)',
          'rgba(244, 162, 97, 1)',
          'rgba(230, 57, 70, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(155, 89, 182, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Task completion trend
  const taskTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [8, 12, 15, completedTasks],
        borderColor: 'rgba(45, 106, 79, 1)',
        backgroundColor: 'rgba(45, 106, 79, 0.2)',
        fill: true,
      },
      {
        label: 'Tasks Pending',
        data: [10, 8, 6, pendingTasks],
        borderColor: 'rgba(244, 162, 97, 1)',
        backgroundColor: 'rgba(244, 162, 97, 0.2)',
        fill: true,
      },
    ],
  };

  const findBestCrop = () => {
    if (crops.length === 0) return 'N/A';
    return crops.reduce((best, crop) => 
      (crop.progress || 0) > (best.progress || 0) ? crop : best
    ).name;
  };

  const findHighestExpenseCrop = () => {
    const cropExpenses = crops.reduce((acc, crop) => {
      const cropTotal = expenses
        .filter(e => e.crop_id === crop.id)
        .reduce((sum, e) => sum + e.amount, 0);
      acc[crop.name] = cropTotal;
      return acc;
    }, {});
    if (Object.keys(cropExpenses).length === 0) return 'N/A';
    return Object.entries(cropExpenses).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Farm Reports</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card border-l-farm-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Fields</p>
              <p className="text-2xl font-bold">{totalFields}</p>
            </div>
            <MapPin className="h-8 w-8 text-farm-green" />
          </div>
        </div>
        <div className="stat-card border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Crops</p>
              <p className="text-2xl font-bold">{totalCrops}</p>
            </div>
            <Sprout className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="stat-card border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Workers</p>
              <p className="text-2xl font-bold">{totalWorkers}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="stat-card border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold">৳{totalExpenses.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Crop Progress</h3>
          <div className="h-64">
            <Bar
              data={cropProgressData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Expense by Category</h3>
          <div className="h-64 flex items-center justify-center">
            {Object.keys(categoryExpenses).length > 0 ? (
              <Doughnut
                data={expenseCategoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            ) : (
              <p className="text-gray-500">No expense data to display</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Task Completion Trend</h3>
          <div className="h-64">
            <Line
              data={taskTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-semibold">
                {crops.length > 0 ? Math.round(crops.reduce((a, c) => a + (c.progress || 0), 0) / crops.length) : 0}%
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Tasks Completed</span>
              <span className="font-semibold">{completedTasks}/{totalTasks}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Tasks Pending</span>
              <span className="font-semibold">{pendingTasks}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Best Performing Crop</span>
              <span className="font-semibold text-farm-green">{findBestCrop()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Highest Expense Crop</span>
              <span className="font-semibold text-orange-500">{findHighestExpenseCrop()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Total Workers</span>
              <span className="font-semibold">{totalWorkers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
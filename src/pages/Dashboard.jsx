// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Users,
  MapPin,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar as CalendarIcon,
  Droplets,
  Wind,
  Sun,
  Thermometer,
  Sprout,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isToday, isPast, parseISO } from 'date-fns';

const Dashboard = () => {
  const { fields, crops, tasks, workers, expenses, loading } = useFarm();
  const { user } = useAuth();
  
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Using free weather API (OpenWeatherMap)
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Dhaka,bd&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
        );
        if (response.ok) {
          const data = await response.json();
          setWeather({
            temp: Math.round(data.main.temp),
            humidity: data.main.humidity,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            windSpeed: data.wind.speed,
            feelsLike: Math.round(data.main.feels_like)
          });
        } else {
          // Fallback dummy weather
          setWeather({
            temp: 32,
            humidity: 68,
            description: 'Sunny',
            icon: '01d',
            windSpeed: 12,
            feelsLike: 34
          });
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        // Fallback dummy weather
        setWeather({
          temp: 32,
          humidity: 68,
          description: 'Sunny',
          icon: '01d',
          windSpeed: 12,
          feelsLike: 34
        });
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, []);

  // Calculate statistics
  const totalFields = fields.length;
  const totalCrops = crops.length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const totalWorkers = workers.length;
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t => t.status === 'pending' && t.due_date && isPast(parseISO(t.due_date))).length;
  const totalTasks = tasks.length;
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyBudget = 60000;
  const budgetUsed = (totalExpenses / monthlyBudget) * 100;
  const budgetWarning = budgetUsed > 80;

  // Calculate farm progress based on crop progress
  const cropProgresses = crops.map(c => c.progress || 0);
  const avgProgress = cropProgresses.length > 0 
    ? Math.round(cropProgresses.reduce((a, b) => a + b, 0) / cropProgresses.length)
    : 0;

  // Get today's tasks
  const todayTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    return isToday(parseISO(t.due_date));
  });

  // Get upcoming tasks (next 7 days)
  const upcomingTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    const dueDate = parseISO(t.due_date);
    const now = new Date();
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  // Get crop summary
  const cropSummary = crops.reduce((acc, crop) => {
    const cropName = crop.name;
    if (!acc[cropName]) {
      acc[cropName] = { count: 0, totalProgress: 0, fields: [] };
    }
    acc[cropName].count += 1;
    acc[cropName].totalProgress += crop.progress || 0;
    if (crop.field_id) {
      const field = fields.find(f => f.id === crop.field_id);
      if (field) acc[cropName].fields.push(field.name);
    }
    return acc;
  }, {});

  // Get weather icon
  const getWeatherIcon = (icon) => {
    if (icon.includes('01')) return <Sun className="h-12 w-12 text-yellow-500" />;
    if (icon.includes('02') || icon.includes('03') || icon.includes('04')) return <Droplets className="h-12 w-12 text-gray-400" />;
    if (icon.includes('09') || icon.includes('10')) return <Droplets className="h-12 w-12 text-blue-500" />;
    if (icon.includes('11')) return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    return <Sun className="h-12 w-12 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-farm-green to-farm-light rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">
          Welcome back, {user?.user_metadata?.name || 'Farmer'}! 🌾
        </h2>
        <p className="text-green-100 mt-1">
          Here's what's happening on your farm today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-sm text-gray-500">Active Workers</p>
              <p className="text-2xl font-bold">{activeWorkers}/{totalWorkers}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="stat-card border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasks Due Today</p>
              <p className="text-2xl font-bold">{todayTasks.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="card lg:col-span-1">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <Thermometer className="h-5 w-5" />
            Today's Weather
          </h3>
          {weatherLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ) : weather ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(weather.icon)}
                  <div>
                    <p className="text-3xl font-bold">{weather.temp}°C</p>
                    <p className="text-sm text-gray-500 capitalize">{weather.description}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span>Humidity: {weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span>Wind: {weather.windSpeed} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <span>Feels like: {weather.feelsLike}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span>Good for farming ✅</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Weather data unavailable</p>
          )}
        </div>

        {/* Farm Progress */}
        <div className="card lg:col-span-1">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5" />
            Farm Progress
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-semibold">{avgProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                <div
                  className="bg-farm-green rounded-full h-3 transition-all duration-500"
                  style={{ width: `${avgProgress}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Tasks Completed</span>
                <span className="font-semibold">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                <div
                  className="bg-blue-500 rounded-full h-3 transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Completed: {completedTasks}</span>
              <span className="text-gray-500">Pending: {pendingTasks}</span>
              {overdueTasks > 0 && (
                <span className="text-red-500 font-medium">⚠️ {overdueTasks} overdue</span>
              )}
            </div>
          </div>
        </div>

        {/* Budget Warning */}
        <div className="card lg:col-span-1">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5" />
            Budget Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly Budget</span>
              <span className="font-semibold">৳{monthlyBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Spent</span>
              <span className={`font-semibold ${budgetWarning ? 'text-red-500' : 'text-green-600'}`}>
                ৳{totalExpenses.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Remaining</span>
              <span className={`font-semibold ${monthlyBudget - totalExpenses < 0 ? 'text-red-500' : 'text-green-600'}`}>
                ৳{(monthlyBudget - totalExpenses).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
              <div
                className={`rounded-full h-3 transition-all duration-500 ${budgetWarning ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
              />
            </div>
            {budgetWarning && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2 text-red-700 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>You've used {Math.round(budgetUsed)}% of your budget!</span>
              </div>
            )}
            {monthlyBudget - totalExpenses < 0 && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-2 flex items-center gap-2 text-red-700 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Budget exceeded by ৳{(totalExpenses - monthlyBudget).toLocaleString()}!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <CalendarIcon className="h-5 w-5" />
            Today's Tasks
          </h3>
          <div className="space-y-2">
            {todayTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks for today. 🎉</p>
            ) : (
              todayTasks.slice(0, 5).map((task) => {
                const field = fields.find(f => f.id === task.field_id);
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          {field?.name || 'No field'} • {format(parseISO(task.due_date), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                );
              })
            )}
            {todayTasks.length > 5 && (
              <Link to="/tasks" className="text-farm-green text-sm hover:underline block text-center mt-2">
                View all {todayTasks.length} tasks
              </Link>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" />
            Upcoming Tasks (Next 7 Days)
          </h3>
          <div className="space-y-2">
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming tasks. 🎉</p>
            ) : (
              upcomingTasks.slice(0, 5).map((task) => {
                const field = fields.find(f => f.id === task.field_id);
                const daysUntil = Math.ceil((parseISO(task.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {field?.name || 'No field'} • {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(parseISO(task.due_date), 'MMM d')}
                    </span>
                  </div>
                );
              })
            )}
            {upcomingTasks.length > 5 && (
              <Link to="/calendar" className="text-farm-green text-sm hover:underline block text-center mt-2">
                View calendar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Crop Summary */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <Package className="h-5 w-5" />
          Crop Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(cropSummary).slice(0, 10).map(([name, data]) => (
            <div key={name} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="font-medium text-gray-800">{name}</p>
              <p className="text-sm text-gray-500">{data.count} field{data.count > 1 ? 's' : ''}</p>
              <p className="text-sm text-farm-green font-semibold">
                {Math.round(data.totalProgress / data.count)}% avg
              </p>
            </div>
          ))}
          {Object.keys(cropSummary).length === 0 && (
            <p className="text-gray-500 text-sm col-span-full text-center">No crops added yet.</p>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green"></div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Bot, Send, Sparkles, Loader } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

const AIAssistant = () => {
  const { fields, crops, tasks, workers, expenses } = useFarm();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "👋 Hello! I'm your AI Farm Assistant. I can help you with:\n\n• Checking field status and recommendations\n• Task management and reminders\n• Budget insights\n• Crop progress analysis\n• Worker assignments\n\nWhat would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getFarmInsights = () => {
    const insights = [];
    
    // Check overdue tasks
    const overdueTasks = tasks.filter(t => t.status === 'pending' && t.due_date && isPast(parseISO(t.due_date)));
    if (overdueTasks.length > 0) {
      insights.push(`⚠️ You have ${overdueTasks.length} overdue tasks that need attention.`);
    }

    // Check fields needing attention
    const fieldsNeedingAttention = fields.filter(f => f.status === 'attention' || f.status === 'critical');
    if (fieldsNeedingAttention.length > 0) {
      insights.push(`🌱 ${fieldsNeedingAttention.length} field(s) need attention: ${fieldsNeedingAttention.map(f => f.name).join(', ')}`);
    }

    // Check budget
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = 60000;
    if (totalExpenses > budget * 0.8) {
      insights.push(`💰 You've used ${Math.round((totalExpenses / budget) * 100)}% of your monthly budget.`);
    }

    // Check crops with low progress
    const lowProgressCrops = crops.filter(c => (c.progress || 0) < 30);
    if (lowProgressCrops.length > 0) {
      insights.push(`🌾 ${lowProgressCrops.length} crop(s) have low progress: ${lowProgressCrops.map(c => c.name).join(', ')}`);
    }

    // Upcoming harvests
    const upcomingHarvest = crops
      .filter(c => c.expected_harvest)
      .sort((a, b) => new Date(a.expected_harvest) - new Date(b.expected_harvest))
      .slice(0, 3);
    if (upcomingHarvest.length > 0) {
      insights.push(`🍅 Upcoming harvests: ${upcomingHarvest.map(c => `${c.name} (${format(parseISO(c.expected_harvest), 'MMM d')})`).join(', ')}`);
    }

    return insights;
  };

  const getTaskRecommendations = () => {
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length === 0) return "🎉 All tasks are completed! Great job!";
    
    const highPriority = pendingTasks.filter(t => t.priority === 'high');
    if (highPriority.length > 0) {
      return `🔥 Priority tasks for today:\n${highPriority.map(t => `• ${t.title}${t.due_date ? ` (Due: ${format(parseISO(t.due_date), 'MMM d')})` : ''}`).join('\n')}`;
    }
    
    return `📋 You have ${pendingTasks.length} pending tasks. Check the Tasks page to manage them.`;
  };

  const generateResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    let response = '';

    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      response = "👋 Hello! How can I help you with your farm today?";
    } else if (lowerQuery.includes('status') || lowerQuery.includes('overview') || lowerQuery.includes('summary')) {
      const insights = getFarmInsights();
      response = `📊 **Farm Status Summary**\n\n${insights.map(i => `• ${i}`).join('\n')}`;
    } else if (lowerQuery.includes('task') || lowerQuery.includes('what should i do')) {
      response = getTaskRecommendations();
    } else if (lowerQuery.includes('budget') || lowerQuery.includes('expense') || lowerQuery.includes('cost')) {
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const budget = 60000;
      const remaining = budget - totalExpenses;
      response = `💰 **Budget Overview**\n\n• Monthly Budget: ৳${budget.toLocaleString()}\n• Spent: ৳${totalExpenses.toLocaleString()}\n• Remaining: ৳${remaining.toLocaleString()}\n• Used: ${Math.round((totalExpenses / budget) * 100)}%\n\n${remaining < 0 ? '⚠️ You have exceeded your budget!' : remaining < 12000 ? '⚠️ You are close to your budget limit!' : '✅ Your budget is on track.'}`;
    } else if (lowerQuery.includes('field') || lowerQuery.includes('land')) {
      const totalFields = fields.length;
      const needsAttention = fields.filter(f => f.status === 'attention' || f.status === 'critical');
      response = `🌾 **Field Status**\n\n• Total Fields: ${totalFields}\n• Healthy: ${fields.filter(f => f.status === 'healthy').length}\n• Needs Attention: ${needsAttention.length}\n\n${needsAttention.length > 0 ? `⚠️ Fields needing attention: ${needsAttention.map(f => f.name).join(', ')}` : '✅ All fields are healthy!'}`;
    } else if (lowerQuery.includes('crop') || lowerQuery.includes('harvest')) {
      const totalCrops = crops.length;
      const avgProgress = totalCrops > 0 ? Math.round(crops.reduce((a, c) => a + (c.progress || 0), 0) / totalCrops) : 0;
      const upcomingHarvest = crops
        .filter(c => c.expected_harvest)
        .sort((a, b) => new Date(a.expected_harvest) - new Date(b.expected_harvest))
        .slice(0, 5);
      response = `🌱 **Crop Status**\n\n• Total Crops: ${totalCrops}\n• Average Progress: ${avgProgress}%\n\n${upcomingHarvest.length > 0 ? `🍅 Upcoming Harvests:\n${upcomingHarvest.map(c => `• ${c.name}: ${format(parseISO(c.expected_harvest), 'MMM d')}`).join('\n')}` : 'No upcoming harvests scheduled.'}`;
    } else if (lowerQuery.includes('worker') || lowerQuery.includes('staff') || lowerQuery.includes('employee')) {
      const totalWorkers = workers.length;
      const activeWorkers = workers.filter(w => w.status === 'active').length;
      const taskAssignments = tasks.filter(t => t.worker_id).length;
      response = `👷 **Worker Status**\n\n• Total Workers: ${totalWorkers}\n• Active: ${activeWorkers}\n• Inactive: ${totalWorkers - activeWorkers}\n• Total Task Assignments: ${taskAssignments}\n\n${workers.slice(0, 5).map(w => `• ${w.name}: ${w.role || 'Field Worker'} (${w.status})`).join('\n')}`;
    } else if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
      response = `🤖 **I can help you with:**\n\n• Farm status and insights\n• Task management and recommendations\n• Budget tracking and alerts\n• Crop progress analysis\n• Field health monitoring\n• Worker management\n• Upcoming harvests\n\nJust ask me anything about your farm!`;
    } else {
      const insights = getFarmInsights();
      response = `🤔 Here's what I can tell you about your farm:\n\n${insights.map(i => `• ${i}`).join('\n')}\n\nIs there anything specific you'd like to know?`;
    }

    return response;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const response = generateResponse(input);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-8 w-8 text-farm-green" />
        <h2 className="text-2xl font-bold text-gray-800">AI Assistant</h2>
        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Powered by AI</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 whitespace-pre-wrap ${
                  message.type === 'user'
                    ? 'bg-farm-green text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.type === 'bot' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-farm-green" />
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className="text-xs opacity-60 mt-1">
                  {format(message.timestamp, 'h:mm a')}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <Loader className="h-5 w-5 animate-spin text-farm-green" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about your farm..."
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-farm-green focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-5 w-5" />
              Send
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setInput("What's the farm status?")}
              className="text-xs px-3 py-1 border rounded-full hover:bg-gray-50 transition-colors"
            >
              📊 Status
            </button>
            <button
              type="button"
              onClick={() => setInput("What should I do today?")}
              className="text-xs px-3 py-1 border rounded-full hover:bg-gray-50 transition-colors"
            >
              📋 Tasks
            </button>
            <button
              type="button"
              onClick={() => setInput("How's my budget?")}
              className="text-xs px-3 py-1 border rounded-full hover:bg-gray-50 transition-colors"
            >
              💰 Budget
            </button>
            <button
              type="button"
              onClick={() => setInput("Show crop summary")}
              className="text-xs px-3 py-1 border rounded-full hover:bg-gray-50 transition-colors"
            >
              🌱 Crops
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
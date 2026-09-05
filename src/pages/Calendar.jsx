import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, parseISO, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';

const CalendarPage = () => {
  const { tasks, fields, crops, workers } = useFarm();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(parseISO(task.due_date), date);
    });
  };

  const getTaskStatusIcon = (status) => {
    return status === 'completed' 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayTasks = getTasksForDate(date);
      if (dayTasks.length > 0) {
        return (
          <div className="flex justify-center gap-0.5 mt-1">
            {dayTasks.slice(0, 3).map((task, idx) => (
              <span
                key={idx}
                className={`h-1.5 w-1.5 rounded-full ${
                  task.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
            ))}
            {dayTasks.length > 3 && (
              <span className="text-[8px] text-gray-500">+{dayTasks.length - 3}</span>
            )}
          </div>
        );
      }
    }
    return null;
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Calendar</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              className="w-full border-0"
              prevLabel={<span className="text-gray-600">‹</span>}
              nextLabel={<span className="text-gray-600">›</span>}
              prev2Label={<span className="text-gray-600">«</span>}
              next2Label={<span className="text-gray-600">»</span>}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <CalendarIcon className="h-5 w-5" />
            Tasks for {format(selectedDate, 'MMM d, yyyy')}
          </h3>
          
          {selectedDateTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No tasks for this day.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDateTasks.map((task) => {
                const field = fields.find(f => f.id === task.field_id);
                const crop = crops.find(c => c.id === task.crop_id);
                const worker = workers.find(w => w.id === task.worker_id);
                
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border ${
                      task.status === 'completed' ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.title}
                        </p>
                        <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                          {field && <p>📍 {field.name}</p>}
                          {crop && <p>🌱 {crop.name}</p>}
                          {worker && <p>👤 {worker.name}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                        {getTaskStatusIcon(task.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
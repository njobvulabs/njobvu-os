import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Calendar as CalIcon } from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  duration: number; // minutes
  type: 'work' | 'personal' | 'meeting' | 'other';
  description?: string;
}

export const CalendarApp: React.FC = () => {
  const { addNotification } = useOS();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form States
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');
  const [newEventDuration, setNewEventDuration] = useState(60);
  const [newEventType, setNewEventType] = useState<'work' | 'personal' | 'meeting'>('work');

  // Load events from local storage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('njobvu_calendar_events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        console.error("Failed to load events", e);
      }
    }
  }, []);

  // Save events to local storage on change
  useEffect(() => {
    localStorage.setItem('njobvu_calendar_events', JSON.stringify(events));
  }, [events]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date: Date) => {
    const key = formatDateKey(date);
    return events.filter(e => e.date === key).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;

    const event: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEventTitle,
      date: formatDateKey(selectedDate),
      startTime: newEventTime,
      duration: Number(newEventDuration),
      type: newEventType,
    };

    setEvents(prev => [...prev, event]);
    setIsAddModalOpen(false);
    setNewEventTitle('');
    addNotification('Calendar', `Added "${event.title}" to schedule`, 'success');
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const selectedDayEvents = getEventsForDate(selectedDate);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'work': return 'text-blue-400 border-l-blue-500';
      case 'personal': return 'text-green-400 border-l-green-500';
      case 'meeting': return 'text-purple-400 border-l-purple-500';
      default: return 'text-gray-400 border-l-gray-500';
    }
  };

  return (
    <div className="flex h-full bg-[#1e1e1e] text-gray-200 font-sans relative overflow-hidden">
      
      {/* Sidebar / Events List */}
      <div className="w-80 bg-[#252525] border-r border-[#3c3c3c] flex flex-col h-full">
        <div className="p-4 border-b border-[#3c3c3c]">
          <h2 className="text-xl font-bold text-white">{selectedDate.toLocaleDateString(undefined, { weekday: 'long' })}</h2>
          <p className="text-gray-400 text-sm">{selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedDayEvents.length === 0 ? (
            <div className="text-center text-gray-500 mt-10 italic flex flex-col items-center gap-2">
              <CalIcon size={24} />
              No events scheduled
            </div>
          ) : (
            selectedDayEvents.map(event => (
              <div key={event.id} className={`bg-[#2b2b2b] p-3 rounded-r-lg shadow-sm border-l-4 ${getEventTypeColor(event.type)} relative group`}>
                <div className="flex justify-between items-start">
                  <div className="text-xs font-bold uppercase opacity-70 mb-1 flex items-center gap-2">
                    {event.startTime} • {event.duration}m
                  </div>
                  <button 
                    onClick={() => deleteEvent(event.id)}
                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="font-semibold text-white">{event.title}</h3>
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-1 capitalize">
                  {event.type}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-[#3c3c3c]">
           <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Add Event
          </button>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="flex-1 p-6 flex flex-col bg-[#1e1e1e]">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{monthNames[currentDate.getMonth()]} <span className="text-gray-500">{currentDate.getFullYear()}</span></h2>
            <div className="flex gap-1 bg-[#2b2b2b] rounded p-1">
              <button onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded text-gray-300"><ChevronLeft size={20} /></button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded text-gray-300"><ChevronRight size={20} /></button>
            </div>
         </div>

         <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-bold text-gray-500 uppercase text-center py-2">{day}</div>
            ))}
         </div>

         <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
              const isSelected = day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth();
              const dayEvents = getEventsForDate(dateObj);
              
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    rounded-lg flex flex-col items-center justify-start py-2 transition-all relative border
                    ${isSelected ? 'bg-blue-600/20 border-blue-500' : 'bg-[#2b2b2b] border-[#3c3c3c] hover:border-gray-500'}
                  `}
                >
                  <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white font-bold' : 'text-gray-300'}`}>
                    {day}
                  </span>
                  
                  <div className="flex gap-0.5 mt-auto mb-1 flex-wrap justify-center px-2">
                     {dayEvents.slice(0, 4).map((ev, idx) => (
                       <div key={idx} className={`w-1.5 h-1.5 rounded-full ${ev.type === 'work' ? 'bg-blue-400' : ev.type === 'personal' ? 'bg-green-400' : 'bg-purple-400'}`}></div>
                     ))}
                     {dayEvents.length > 4 && <span className="text-[8px] text-gray-500 leading-none">+</span>}
                  </div>
                </button>
              );
            })}
         </div>
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddEvent} className="bg-[#2b2b2b] border border-[#3c3c3c] rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Add Event</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Title</label>
                <input 
                  autoFocus
                  className="w-full bg-[#1a1a1a] border border-[#3c3c3c] rounded p-2 text-white focus:border-blue-500 outline-none"
                  placeholder="Meeting with..."
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Time</label>
                  <input 
                    type="time"
                    className="w-full bg-[#1a1a1a] border border-[#3c3c3c] rounded p-2 text-white focus:border-blue-500 outline-none"
                    value={newEventTime}
                    onChange={e => setNewEventTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Duration (min)</label>
                  <input 
                    type="number"
                    className="w-full bg-[#1a1a1a] border border-[#3c3c3c] rounded p-2 text-white focus:border-blue-500 outline-none"
                    value={newEventDuration}
                    onChange={e => setNewEventDuration(Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Type</label>
                <div className="flex bg-[#1a1a1a] p-1 rounded border border-[#3c3c3c]">
                  {(['work', 'personal', 'meeting'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewEventType(t)}
                      className={`flex-1 py-1.5 text-xs capitalize rounded ${newEventType === t ? 'bg-[#3c3c3c] text-white font-bold shadow' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-300 hover:bg-[#3c3c3c] rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium">Save Event</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
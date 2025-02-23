// src/components/EventForm.tsx
import React, { useState } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import { CalendarEvent } from '../types/calendar';
import { Calendar, Clock, MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';

const formatDateForInput = (isoString: string) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

interface EventFormProps {
  onClose: () => void;
  initialEvent?: Partial<CalendarEvent>;
}

function EventForm({ onClose, initialEvent }: EventFormProps) {
  const { addEvent } = useCalendarStore();
  const [formData, setFormData] = useState({
    title: initialEvent?.title || '',
    description: initialEvent?.description || '',
    startTime: initialEvent?.startTime || new Date().toISOString(),
    endTime: initialEvent?.endTime || new Date(Date.now() + 3600000).toISOString(),
    location: initialEvent?.location || '',
    priority: initialEvent?.priority || 'medium',
    type: initialEvent?.type || 'meeting',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);

    if (endTime <= startTime) {
      toast.error('End time must be after start time');
      setIsSubmitting(false);
      return;
    }

    try {
      await addEvent(formData as Omit<CalendarEvent, 'id'>);
      toast.success(initialEvent ? 'Event updated!' : 'Event created!');
      onClose();
    } catch (error) {
      toast.error('Failed to save event');
      console.error('Event submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
          aria-label="Close"
          disabled={isSubmitting}
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          {initialEvent ? 'Edit Event' : 'New Event'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value.trim() }))}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="Event title"
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Event details"
              disabled={isSubmitting}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formatDateForInput(formData.startTime)}
                  onChange={(e) => {
                    const newStartTime = new Date(e.target.value);
                    if (!isNaN(newStartTime.getTime())) {
                      setFormData((prev) => ({ ...prev, startTime: newStartTime.toISOString() }));
                    }
                  }}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formatDateForInput(formData.endTime)}
                  onChange={(e) => {
                    const newEndTime = new Date(e.target.value);
                    if (!isNaN(newEndTime.getTime())) {
                      setFormData((prev) => ({ ...prev, endTime: newEndTime.toISOString() }));
                    }
                  }}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value.trim() }))}
                className="w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add location"
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as CalendarEvent['priority'] }))}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isSubmitting}
              >
                <option value="meeting">Meeting</option>
                <option value="task">Task</option>
                <option value="reminder">Reminder</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : initialEvent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;
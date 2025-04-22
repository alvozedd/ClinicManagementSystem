import React, { useState } from 'react';
import { Calendar, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarStyles.css';

const CustomCalendar = ({
  localizer,
  events,
  onSelectEvent,
  onSelectSlot,
  selectable = false,
  components,
  eventPropGetter
}) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  // Custom toolbar component
  const CustomToolbar = (toolbar) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
      setDate(new Date());
    };

    const goToPrev = () => {
      toolbar.onNavigate('PREV');
      let newDate = new Date(date);
      if (view === 'month') {
        newDate.setMonth(date.getMonth() - 1);
      } else if (view === 'week') {
        newDate.setDate(date.getDate() - 7);
      } else {
        newDate.setDate(date.getDate() - 1);
      }
      setDate(newDate);
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
      let newDate = new Date(date);
      if (view === 'month') {
        newDate.setMonth(date.getMonth() + 1);
      } else if (view === 'week') {
        newDate.setDate(date.getDate() + 7);
      } else {
        newDate.setDate(date.getDate() + 1);
      }
      setDate(newDate);
    };

    const goToView = (newView) => {
      toolbar.onView(newView);
      setView(newView);
    };

    const label = () => {
      const dateFormat = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
        day: view === 'day' ? 'numeric' : undefined,
      });

      if (view === 'week') {
        // For week view, show the week range
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const startFormat = new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
        });

        const endFormat = new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        return `${startFormat.format(start)} - ${endFormat.format(end)}`;
      }

      return dateFormat.format(date);
    };

    return (
      <div className="rbc-toolbar">
        <div className="rbc-btn-group">
          <button type="button" onClick={goToToday}>Today</button>
          <button type="button" onClick={goToPrev}>Back</button>
          <button type="button" onClick={goToNext}>Next</button>
        </div>
        <span className="rbc-toolbar-label">{label()}</span>
        <div className="rbc-btn-group">
          <button
            type="button"
            onClick={() => goToView('month')}
            className={view === 'month' ? 'rbc-active' : ''}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => goToView('week')}
            className={view === 'week' ? 'rbc-active' : ''}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => goToView('day')}
            className={view === 'day' ? 'rbc-active' : ''}
          >
            Day
          </button>
        </div>
      </div>
    );
  };

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: '500px' }} // Fixed height instead of 100%
      view={view}
      date={date}
      onView={setView}
      onNavigate={setDate}
      onSelectEvent={onSelectEvent}
      onSelectSlot={onSelectSlot}
      selectable={selectable}
      min={new Date(new Date().setHours(8, 0, 0, 0))} // 8:00 AM
      max={new Date(new Date().setHours(17, 0, 0, 0))} // 5:00 PM
      step={30} // 30 minute intervals
      timeslots={1} // 1 slot per step (30 minutes)
      components={{
        ...components,
        toolbar: CustomToolbar
      }}
      eventPropGetter={eventPropGetter}
      popup={true}
      length={60} // Shorter time slots
    />
  );
};

export default CustomCalendar;

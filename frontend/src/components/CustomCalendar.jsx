import React, { useState, useCallback } from 'react';
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

  // Custom date cell component to show appointment counts
  const DateCellWrapper = useCallback(
    ({ children, value }) => {
      // Count events for this date
      const eventCount = events.filter(event => {
        const eventDate = new Date(event.start);
        return (
          eventDate.getDate() === value.getDate() &&
          eventDate.getMonth() === value.getMonth() &&
          eventDate.getFullYear() === value.getFullYear()
        );
      }).length;

      // Determine badge class based on count
      let badgeClass = '';
      if (eventCount > 0) {
        if (eventCount >= 5) {
          badgeClass = 'appointment-count-high'; // Many appointments
        } else if (eventCount >= 3) {
          badgeClass = 'appointment-count-medium'; // Several appointments
        } else {
          badgeClass = 'appointment-count-low'; // Few appointments
        }
      }

      // Check if this is a weekend day
      const day = value.getDay();
      const isWeekend = day === 0 || day === 6; // 0 is Sunday, 6 is Saturday

      return (
        <div className={`relative ${isWeekend ? 'weekend-cell' : ''}`}>
          {eventCount > 0 && (
            <div className={`appointment-count-badge ${badgeClass}`}>
              {eventCount}
            </div>
          )}
          {children}
        </div>
      );
    },
    [events]
  );

  // Custom week/day header cell component to show appointment counts
  const HeaderCellWrapper = useCallback(
    ({ children, date }) => {
      // Count events for this date
      const eventCount = events.filter(event => {
        const eventDate = new Date(event.start);
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        );
      }).length;

      // Determine badge class based on count
      let badgeClass = '';
      if (eventCount > 0) {
        if (eventCount >= 5) {
          badgeClass = 'appointment-count-high'; // Many appointments
        } else if (eventCount >= 3) {
          badgeClass = 'appointment-count-medium'; // Several appointments
        } else {
          badgeClass = 'appointment-count-low'; // Few appointments
        }
      }

      // Check if this is a weekend day
      const day = date.getDay();
      const isWeekend = day === 0 || day === 6; // 0 is Sunday, 6 is Saturday

      return (
        <div className={`relative ${isWeekend ? 'weekend-cell' : ''}`}>
          {eventCount > 0 && (
            <div className={`appointment-count-badge ${badgeClass}`}>
              {eventCount}
            </div>
          )}
          {children}
        </div>
      );
    },
    [events]
  );

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: '650px' }} // Increased height to show more content
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
        toolbar: CustomToolbar,
        dateCellWrapper: DateCellWrapper,
        headerCellWrapper: HeaderCellWrapper
      }}
      eventPropGetter={eventPropGetter}
      popup={true}
      length={60} // Shorter time slots
    />
  );
};

export default CustomCalendar;

// Function to get a time-based greeting
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 17) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
};

// Function to get current date in a readable format
export const getFormattedDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Function to get date ranges for filtering appointments
export const getDateRanges = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeekStart = new Date(today);
  nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));

  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  return {
    today: today.toISOString().split('T')[0],
    tomorrow: tomorrow.toISOString().split('T')[0],
    thisWeekEnd: nextWeekStart.toISOString().split('T')[0],
    nextWeekStart: nextWeekStart.toISOString().split('T')[0],
    nextWeekEnd: nextWeekEnd.toISOString().split('T')[0],
    thisMonthEnd: thisMonthEnd.toISOString().split('T')[0],
    nextMonthEnd: nextMonthEnd.toISOString().split('T')[0]
  };
};

// Function to filter appointments by time period
export const filterAppointmentsByTimePeriod = (appointments, period) => {
  if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
    return [];
  }

  const dateRanges = getDateRanges();
  const today = dateRanges.today;

  switch (period) {
    case 'today':
      return appointments.filter(a => a.date === today);

    case 'tomorrow':
      return appointments.filter(a => a.date === dateRanges.tomorrow);

    case 'thisWeek':
      return appointments.filter(a =>
        a.date >= today && a.date <= dateRanges.thisWeekEnd
      );

    case 'nextWeek':
      return appointments.filter(a =>
        a.date >= dateRanges.nextWeekStart && a.date <= dateRanges.nextWeekEnd
      );

    case 'thisMonth':
      return appointments.filter(a =>
        a.date >= today && a.date <= dateRanges.thisMonthEnd
      );

    case 'nextMonth':
      return appointments.filter(a =>
        a.date > dateRanges.thisMonthEnd && a.date <= dateRanges.nextMonthEnd
      );

    case 'upcoming':
      return appointments.filter(a => a.date >= today);

    case 'past':
      return appointments.filter(a => a.date < today);

    case 'needsDiagnosis':
      return appointments.filter(a =>
        // Past appointments that are completed but have no diagnosis
        (a.date < today && a.status === 'Completed' && !a.diagnosis) ||
        // Past appointments that are still scheduled (time has passed but status not updated)
        (a.date < today && a.status === 'Scheduled')
      );

    default:
      return appointments;
  }
};

// Function to identify appointments that need diagnoses
export const identifyAppointmentsNeedingDiagnosis = (appointments) => {
  if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
    return [];
  }

  const today = new Date().toISOString().split('T')[0];

  return appointments.filter(appointment => {
    // Past appointments that are completed but have no diagnosis
    const isCompletedWithoutDiagnosis =
      appointment.status === 'Completed' &&
      !appointment.diagnosis &&
      appointment.date <= today;

    // Past appointments that are still scheduled (time has passed but status not updated)
    const isPastScheduled =
      appointment.status === 'Scheduled' &&
      appointment.date < today;

    return isCompletedWithoutDiagnosis || isPastScheduled;
  });
};

// Function to update appointment statuses based on time
export const updateAppointmentStatuses = (appointments) => {
  if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
    return appointments;
  }

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  return appointments.map(appointment => {
    // Skip appointments that already have diagnoses
    if (appointment.diagnosis || (appointment.diagnoses && appointment.diagnoses.length > 0)) {
      return appointment;
    }

    // Skip cancelled appointments
    if (appointment.status === 'Cancelled') {
      return appointment;
    }

    // Check if appointment date has passed
    if (appointment.date < today) {
      // Past appointment without diagnosis should be marked as needing diagnosis
      return {
        ...appointment,
        status: 'Needs Diagnosis',
        needsDiagnosis: true
      };
    }

    // Check if appointment is today but the time has passed
    if (appointment.date === today && appointment.time) {
      const [hours, minutes] = appointment.time.split(':').map(Number);
      const appointmentTime = new Date(now);
      appointmentTime.setHours(hours, minutes, 0, 0);

      if (now > appointmentTime) {
        // Today's appointment with passed time should be marked as needing diagnosis
        return {
          ...appointment,
          status: 'Needs Diagnosis',
          needsDiagnosis: true
        };
      }
    }

    return appointment;
  });
};

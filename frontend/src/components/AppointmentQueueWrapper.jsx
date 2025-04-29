import SimpleAppointmentQueue from './SimpleAppointmentQueue';

/**
 * A wrapper component that uses SimpleAppointmentQueue
 * We've removed the react-beautiful-dnd dependency to fix deployment issues
 */
function AppointmentQueueWrapper(props) {
  // Always use the simple queue implementation that doesn't rely on react-beautiful-dnd
  return <SimpleAppointmentQueue {...props} />;
}

export default AppointmentQueueWrapper;

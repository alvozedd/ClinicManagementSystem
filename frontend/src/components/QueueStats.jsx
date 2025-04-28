import { FaUserClock, FaUserCheck, FaUserTimes, FaUsers, FaWalking, FaCalendarCheck } from 'react-icons/fa';

function QueueStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col">
        <div className="text-blue-500 mb-1">
          <FaUsers className="inline mr-1" />
          <span className="text-sm font-medium">Total</span>
        </div>
        <div className="text-2xl font-bold text-blue-800">{stats.totalPatients}</div>
        <div className="text-xs text-blue-600 mt-1">Patients today</div>
      </div>

      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex flex-col">
        <div className="text-yellow-500 mb-1">
          <FaUserClock className="inline mr-1" />
          <span className="text-sm font-medium">Waiting</span>
        </div>
        <div className="text-2xl font-bold text-yellow-800">{stats.waitingPatients}</div>
        <div className="text-xs text-yellow-600 mt-1">In waiting room</div>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col">
        <div className="text-blue-500 mb-1">
          <FaUserCheck className="inline mr-1" />
          <span className="text-sm font-medium">In Progress</span>
        </div>
        <div className="text-2xl font-bold text-blue-800">{stats.inProgressPatients}</div>
        <div className="text-xs text-blue-600 mt-1">Currently with doctor</div>
      </div>

      <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex flex-col">
        <div className="text-green-500 mb-1">
          <FaUserCheck className="inline mr-1" />
          <span className="text-sm font-medium">Completed</span>
        </div>
        <div className="text-2xl font-bold text-green-800">{stats.completedPatients}</div>
        <div className="text-xs text-green-600 mt-1">Finished today</div>
      </div>

      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 flex flex-col">
        <div className="text-purple-500 mb-1">
          <FaWalking className="inline mr-1" />
          <span className="text-sm font-medium">Walk-ins</span>
        </div>
        <div className="text-2xl font-bold text-purple-800">{stats.walkInPatients}</div>
        <div className="text-xs text-purple-600 mt-1">Without appointment</div>
      </div>

      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex flex-col">
        <div className="text-indigo-500 mb-1">
          <FaCalendarCheck className="inline mr-1" />
          <span className="text-sm font-medium">Appointments</span>
        </div>
        <div className="text-2xl font-bold text-indigo-800">{stats.appointmentPatients}</div>
        <div className="text-xs text-indigo-600 mt-1">Scheduled visits</div>
      </div>
    </div>
  );
}

export default QueueStats;

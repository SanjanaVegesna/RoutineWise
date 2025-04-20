// src/components/TaskList.jsx
import React from 'react';

const TaskList = ({ tasks }) => {
  return (
    <div className="w-1/3 bg-gray-100 p-4 rounded">
      <h2 className="text-lg font-bold mb-4">🗂️ Tasks Today</h2>
      <ul className="space-y-2">
        {tasks.map((task, idx) => (
          <li key={idx} className="p-3 bg-white rounded shadow text-sm font-medium text-gray-700">
            {task}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;

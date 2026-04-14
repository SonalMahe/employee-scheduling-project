import { useState } from "react";
import "./SchedulePage.css";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const shifts = ["Morning", "Afternoon", "Night"];

const SchedulePage = () => {
  const [schedule, setSchedule] = useState ({});
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const handleAssign = (day, shift) => {
    if (!selectedEmployee) {
      alert("Select employee first");
      return;
    }

    const key = `${day}-${shift}`;
    setSchedule({
      ...schedule,
      [key]: selectedEmployee,
    });
  };

  return (
    <div className="schedule-container">
      <h2 className="title">Job Schedule</h2>

      {/* Select Employee */}
      <div className="select-box">
        <label>Select Employee: </label>
        <input
          type="text"
          placeholder="Enter employee name"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
        />
      </div>

      {/* Schedule Table */}
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Shift / Day</th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {shifts.map((shift) => (
            <tr key={shift}>
              <td className="shift-name">{shift}</td>

              {days.map((day) => {
                const key = `${day}-${shift}`;
                return (
                  <td
                    key={key}
                    className="cell"
                    onClick={() => handleAssign(day, shift)}
                  >
                    {schedule[key] || "Assign"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SchedulePage;

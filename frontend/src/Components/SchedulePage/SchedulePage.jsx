import { useState, useEffect } from "react";
import { getSchedule, updateSchedule, getEmployees, getAvailableEmployees, loadSession } from "../../Api/api";
import "./SchedulePage.css";

const DAY_ENUM = {
  0: "SUNDAY", 1: "MONDAY", 2: "TUESDAY", 3: "WEDNESDAY",
  4: "THURSDAY", 5: "FRIDAY", 6: "SATURDAY",
};
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const shifts = ["MORNING", "AFTERNOON", "NIGHT"];
const SHIFT_TIMES = { MORNING: "7–15", AFTERNOON: "15–18", NIGHT: "18–23" };

const toLocalIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function getWeekDays(baseDate = new Date()) {
  const date = new Date(baseDate);
  const dayOfWeek = date.getDay();
  const offset = (dayOfWeek >= 3) ? dayOfWeek - 3 : dayOfWeek + 4;
  const wednesday = new Date(date);
  wednesday.setDate(date.getDate() - offset);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(wednesday);
    d.setDate(wednesday.getDate() + i);
    weekDays.push({
      date: d,
      isoDate: toLocalIso(d),
      label: DAY_LABELS[d.getDay()],
      dateStr: `${d.getDate()}/${d.getMonth() + 1}`,
      dayEnum: DAY_ENUM[d.getDay()],
    });
  }
  return weekDays;
}

const SchedulePage = () => {
  const session = loadSession();
  const isEmployer = session?.role === "EMPLOYER";

  const [weekDays] = useState(() => getWeekDays());
  const [schedule, setSchedule] = useState({});
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [availableEmps, setAvailableEmps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scheduleData, empData] = await Promise.all([
        getSchedule({
          startDate: weekDays[0]?.isoDate,
          endDate: weekDays[weekDays.length - 1]?.isoDate,
        }),
        isEmployer ? getEmployees() : Promise.resolve([]),
      ]);

      // Map schedule: { "2026-04-15-MORNING": [{ name, position, id }, ...] }
      const mapped = {};
      if (Array.isArray(scheduleData)) {
        scheduleData.forEach((entry) => {
          const dateStr = toLocalIso(new Date(entry.date));
          const shiftName = entry.shift?.name || "";
          const key = `${dateStr}-${shiftName}`;
          if (!mapped[key]) mapped[key] = [];
          mapped[key].push({
            name: entry.employee?.user?.name || "Assigned",
            position: entry.employee?.user?.position || "",
            id: entry.id,
          });
        });
      }
      setSchedule(mapped);
      setEmployees(empData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async (dayInfo, shift) => {
    if (!isEmployer) return;
    setSelectedCell({ dayInfo, shift });
    setSelectedEmpId("");
    setModalOpen(true);

    // Fetch employees available for this shift + day
    try {
      const avail = await getAvailableEmployees(dayInfo.dayEnum, shift);
      setAvailableEmps(Array.isArray(avail) ? avail : []);
    } catch (err) {
      console.error(err);
      setAvailableEmps([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedEmpId || !selectedCell) return;
    try {
      await updateSchedule({
        entries: [{
          employeeId: parseInt(selectedEmpId),
          shiftName: selectedCell.shift,
          date: selectedCell.dayInfo.isoDate,
        }],
      });
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getCellInfo = (dayInfo, shift) => {
    const key = `${dayInfo.isoDate}-${shift}`;
    return schedule[key] || [];
  };

  if (loading) {
    return (
      <div className="schedule-container">
        <div className="schedule-card"><p className="loading">Loading...</p></div>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <div className="schedule-card">
        <h2 className="schedule-title">{isEmployer ? "Job Schedule" : "My Work Schedule"}</h2>

        <table className="schedule-table">
          <thead>
            <tr>
              <th>Shift</th>
              {weekDays.map((d) => (
                <th key={d.isoDate}>
                  <span className="day-name">{d.label}</span>
                  <span className="day-date">{d.dateStr}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {shifts.map((shift) => (
              <tr key={shift}>
                <td className="shift-name">
                  {shift.charAt(0) + shift.slice(1).toLowerCase()}
                  <span className="shift-time">{SHIFT_TIMES[shift]}</span>
                </td>

                {weekDays.map((d) => {
                  const entries = getCellInfo(d, shift);
                  return (
                    <td
                      key={d.isoDate}
                      className={`sched-cell ${entries.length ? "assigned" : ""} ${isEmployer ? "clickable" : ""}`}
                      onClick={() => openAssignModal(d, shift)}
                    >
                      {entries.length > 0 ? (
                        <div className="assigned-stack">
                          {entries.map((info) => (
                            <div className="assigned-badge" key={info.id}>
                              <span className="confirmed-tick">&#10003;</span>
                              <span className="assigned-name">{info.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="unassigned-text">
                          {isEmployer ? "Assign" : "—"}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ASSIGN MODAL */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Assign Employee</h2>
            <p className="modal-day-label">
              {selectedCell.dayInfo.label} {selectedCell.dayInfo.dateStr} — {selectedCell.shift.charAt(0) + selectedCell.shift.slice(1).toLowerCase()} shift ({SHIFT_TIMES[selectedCell.shift]})
            </p>

            {availableEmps.length > 0 ? (
              <div className="avail-list">
                <p className="avail-heading">Available employees:</p>
                {availableEmps.map((a) => {
                  const isPreferred = a.status === "PREFERRED";
                  return (
                    <button
                      key={a.employee.id}
                      className={`avail-emp-btn ${selectedEmpId === String(a.employee.id) ? "selected" : ""} ${isPreferred ? "preferred" : ""}`}
                      onClick={() => setSelectedEmpId(String(a.employee.id))}
                    >
                      <span className="avail-emp-name">{a.employee.user.name}</span>
                      <span className="avail-emp-pos">{a.employee.user.position || ""}</span>
                      {isPreferred && <span className="avail-badge preferred-badge">Preferred</span>}
                      {!isPreferred && <span className="avail-badge available-badge">Available</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="avail-list">
                <p className="avail-heading no-avail">No employees marked availability for this shift.</p>
              </div>
            )}

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button
                className="confirm-btn"
                disabled={!selectedEmpId}
                onClick={handleAssign}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;

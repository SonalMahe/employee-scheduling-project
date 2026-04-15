import React, { useEffect, useState } from "react";
import {
  getAvailability,
  updateAvailability,
  getSchedule,
  loadSession,
} from "../../Api/api";
import "./EmployeeAvailability.css";
import Header from "../Header/Header";

// Map day index (0=Sun) to backend enum value
const DAY_ENUM = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const shifts = ["morning", "afternoon", "night"];
const SHIFT_MAP = { morning: "MORNING", afternoon: "AFTERNOON", night: "NIGHT" };

// Get the current week starting from Wednesday
function getWeekDays(baseDate = new Date()) {
  const date = new Date(baseDate);
  const dayOfWeek = date.getDay(); // 0=Sun
  // Calculate offset to most recent Wednesday (3)
  const offset = (dayOfWeek >= 3) ? dayOfWeek - 3 : dayOfWeek + 4;
  const wednesday = new Date(date);
  wednesday.setDate(date.getDate() - offset);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(wednesday);
    d.setDate(wednesday.getDate() + i);
    weekDays.push({
      date: d,
      label: DAY_LABELS[d.getDay()],
      dateStr: `${d.getDate()}/${d.getMonth() + 1}`,
      dayEnum: DAY_ENUM[d.getDay()],
    });
  }
  return weekDays;
}

const EmployeeAvailability = () => {
  const session = loadSession();
  const employeeId = session?.employeeId;

  const [weekDays] = useState(() => getWeekDays());
  const [availability, setAvailability] = useState({});
  const [confirmed, setConfirmed] = useState({});
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    fetchAvailability();
    fetchSchedule();
  }, []);

  const fetchAvailability = async () => {
    try {
      const data = await getAvailability(employeeId);
      const mapped = {};
      if (Array.isArray(data)) {
        data.forEach((entry) => {
          const key = `${entry.dayOfWeek}-${entry.shift?.name || ""}`;
          mapped[key] = entry.status;
        });
      }
      setAvailability(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch employer-confirmed schedule entries for the current week
  const fetchSchedule = async () => {
    try {
      const data = await getSchedule();
      // Map to { "YYYY-MM-DD-MORNING": createdAt, ... }
      const mapped = {};
      if (Array.isArray(data)) {
        data.forEach((entry) => {
          const dateObj = new Date(entry.date);
          const dayEnum = DAY_ENUM[dateObj.getDay()];
          const shiftName = entry.shift?.name || "";
          const key = `${dayEnum}-${shiftName}`;
          mapped[key] = entry.createdAt;
        });
      }
      setConfirmed(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (dayInfo, shift) => {
    setSelected({ dayInfo, shift });
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      let entries = [];
      const dayKey = selected.dayInfo.dayEnum;

      if (selectedOption === "available") {
        // Set ALL shifts for this day to available
        entries = shifts.map((s) => ({
          dayOfWeek: dayKey,
          shiftName: SHIFT_MAP[s],
          status: "AVAILABLE",
        }));
      } else if (selectedOption === "unavailable") {
        // Set this specific shift to unavailable
        entries = [{
          dayOfWeek: dayKey,
          shiftName: SHIFT_MAP[selected.shift],
          status: "UNAVAILABLE",
        }];
      } else {
        // Prefer a specific shift
        entries = [{
          dayOfWeek: dayKey,
          shiftName: SHIFT_MAP[selectedOption],
          status: "PREFERRED",
        }];
      }

      await updateAvailability(employeeId, { availabilities: entries });

      setModalOpen(false);
      setSelectedOption(null);

      fetchAvailability(); // refresh grid
    } catch (err) {
      console.error(err);
    }
  };

  const SHIFT_TIMES = { morning: "7–15", afternoon: "15–18", night: "18–23" };

  const formatConfirmedTime = (isoDate) => {
    const d = new Date(isoDate);
    return d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const getStatusInfo = (dayEnum, shift) => {
    const key = `${dayEnum}-${SHIFT_MAP[shift]}`;

    // Check if employer has confirmed this shift
    if (confirmed[key]) {
      return {
        className: "cell confirmed",
        label: `Confirmed ${SHIFT_TIMES[shift]}`,
        subLabel: formatConfirmedTime(confirmed[key]),
      };
    }

    const status = availability[key];
    if (status === "AVAILABLE") return { className: "cell available", label: "Available", subLabel: null };
    if (status === "UNAVAILABLE") return { className: "cell unavailable", label: "Unavailable", subLabel: null };
    if (status === "PREFERRED") return { className: "cell prefer", label: `Preferred ${SHIFT_TIMES[shift]}`, subLabel: null };
    return { className: "cell", label: null, subLabel: null };
  };

  return (
    <div className="availability-container">
      <Header />
      <div className="availability-card">
        <h2 className="availability-title">My Availability</h2>

        <table className="availability-table">
          <thead>
            <tr>
              <th></th>
              {weekDays.map((d) => (
                <th key={d.dayEnum}>
                  <span className="day-name">{d.label}</span>
                  <span className="day-date">{d.dateStr}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {shifts.map((shift) => (
              <tr key={shift}>
                <td className="shift-label">{shift} shift</td>

                {weekDays.map((d) => {
                  const info = getStatusInfo(d.dayEnum, shift);
                  return (
                    <td key={d.dayEnum} className={info.className}>
                      <button
                        className={`choose-btn ${info.label ? 'has-status' : ''} ${info.subLabel ? 'confirmed-btn' : ''}`}
                        onClick={() => !info.subLabel && openModal(d, shift)}
                        disabled={!!info.subLabel}
                      >
                        {info.label || 'Choose availability'}
                        {info.subLabel && <span className="confirmed-time">{info.subLabel}</span>}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Select availability</h2>
            <p className="modal-day-label">
              {selected.dayInfo.label} {selected.dayInfo.dateStr}
            </p>

            {/* OPTIONS */}
            <button
              className={`option-btn option-available ${selectedOption === "available" ? "active" : ""}`}
              onClick={() => setSelectedOption("available")}
            >
              Available all day
            </button>

            <button
              className={`option-btn option-unavailable ${selectedOption === "unavailable" ? "active" : ""}`}
              onClick={() => setSelectedOption("unavailable")}
            >
              Unavailable
            </button>

            <p className="prefer-label">I prefer:</p>

            <button
              className={`option-btn option-morning ${selectedOption === "morning" ? "active" : ""}`}
              onClick={() => setSelectedOption("morning")}
            >
              Morning (7–15)
            </button>

            <button
              className={`option-btn option-afternoon ${selectedOption === "afternoon" ? "active" : ""}`}
              onClick={() => setSelectedOption("afternoon")}
            >
              Afternoon (15–18)
            </button>

            <button
              className={`option-btn option-night ${selectedOption === "night" ? "active" : ""}`}
              onClick={() => setSelectedOption("night")}
            >
              Night (18–23)
            </button>

            {/* ACTIONS */}
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                disabled={!selectedOption}
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAvailability;

import React, { useEffect, useState } from "react";
import {
  getAvailability,
  updateAvailability,
  loadSession,
} from "../../Api/api";
import "./EmployeeAvailability.css";

const days = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];
const shifts = ["morning", "afternoon", "night"];

const EmployeeAvailability = () => {
  const session = loadSession();
  const employeeId = session?.employeeId;

  const [availability, setAvailability] = useState({});
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const data = await getAvailability(employeeId);
      setAvailability(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (day, shift) => {
    setSelected({ day, shift });
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      let payload;

      if (selectedOption === "available") {
        payload = {
          day: selected.day,
          shift: selected.shift,
          available: true,
        };
      } else if (selectedOption === "unavailable") {
        payload = {
          day: selected.day,
          shift: selected.shift,
          available: false,
        };
      } else {
        payload = {
          day: selected.day,
          shift: selectedOption,
          preferred: true,
        };
      }

      await updateAvailability(employeeId, payload);

      setModalOpen(false);
      setSelectedOption(null);

      fetchAvailability(); // refresh grid
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusClass = (day, shift) => {
    const key = `${day}-${shift}`;
    const status = availability[key];

    if (status === "available") return "cell available";
    if (status === "unavailable") return "cell unavailable";
    if (status === "prefer") return "cell prefer";
    return "cell";
  };

  return (
    <div className="availability-container">
      <h2>My Availability</h2>

      <table className="availability-table">
        <thead>
          <tr>
            <th></th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {shifts.map((shift) => (
            <tr key={shift}>
              <td className="shift-label">{shift} shift</td>

              {days.map((day) => (
                <td key={day} className={getStatusClass(day, shift)}>
                  <button
                    className="choose-btn"
                    onClick={() => openModal(day, shift)}
                  >
                    Choose availability
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Select availability</h2>

            {/* OPTIONS */}
            <button
              className={`option-btn ${selectedOption === "available" ? "active" : ""}`}
              onClick={() => setSelectedOption("available")}
            >
              Available all day
            </button>

            <button
              className={`option-btn ${selectedOption === "unavailable" ? "active" : ""}`}
              onClick={() => setSelectedOption("unavailable")}
            >
              Unavailable
            </button>

            <p>I prefer:</p>

            <button
              className={`option-btn ${selectedOption === "morning" ? "active" : ""}`}
              onClick={() => setSelectedOption("morning")}
            >
              Morning (7–15)
            </button>

            <button
              className={`option-btn ${selectedOption === "afternoon" ? "active" : ""}`}
              onClick={() => setSelectedOption("afternoon")}
            >
              Afternoon (15–18)
            </button>

            <button
              className={`option-btn ${selectedOption === "night" ? "active" : ""}`}
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

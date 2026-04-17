import { useState, useEffect, useCallback } from "react";
import { getSchedule, loadSession } from "../../Api/api";
import "./WorkSchedule.css";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_ENUM = {
  0: "SUNDAY", 1: "MONDAY", 2: "TUESDAY", 3: "WEDNESDAY",
  4: "THURSDAY", 5: "FRIDAY", 6: "SATURDAY",
};
const SHIFT_TIMES = { MORNING: "7–15", AFTERNOON: "15–18", NIGHT: "18–23" };

const toLocalIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function getWednesday(baseDate = new Date()) {
  const date = new Date(baseDate);
  const dayOfWeek = date.getDay();
  const offset = dayOfWeek >= 3 ? dayOfWeek - 3 : dayOfWeek + 4;
  date.setDate(date.getDate() - offset);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekDays(wednesday) {
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

function formatWeekLabel(wednesday) {
  const tue = new Date(wednesday);
  tue.setDate(wednesday.getDate() + 6);
  const opts = { day: "numeric", month: "short" };
  return `${wednesday.toLocaleDateString("en-GB", opts)} – ${tue.toLocaleDateString("en-GB", opts)}`;
}

const WorkSchedule = () => {
  const session = loadSession();
  const isEmployer = session?.role === "EMPLOYER";

  const [baseWed, setBaseWed] = useState(() => getWednesday());
  const [weekDays, setWeekDays] = useState(() => getWeekDays(getWednesday()));
  const [employeeSchedules, setEmployeeSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayIso = toLocalIso(new Date());
  const isCurrentWeek = getWednesday().getTime() === baseWed.getTime();

  const navigateWeek = useCallback((offset) => {
    setBaseWed((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + offset * 7);
      return next;
    });
  }, []);

  const goToToday = useCallback(() => {
    setBaseWed(getWednesday());
  }, []);

  // Recompute weekDays and fetch data whenever baseWed changes
  useEffect(() => {
    const days = getWeekDays(baseWed);
    setWeekDays(days);

    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const data = await getSchedule({
          startDate: days[0]?.isoDate,
          endDate: days[days.length - 1]?.isoDate,
        });

        if (!Array.isArray(data)) {
          setEmployeeSchedules([]);
          return;
        }

        const byEmployee = {};
        data.forEach((entry) => {
          const name = entry.employee?.user?.name || "Unknown";
          if (!byEmployee[name]) byEmployee[name] = {};
          const isoDate = toLocalIso(new Date(entry.date));
          if (!byEmployee[name][isoDate]) byEmployee[name][isoDate] = [];
          byEmployee[name][isoDate].push(entry.shift?.name || "");
        });

        setEmployeeSchedules(
          Object.entries(byEmployee).map(([name, days]) => ({ name, days }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [baseWed]);

  return (
    <div className="work-sched-container">
      <div className="work-sched-card">
        <h2 className="work-sched-title">{isEmployer ? "Work Schedule" : "My Work Schedule"}</h2>

        {/* ── Week Navigation Bar ── */}
        <div className="week-nav">
          <button className="week-nav-btn" onClick={() => navigateWeek(-1)} title="Previous week">
            &#8249;
          </button>

          <span className="week-label">{formatWeekLabel(baseWed)}</span>

          <button className="week-nav-btn" onClick={() => navigateWeek(1)} title="Next week">
            &#8250;
          </button>

          <button
            className={`today-btn ${isCurrentWeek ? "today-btn-active" : ""}`}
            onClick={goToToday}
            disabled={isCurrentWeek}
          >
            Today
          </button>
        </div>

        {/* ── Schedule Table ── */}
        {loading ? (
          <p className="loading">Loading...</p>
        ) : employeeSchedules.length === 0 ? (
          <p className="work-sched-empty">No shifts assigned for this week.</p>
        ) : (
          <table className="work-sched-table">
            <thead>
              <tr>
                <th>Employee</th>
                {weekDays.map((d) => (
                  <th key={d.isoDate} className={d.isoDate === todayIso ? "today-col" : ""}>
                    <span className="day-name">{d.label}</span>
                    <span className="day-date">{d.dateStr}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employeeSchedules.map((emp) => (
                <tr key={emp.name}>
                  <td className="emp-name-cell">{emp.name}</td>
                  {weekDays.map((d) => {
                    const shifts = emp.days[d.isoDate] || [];
                    return (
                      <td
                        key={d.isoDate}
                        className={`ws-cell ${shifts.length ? "ws-assigned" : ""} ${d.isoDate === todayIso ? "today-col" : ""}`}
                      >
                        {shifts.length > 0 ? (
                          shifts.map((s, i) => (
                            <span className="ws-shift-badge" key={i}>
                              {SHIFT_TIMES[s] || s}
                            </span>
                          ))
                        ) : (
                          <span className="ws-empty">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WorkSchedule;

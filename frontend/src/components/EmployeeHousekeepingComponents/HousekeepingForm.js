import React, { useEffect, useState } from "react";
import { FaBroom, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import {
  createHousekeepingLog,
  updateHousekeepingLog,
} from "../../services/api";
import { useNotification } from "../NotificationProvider";
import {
  cardStyle,
  cardTitleStyle,
  inputStyle,
  labelStyle,
  submitBtnStyle,
} from "./eh-styles";

const today = () => new Date().toISOString().slice(0, 10);

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "The housekeeping log could not be saved. Please try again."
  );
}

export default function HousekeepingForm({
  rooms,
  employees,
  log,
  onLogAdded,
  onCancel,
}) {
  const notify = useNotification();
  const [roomId, setRoomId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState("Pending");
  const [date, setDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setRoomId(String(log?.room_id ?? rooms[0]?.room_id ?? ""));
    setEmployeeId(String(log?.employee_id ?? employees[0]?.employee_id ?? ""));
    setStatus(log?.status || "Pending");
    setDate(log?.date ? String(log.date).slice(0, 10) : today());
    setError("");
  }, [log, rooms, employees]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!roomId || !employeeId) {
      setError("Select a room and an assigned housekeeper.");
      return;
    }

    setSaving(true);
    setError("");
    const formData = {
      room_id: Number(roomId),
      employee_id: Number(employeeId),
      status,
      date,
    };
    const saveRequest = log
      ? updateHousekeepingLog(log.housekeeping_log_id, formData)
      : createHousekeepingLog(formData);

    saveRequest
      .then(() => {
        notify(
          log
            ? "Housekeeping log updated successfully."
            : "Housekeeping log added successfully.",
        );
        if (onLogAdded) onLogAdded();
      })
      .catch((saveError) => {
        console.error("Failed to save housekeeping log:", saveError);
        setError(getErrorMessage(saveError));
        notify(getErrorMessage(saveError), "error");
      })
      .finally(() => setSaving(false));
  };

  const unavailable = rooms.length === 0 || employees.length === 0;

  return (
    <section style={cardStyle}>
      <div style={cardTitleStyle}>
        <FaBroom size={13} color="var(--lanna-terracotta)" />
        {log ? "Edit Housekeeping Log" : "Record Housekeeping Task"}
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <div>
          <label style={labelStyle} htmlFor="housekeeping-room">
            Target Room
          </label>
          <select
            id="housekeeping-room"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            style={inputStyle}
            required
          >
            <option value="" disabled>
              Select a room
            </option>
            {rooms.map((room) => (
              <option key={room.room_id} value={room.room_id}>
                Room {room.room_number} ({room.room_type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle} htmlFor="housekeeping-employee">
            Assigned Housekeeper
          </label>
          <select
            id="housekeeping-employee"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            style={inputStyle}
            required
          >
            <option value="" disabled>
              Select a housekeeper
            </option>
            {employees.map((employee) => (
              <option key={employee.employee_id} value={employee.employee_id}>
                {employee.first_name} {employee.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle} htmlFor="housekeeping-status">
            Status
          </label>
          <select
            id="housekeeping-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={inputStyle}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Inspected">Inspected</option>
          </select>
        </div>

        <div>
          <label style={labelStyle} htmlFor="housekeeping-date">
            Date
          </label>
          <input
            id="housekeeping-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            style={inputStyle}
            required
          />
        </div>

        {unavailable && (
          <p style={{ color: "var(--lanna-text-muted)", fontSize: "11px", margin: 0 }}>
            {rooms.length === 0
              ? "Add a room before recording housekeeping."
              : "Register a housekeeper before assigning a task."}
          </p>
        )}
        {error && (
          <p
            role="alert"
            style={{ color: "#8f3525", fontSize: "11px", margin: 0 }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          style={submitBtnStyle}
          disabled={saving || unavailable}
        >
          {log ? <FaSave size={11} /> : <FaPlus size={10} />}
          {saving
            ? "Saving..."
            : log
              ? "Save Housekeeping Log"
              : "Save Log Entry"}
        </button>
        {log && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            style={{
              ...submitBtnStyle,
              background: "var(--lanna-bg-subtle)",
              color: "var(--lanna-text-main)",
              marginTop: 0,
            }}
          >
            <FaTimes size={11} /> Cancel
          </button>
        )}
      </form>
    </section>
  );
}

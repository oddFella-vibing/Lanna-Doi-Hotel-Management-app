import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { createBooking, getEmployees, getGuests } from "../services/api";
import { useNotification } from "./NotificationProvider";

const inputStyle = {
  width: "100%",
  padding: "9px 10px",
  border: "1px solid var(--lanna-border-dark)",
  borderRadius: "6px",
  background: "white",
  color: "var(--lanna-text-main)",
  fontSize: "13px",
};

const labelStyle = {
  display: "block",
  marginBottom: "5px",
  color: "var(--lanna-text-muted)",
  fontSize: "11px",
  fontWeight: "600",
};

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nightsBetween(checkIn, checkOut) {
  const [startYear, startMonth, startDay] = checkIn.split("-").map(Number);
  const [endYear, endMonth, endDay] = checkOut.split("-").map(Number);
  const start = Date.UTC(startYear, startMonth - 1, startDay);
  const end = Date.UTC(endYear, endMonth - 1, endDay);
  return (end - start) / 86400000;
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Could not create the reservation. Please try again."
  );
}

export default function BookingModal({
  isOpen,
  rooms,
  initialRoom,
  onClose,
  onCreated,
}) {
  const notify = useNotification();
  const [guests, setGuests] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [guestId, setGuestId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [checkIn, setCheckIn] = useState(() => localDateString(new Date()));
  const [checkOut, setCheckOut] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return localDateString(tomorrow);
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const availableRooms = useMemo(
    () => rooms.filter((room) => room.room_status === "Available"),
    [rooms],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    let active = true;
    setLoading(true);
    setError("");
    Promise.all([getGuests(), getEmployees()])
      .then(([guestResponse, employeeResponse]) => {
        if (!active) return;
        const guestRows = guestResponse.data.data ?? guestResponse.data;
        const employeeRows =
          employeeResponse.data.data ?? employeeResponse.data;
        setGuests(Array.isArray(guestRows) ? guestRows : []);
        setReceptionists(
          (Array.isArray(employeeRows) ? employeeRows : []).filter(
            (employee) =>
              (employee.role || employee.title) === "Receptionist",
          ),
        );
      })
      .catch((loadError) => {
        if (!active) return;
        console.error("Failed to load reservation options:", loadError);
        setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, notify]);

  useEffect(() => {
    if (isOpen) {
      setSelectedRoomIds(
        initialRoom ? [String(initialRoom.room_id)] : [],
      );
    }
  }, [initialRoom, isOpen]);

  const estimatedTotal = useMemo(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return 0;
    const nights = nightsBetween(checkIn, checkOut);
    return availableRooms
      .filter((room) => selectedRoomIds.includes(String(room.room_id)))
      .reduce(
        (total, room) =>
          total + Number(room.price_per_night || 0) * nights,
        0,
      );
  }, [availableRooms, checkIn, checkOut, selectedRoomIds]);

  if (!isOpen) return null;

  const toggleRoom = (roomId) => {
    setSelectedRoomIds((current) =>
      current.includes(String(roomId))
        ? current.filter((id) => id !== String(roomId))
        : [...current, String(roomId)],
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!guestId || !employeeId || selectedRoomIds.length === 0) {
      setError("Select a guest, receptionist, and at least one room.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    setSaving(true);
    setError("");
    createBooking({
      guest_id: Number(guestId),
      employee_id: Number(employeeId),
      check_in_date: checkIn,
      check_out_date: checkOut,
      booking_status: "Confirmed",
      room_ids: selectedRoomIds.map(Number),
    })
      .then(async () => {
        await onCreated();
        notify("Reservation created successfully.");
        onClose();
      })
      .catch((createError) => {
        console.error("Failed to create reservation:", createError);
        const message = getErrorMessage(createError);
        setError(message);
        notify(message, "error");
      })
      .finally(() => setSaving(false));
  };

  return (
    <div style={overlayStyle} onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose();
    }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        style={modalStyle}
      >
        <header style={headerStyle}>
          <div>
            <div style={eyebrowStyle}>RESERVATIONS</div>
            <h2 id="booking-modal-title" style={titleStyle}>
              <FaCalendarAlt size={16} /> New Reservation
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close reservation form"
            style={closeButtonStyle}
          >
            <FaTimes />
          </button>
        </header>

        {loading ? (
          <p style={mutedTextStyle}>Loading guests and staff...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={fieldGridStyle}>
              <div>
                <label style={labelStyle} htmlFor="reservation-guest">
                  Guest
                </label>
                <select
                  id="reservation-guest"
                  value={guestId}
                  onChange={(event) => setGuestId(event.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Select a guest</option>
                  {guests.map((guest) => (
                    <option key={guest.guest_id} value={guest.guest_id}>
                      {guest.first_name} {guest.last_name}
                    </option>
                  ))}
                </select>
                {guests.length === 0 && (
                  <div style={helperTextStyle}>
                    No guests yet. <Link to="/guests" onClick={onClose}>Register a guest</Link>
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle} htmlFor="reservation-receptionist">
                  Processed by
                </label>
                <select
                  id="reservation-receptionist"
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Select a receptionist</option>
                  {receptionists.map((employee) => (
                    <option
                      key={employee.employee_id}
                      value={employee.employee_id}
                    >
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </select>
                {receptionists.length === 0 && (
                  <div style={helperTextStyle}>
                    No receptionists yet.{" "}
                    <Link to="/employee-housekeeping" onClick={onClose}>
                      Add hotel staff
                    </Link>
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle} htmlFor="reservation-check-in">
                  Check-in
                </label>
                <input
                  id="reservation-check-in"
                  type="date"
                  min={localDateString(new Date())}
                  value={checkIn}
                  onChange={(event) => setCheckIn(event.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="reservation-check-out">
                  Check-out
                </label>
                <input
                  id="reservation-check-out"
                  type="date"
                  min={checkIn || localDateString(new Date())}
                  value={checkOut}
                  onChange={(event) => setCheckOut(event.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <div style={labelStyle}>Available rooms</div>
              {availableRooms.length > 0 ? (
                <div style={roomChoicesStyle}>
                  {availableRooms.map((room) => {
                    const selected = selectedRoomIds.includes(
                      String(room.room_id),
                    );
                    return (
                      <label
                        key={room.room_id}
                        style={{
                          ...roomChoiceStyle,
                          borderColor: selected
                            ? "var(--lanna-primary)"
                            : "var(--lanna-border)",
                          background: selected ? "#edf5ef" : "white",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleRoom(room.room_id)}
                        />
                        <span>
                          <strong>Room {room.room_number}</strong>
                          <span style={roomTypeStyle}>
                            {room.room_type} · ฿{room.price_per_night}/night
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p style={mutedTextStyle}>There are no available rooms.</p>
              )}
            </div>

            {selectedRoomIds.length > 0 && (
              <div style={estimateStyle}>
                Estimated room total: <strong>฿{estimatedTotal.toFixed(2)}</strong>
                <span style={estimateNoteStyle}>
                  Final total is calculated by the server. Room availability is
                  confirmed when you save.
                </span>
              </div>
            )}

            {error && (
              <p role="alert" style={errorStyle}>
                {error}
              </p>
            )}

            <footer style={footerStyle}>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                style={cancelButtonStyle}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  saving ||
                  availableRooms.length === 0 ||
                  guests.length === 0 ||
                  receptionists.length === 0
                }
                style={submitButtonStyle}
              >
                {saving ? "Saving..." : "Create Reservation"}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 1500,
  background: "rgba(30, 38, 33, 0.48)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
};
const modalStyle = {
  width: "min(100%, 620px)",
  maxHeight: "min(90vh, 760px)",
  overflowY: "auto",
  background: "var(--lanna-bg-surface)",
  border: "1px solid var(--lanna-border)",
  borderRadius: "12px",
  padding: "22px",
  boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
};
const headerStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "16px",
  paddingBottom: "14px",
  marginBottom: "16px",
  borderBottom: "1px solid var(--lanna-border)",
};
const eyebrowStyle = {
  color: "var(--lanna-terracotta)",
  fontSize: "9px",
  letterSpacing: "1.4px",
  fontWeight: "700",
};
const titleStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  margin: "5px 0 0",
  color: "var(--lanna-primary)",
  fontSize: "18px",
};
const closeButtonStyle = {
  border: "none",
  background: "var(--lanna-bg-subtle)",
  color: "var(--lanna-text-muted)",
  borderRadius: "6px",
  padding: "8px",
  cursor: "pointer",
};
const fieldGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "12px",
};
const roomChoicesStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "8px",
  maxHeight: "180px",
  overflowY: "auto",
};
const roomChoiceStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "9px",
  padding: "10px",
  border: "1px solid",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "12px",
};
const roomTypeStyle = {
  display: "block",
  marginTop: "3px",
  color: "var(--lanna-text-muted)",
  fontSize: "10px",
};
const estimateStyle = {
  marginTop: "14px",
  padding: "10px 12px",
  borderRadius: "7px",
  background: "var(--lanna-bg-subtle)",
  color: "var(--lanna-primary)",
  fontSize: "12px",
};
const estimateNoteStyle = {
  display: "block",
  marginTop: "4px",
  color: "var(--lanna-text-muted)",
  fontSize: "10px",
};
const mutedTextStyle = {
  color: "var(--lanna-text-muted)",
  fontSize: "12px",
  textAlign: "center",
  padding: "12px",
};
const helperTextStyle = {
  marginTop: "5px",
  color: "var(--lanna-text-muted)",
  fontSize: "10px",
};
const errorStyle = {
  margin: "12px 0 0",
  color: "#8f3525",
  fontSize: "12px",
};
const footerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
  marginTop: "18px",
  paddingTop: "14px",
  borderTop: "1px solid var(--lanna-border)",
};
const cancelButtonStyle = {
  border: "1px solid var(--lanna-border)",
  background: "white",
  color: "var(--lanna-text-main)",
  borderRadius: "6px",
  padding: "9px 14px",
  fontSize: "12px",
  cursor: "pointer",
};
const submitButtonStyle = {
  border: "none",
  background: "var(--lanna-primary)",
  color: "white",
  borderRadius: "6px",
  padding: "9px 14px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
};

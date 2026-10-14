import { useState, useEffect, useCallback, useMemo } from "react";
import { getBookings, getRooms } from "../services/api";
import { FaCalendarPlus, FaSearch } from "react-icons/fa";
import RoomCard from "./RoomCard";
import BookingModal from "./BookingModal";

function RoomGrid() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [initialRoom, setInitialRoom] = useState(null);
  const [loadError, setLoadError] = useState("");

  const openReservation = (room = null) => {
    setInitialRoom(room);
    setIsBookingOpen(true);
  };

  const refreshRoomsAndBookings = useCallback(() => {
    return Promise.all([getRooms(), getBookings()])
      .then(([roomResponse, bookingResponse]) => {
        const roomRows = roomResponse.data.data ?? roomResponse.data;
        const bookingRows = bookingResponse.data.data ?? bookingResponse.data;
        setRooms(Array.isArray(roomRows) ? roomRows : []);
        setBookings(Array.isArray(bookingRows) ? bookingRows : []);
        setLoadError("");
      })
      .catch((err) => {
        console.error("Failed to load rooms and reservations:", err);
        setLoadError(
          err.response?.data?.message ||
            "Could not refresh the room and reservation board.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refreshRoomsAndBookings();
  }, [refreshRoomsAndBookings]);

  const handleRoomClick = (room) => {
    const reservation = reservationByRoomId.get(String(room.room_id));
    const displayStatus = getDisplayStatus(room, reservation);
    if (displayStatus === "Available" || displayStatus === "Reserved") {
      openReservation(room);
      return;
    }
    if (displayStatus === "Occupied") {
      alert(
        `Guest: ${reservation?.guest_name || room.guest_name || "Unknown"}\nRoom: ${room.room_number}\nStatus: ${displayStatus}`,
      );
    }
  };

  const floors = [
    "All Floors",
    ...new Set(rooms.map((r) => r.floor).filter(Boolean)),
  ];

  const getDisplayStatus = (room, reservation) => {
    if (room.room_status === "Maintenance" || room.room_status === "Cleaning") {
      return room.room_status;
    }
    if (reservation?.isCurrent) {
      return reservation.booking_status === "Checked-In"
        ? "Occupied"
        : "Reserved";
    }
    return room.room_status;
  };

  const reservationByRoomId = useMemo(() => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const reservations = new Map();

    bookings.forEach((booking) => {
      if (
        ["Cancelled", "Checked-Out"].includes(booking.booking_status) ||
        !booking.check_out_date ||
        String(booking.check_out_date).slice(0, 10) < todayString
      ) {
        return;
      }

      const checkIn = String(booking.check_in_date || "").slice(0, 10);
      const checkOut = String(booking.check_out_date).slice(0, 10);
      const isCurrent =
        booking.booking_status === "Checked-In" ||
        (checkIn <= todayString && todayString < checkOut);
      (booking.rooms || []).forEach((room) => {
        const roomId = String(room.room_id);
        const current = reservations.get(roomId);
        const candidate = { ...booking, isCurrent };
        if (
          !current ||
          (isCurrent && !current.isCurrent) ||
          (isCurrent === current.isCurrent &&
            checkIn < String(current.check_in_date || "").slice(0, 10))
        ) {
          reservations.set(roomId, candidate);
        }
      });
    });

    return reservations;
  }, [bookings]);

  const filtered = rooms.filter((r) => {
    
    const reservation = reservationByRoomId.get(String(r.room_id));
    if (
      selectedStatus !== "All Status" &&
      getDisplayStatus(r, reservation) !== selectedStatus
    )
      return false;
    if (search && !r.room_number.toString().includes(search)) return false;
    return true;
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
          <FaSearch
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#999",
            }}
          />
          <input
            placeholder="Search room number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: "34px", width: "100%" }}
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={inputStyle}
        >
          {[
            "All Status",
            "Available",
            "Reserved",
            "Occupied",
            "Cleaning",
            "Maintenance",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => openReservation()}
          style={reservationButtonStyle}
        >
          <FaCalendarPlus size={13} /> New Reservation
        </button>
      </div>

      {loading ? (
        <p>Loading rooms...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "12px",
          }}
        >
          {filtered.map((room) => (
            <RoomCard
              key={room.room_id}
              room={room}
              reservation={reservationByRoomId.get(String(room.room_id))}
              displayStatus={getDisplayStatus(
                room,
                reservationByRoomId.get(String(room.room_id)),
              )}
              onClick={handleRoomClick} // ← Pass the handler
            />
          ))}
        </div>
      )}
      <BookingModal
        isOpen={isBookingOpen}
        rooms={rooms}
        initialRoom={initialRoom}
        onClose={() => setIsBookingOpen(false)}
        onCreated={refreshRoomsAndBookings}
      />
      {loadError && (
        <p role="alert" style={{ color: "#8f3525", fontSize: "12px" }}>
          {loadError}
        </p>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "8px 12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "13px",
  background: "white",
};
const reservationButtonStyle = {
  border: "none",
  borderRadius: "8px",
  padding: "9px 12px",
  background: "#1e3a2f",
  color: "white",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

export default RoomGrid;

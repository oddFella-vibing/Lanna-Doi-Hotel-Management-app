import {
  FaBed,
  FaCheckCircle,
  FaBroom,
  FaTools,
  FaUser,
  FaArrowRight,
  FaCalendarCheck,
} from "react-icons/fa";

function RoomCard({ room, reservation, displayStatus, onClick }) {
  const styles = {
    Available: {
      bg: "#e8f5e9",
      border: "#a5d6a7",
      color: "#1b5e20",
      dot: "#4caf50",
      Icon: FaCheckCircle,
    },
    Reserved: {
      bg: "#fff8e1",
      border: "#ffe082",
      color: "#8d6e00",
      dot: "#ffc107",
      Icon: FaCalendarCheck,
    },
    Occupied: {
      bg: "#1e3a2f",
      border: "#1e3a2f",
      color: "#ffffff",
      dot: "#ffd54f",
      Icon: FaBed,
    },
    Cleaning: {
      bg: "#fff3e0",
      border: "#ffcc80",
      color: "#e65100",
      dot: "#ff9800",
      Icon: FaBroom,
    },
    Maintenance: {
      bg: "#eceff1",
      border: "#b0bec5",
      color: "#455a64",
      dot: "#78909c",
      Icon: FaTools,
    },
  };
  const status = displayStatus || room.room_status;
  const s = styles[status] || styles.Available;
  const StatusIcon = s.Icon;
  const isOccupied = status === "Occupied";
  const isAvailable = status === "Available";
  const isReserved = status === "Reserved";
  const isInteractive = isOccupied || isAvailable || isReserved;

  const handleKeyDown = (event) => {
    if (isInteractive && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick?.(room);
    }
  };

  return (
    <div
      onClick={() => isInteractive && onClick && onClick(room)}
      onKeyDown={handleKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={
        isAvailable || isReserved
          ? `${isReserved ? "Check dates for reserved room" : "Reserve room"} ${room.room_number}`
          : undefined
      }
      style={{
        background: s.bg,
        border: `2px solid ${s.border}`,
        borderRadius: "10px",
        padding: "12px",
        minHeight: "120px",
        cursor: isInteractive ? "pointer" : "default",
        transition: "transform 0.15s",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative", // ← For absolute-positioned arrow
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-3px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {/* Top row: room number + action hint */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: "bold", color: s.color }}>
          {room.room_number}
        </div>
        {isOccupied && (
          <FaArrowRight
            size={12}
            color="#ffd54f"
            style={{ marginTop: "4px" }}
          />
        )}
      </div>

      {/* Status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          color: s.color,
        }}
      >
        <StatusIcon size={12} />
        {status}
      </div>

      {/* Guest info (occupied only) */}
      {isOccupied && room.guest_name && (
        <div
          style={{
            fontSize: "10px",
            opacity: 0.9,
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <FaUser size={9} /> {room.guest_name}
        </div>
      )}
      {reservation && (
        <div
          style={{
            marginTop: "5px",
            paddingTop: "5px",
            borderTop: `1px solid ${s.border}`,
            fontSize: "10px",
            color: s.color,
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontWeight: 700 }}>
            {reservation.isCurrent ? "Current stay" : "Upcoming reservation"}
          </div>
          <div >
            {reservation.guest_name || "Guest reservation"}
          </div>
          <div>
            {String(reservation.check_in_date).slice(0, 10)} –{" "}
            {String(reservation.check_out_date).slice(0, 10)}
          </div>
        </div>
      )}
      {(isAvailable || isReserved) && (
        <div style={{ fontSize: "10px", color: s.color, opacity: 0.8 }}>
          {isReserved ? "Click to check other dates" : "Click to reserve"}
        </div>
      )}
    </div>
  );
}

export default RoomCard;

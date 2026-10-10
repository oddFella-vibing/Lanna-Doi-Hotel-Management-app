import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaUser, FaPhone, FaEnvelope } from "react-icons/fa";

function GuestHistoryReport() {
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchGuests = () => {
    setLoading(true);
    setError(null);
    axios
      .get("http://localhost:4000/api/reports/guest-history", {
        params: { search },
      })
      .then((res) => {
        setGuests(res.data.data ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(fetchGuests, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      <div
        style={{
          position: "relative",
          marginBottom: "20px",
          maxWidth: "400px",
        }}
      >
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
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "13px",
            background: "white",
          }}
        />
      </div>

      {loading && <p style={msgStyle}>Loading...</p>}
      {error && <p style={{ ...msgStyle, color: "#c0392b" }}>Error: {error}</p>}
      {!loading && guests.length === 0 && (
        <p style={msgStyle}>No guests found.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {guests.map((guest) => {
          const isExpanded = expandedId === guest.guest_id;
          const totalSpent = guest.bookings.reduce(
            (sum, b) => sum + Number(b.total_paid || 0),
            0,
          );

          return (
            <div
              key={guest.guest_id}
              style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                onClick={() =>
                  setExpandedId(isExpanded ? null : guest.guest_id)
                }
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  background: isExpanded ? "#f8f4ea" : "white",
                  transition: "background 0.15s",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#1e3a2f",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {guest.guest_name?.charAt(0) || <FaUser />}
                  </div>
                  <div>
                    <div style={{ fontWeight: "bold", color: "#1e3a2f" }}>
                      {guest.guest_name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        display: "flex",
                        gap: "12px",
                      }}
                    >
                      {guest.phone_number && (
                        <span>
                          <FaPhone size={9} /> {guest.phone_number}
                        </span>
                      )}
                      {guest.email && (
                        <span>
                          <FaEnvelope size={9} /> {guest.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", color: "#8b5a3c" }}>
                    {guest.bookings.length} booking
                    {guest.bookings.length !== 1 ? "s" : ""}
                  </div>
                  <div style={{ fontWeight: "bold", color: "#b85c38" }}>
                    ฿{totalSpent.toLocaleString()}
                  </div>
                </div>
              </div>

              {isExpanded && guest.bookings.length > 0 && (
                <div
                  style={{
                    padding: "0 20px 20px 20px",
                    background: "#f8f4ea",
                    borderTop: "1px solid #e5d9c0",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "12px",
                    }}
                  >
                    <thead>
                      <tr style={{ color: "#8b5a3c" }}>
                        <th style={thStyle}>Room</th>
                        <th style={thStyle}>Check-In</th>
                        <th style={thStyle}>Check-Out</th>
                        <th style={thStyle}>Total</th>
                        <th style={thStyle}>Paid</th>
                        <th style={thStyle}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guest.bookings.map((b) => (
                        <tr
                          key={b.booking_id}
                          style={{ borderTop: "1px solid #e5d9c0" }}
                        >
                          <td style={tdStyle}>{b.room_number || "—"}</td>
                          <td style={tdStyle}>{b.check_in_date}</td>
                          <td style={tdStyle}>{b.check_out_date}</td>
                          <td style={tdStyle}>
                            ฿{Number(b.total_amount || 0).toLocaleString()}
                          </td>
                          <td style={tdStyle}>
                            ฿{Number(b.total_paid || 0).toLocaleString()}
                          </td>
                          <td style={tdStyle}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "10px",
                                background:
                                  b.booking_status === "Checked-In"
                                    ? "#1e3a2f"
                                    : b.booking_status === "Checked-Out"
                                      ? "#2d5a47"
                                      : b.booking_status === "Cancelled"
                                        ? "#c0392b"
                                        : "#f59e0b",
                                color: "white",
                                fontSize: "10px",
                              }}
                            >
                              {b.booking_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const msgStyle = {
  textAlign: "center",
  padding: "40px",
  color: "#666",
};

const thStyle = {
  textAlign: "left",
  padding: "8px 6px",
  fontWeight: 600,
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle = {
  padding: "8px 6px",
  color: "#2c2c2c",
};

export default GuestHistoryReport;

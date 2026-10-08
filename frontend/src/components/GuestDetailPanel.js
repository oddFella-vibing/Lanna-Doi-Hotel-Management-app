import React, { useState, useEffect } from "react";
import { getBookings, updateBooking, updateGuest } from "../services/api";
import GuestServices from "./GuestServices";

import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaHistory,
  FaReceipt,
  FaConciergeBell,
} from "react-icons/fa";

export default function GuestDetailPanel({ selectedGuest, onUpdateGuest }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [guestHistory, setGuestHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("info"); // 'info', 'bookings', 'billing'
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Sync form data and fetch related booking/billing history when guest changes
  useEffect(() => {
    if (selectedGuest) {
      setFormData({
        first_name: selectedGuest.first_name || "",
        last_name: selectedGuest.last_name || "",
        email: selectedGuest.email || "",
        phone_number: selectedGuest.phone_number || "",
        preferred_room_type: selectedGuest.preferred_room_type || "",
        house_number: selectedGuest.house_number || "",
        street: selectedGuest.street || "",
        district: selectedGuest.district || "",
        province: selectedGuest.province || "",
      });
      setIsEditing(false);

      // Fetch bookings associated with this guest to power the history & billing tabs
      setLoadingHistory(true);
      getBookings()
        .then((res) => {
          const bookings = res.data.data ?? res.data;
          // Filter specifically for this guest if backend returns all bookings
          const guestBookings = Array.isArray(bookings)
            ? bookings.filter(
                (b) =>
                  b.guest_id === (selectedGuest.guest_id || selectedGuest.id),
              )
            : [];
          setGuestHistory(guestBookings);
          setLoadingHistory(false);
        })
        .catch(() => {
          setGuestHistory([]);
          setLoadingHistory(false);
        });
    }
  }, [selectedGuest]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const guestId = selectedGuest.guest_id || selectedGuest.id;
    updateGuest(guestId, formData)
      .then(() => {
        onUpdateGuest({ ...selectedGuest, ...formData });
        setIsEditing(false);
      })
      .catch((err) => console.error("Failed to update guest:", err));
  };
  // Add status updater handler inside GuestDetailPanel
  const handleUpdateBookingStatus = (
    bookingId,
    newBookingStatus,
    newPaymentStatus,
  ) => {
    updateBooking(bookingId, {
        booking_status: newBookingStatus,
        payment_status: newPaymentStatus,
      })
      .then(() => {
        // Refresh local bookings list
        setGuestHistory((prev) =>
          prev.map((b) =>
            b.booking_id === bookingId
              ? {
                  ...b,
                  booking_status: newBookingStatus,
                  payment_status: newPaymentStatus,
                }
              : b,
          ),
        );
      })
      .catch((err) => console.error("Failed to update booking status:", err));
  };
  if (!selectedGuest) {
    return (
      <div style={panelContainerStyle}>
        <p style={{ color: "#888", textAlign: "center", margin: "auto" }}>
          Select a guest from the list to view their dossier.
        </p>
      </div>
    );
  }

  return (
    <div style={panelContainerStyle}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid #eae5d9",
          paddingBottom: "12px",
          marginBottom: "14px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#b85c38",
              fontWeight: "bold",
            }}
          >
            Guest Dossier
          </span>
          <h4
            style={{ margin: "2px 0 0 0", fontSize: "17px", color: "#1e3a2f" }}
          >
            {selectedGuest.first_name} {selectedGuest.last_name}
          </h4>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={iconBtnStyle}
            title="Edit Profile"
          >
            <FaEdit size={13} />
          </button>
        )}
      </div>

      {/* Sub-Navigation Tabs within Detail Panel */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          gap: "4px",
          marginBottom: "14px",
          borderBottom: "1px solid var(--lanna-border)",
          paddingBottom: "8px",
          overflowX: "auto",
        }}
      >
        <button
          onClick={() => setActiveTab("info")}
          style={activeTab === "info" ? activeTabStyle : tabStyle}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          style={activeTab === "bookings" ? activeTabStyle : tabStyle}
        >
          History ({guestHistory.length})
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          style={activeTab === "billing" ? activeTabStyle : tabStyle}
        >
          Billing
        </button>
        <button
          onClick={() => setActiveTab("services")}
          style={activeTab === "services" ? activeTabStyle : tabStyle}
        >
          <FaConciergeBell size={9} /> Services
        </button>
      </div>

      {/* Tab Content 1: Profile Info / Edit Form */}
      {activeTab === "info" &&
        (!isEditing ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              overflowY: "auto",
              maxHeight: "380px",
            }}
          >
            <div style={detailItemStyle}>
              <FaEnvelope size={13} color="#b85c38" />
              <div>
                <div style={labelMiniStyle}>Email Address</div>
                <div style={valueStyle}>{selectedGuest.email || "N/A"}</div>
              </div>
            </div>

            <div style={detailItemStyle}>
              <FaPhone size={13} color="#b85c38" />
              <div>
                <div style={labelMiniStyle}>Phone Number</div>
                <div style={valueStyle}>
                  {selectedGuest.phone_number || selectedGuest.phone || "N/A"}
                </div>
              </div>
            </div>

            <div style={detailItemStyle}>
              <FaMapMarkerAlt size={13} color="#b85c38" />
              <div>
                <div style={labelMiniStyle}>Address (Thailand Location)</div>
                <div style={valueStyle}>
                  {[
                    selectedGuest.house_number,
                    selectedGuest.street,
                    selectedGuest.district,
                    selectedGuest.province,
                  ]
                    .filter(Boolean)
                    .join(", ") || "No address logged"}
                </div>
              </div>
            </div>

            <div
              style={{
                ...detailItemStyle,
                background: "#398c6b",
                padding: "8px 10px",
                borderRadius: "6px",
                marginTop: "6px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#fafafa",
                    textTransform: "uppercase",
                  }}
                >
                  Preferred Room Style
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#fafafa",
                    fontWeight: "600",
                  }}
                >
                  {selectedGuest.preferred_room_type || "Standard Deluxe"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              overflowY: "auto",
              maxHeight: "380px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Preferred Room Type</label>
              <input
                type="text"
                name="preferred_room_type"
                value={formData.preferred_room_type}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Street & District</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Street / Sub-district"
              />
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button type="submit" style={saveBtnStyle}>
                <FaSave size={11} /> Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={cancelBtnStyle}
              >
                <FaTimes size={11} />
              </button>
            </div>
          </form>
        ))}

      {/* Tab Content 2: Booking History */}
      {activeTab === "bookings" && (
        <div
          style={{
            overflowY: "auto",
            maxHeight: "380px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {loadingHistory ? (
            <p style={{ fontSize: "12px", color: "#888", textAlign: "center" }}>
              Loading stay history...
            </p>
          ) : guestHistory.length > 0 ? (
            guestHistory.map((b) => (
              <div
                key={b.booking_id}
                style={{
                  background: "white",
                  border: "1px solid var(--lanna-border)",
                  borderRadius: "6px",
                  padding: "10px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "600",
                      fontSize: "12px",
                      color: "var(--lanna-primary)",
                    }}
                  >
                    Booking #{b.booking_id}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: "var(--lanna-terracotta)",
                    }}
                  >
                    ฿{b.total_amount}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--lanna-text-muted)",
                    marginBottom: "8px",
                  }}
                >
                  📅 {b.check_in_date?.substring(0, 10)} →{" "}
                  {b.check_out_date?.substring(0, 10)}
                </div>

                {/* Interactive Status Selectors */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px",
                    background: "var(--lanna-bg-subtle)",
                    padding: "6px",
                    borderRadius: "4px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "9px",
                        color: "var(--lanna-text-muted)",
                        display: "block",
                      }}
                    >
                      Booking Status
                    </label>
                    <select
                      value={b.booking_status}
                      onChange={(e) =>
                        handleUpdateBookingStatus(
                          b.booking_id,
                          e.target.value,
                          b.payment_status,
                        )
                      }
                      style={{
                        width: "100%",
                        fontSize: "11px",
                        padding: "3px",
                        borderRadius: "4px",
                        border: "1px solid var(--lanna-border-dark)",
                      }}
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked-In">Checked-In</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: "9px",
                        color: "var(--lanna-text-muted)",
                        display: "block",
                      }}
                    >
                      Payment Status
                    </label>
                    <select
                      value={b.payment_status}
                      onChange={(e) =>
                        handleUpdateBookingStatus(
                          b.booking_id,
                          b.booking_status,
                          e.target.value,
                        )
                      }
                      style={{
                        width: "100%",
                        fontSize: "11px",
                        padding: "3px",
                        borderRadius: "4px",
                        border: "1px solid var(--lanna-border-dark)",
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                fontSize: "12px",
                color: "#888",
                textAlign: "center",
                margin: "20px 0",
              }}
            >
              No past booking records found for this guest.
            </p>
          )}
        </div>
      )}

      {/* Tab Content 3: Billing & Payments */}
      {activeTab === "billing" && (
        <div
          style={{
            overflowY: "auto",
            maxHeight: "380px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {guestHistory.length > 0 ? (
            guestHistory.map((b) => (
              <div key={b.booking_id} style={historyCardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  <span>Invoice for Booking #{b.booking_id}</span>
                  <span
                    style={{
                      background:
                        b.payment_status === "Paid" ? "#e6f4ea" : "#fce8e6",
                      color:
                        b.payment_status === "Paid" ? "#137333" : "#c5221f",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      fontSize: "10px",
                    }}
                  >
                    {b.payment_status || "Pending"}
                  </span>
                </div>
                <div
                  style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
                >
                  Amount Due: ฿{b.total_amount}
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                fontSize: "12px",
                color: "#888",
                textAlign: "center",
                margin: "20px 0",
              }}
            >
              No active billing or invoices found.
            </p>
          )}
        </div>
      )}
      {activeTab === "services" && (
        <GuestServices guestBookings={guestHistory} />
      )}
      {/* Footer stamp */}
      <div
        style={{
          fontSize: "10px",
          color: "#aaa",
          textAlign: "center",
          borderTop: "1px solid #eae5d9",
          paddingTop: "8px",
          marginTop: "14px",
        }}
      >
        Lanna Doi Database Dossier
      </div>
    </div>
  );
}

// Styling Constants
const panelContainerStyle = {
  background: "#fcfbfa",
  border: "1px solid #eae5d9",
  borderRadius: "10px",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  boxSizing: "border-box",
};

const detailItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  padding: "6px 0",
};

const labelMiniStyle = {
  fontSize: "10px",
  color: "#888",
  textTransform: "uppercase",
};
const valueStyle = { fontSize: "12px", color: "#2d3748", fontWeight: "500" };

const iconBtnStyle = {
  background: "#f5efe6",
  border: "none",
  borderRadius: "6px",
  width: "28px",
  height: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#1e3a2f",
};

const tabStyle = {
  background: "none",
  border: "none",
  fontSize: "11px",
  fontWeight: "600",
  color: "#666",
  cursor: "pointer",
  padding: "4px 6px",
};
const activeTabStyle = {
  background: "#398c6b",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontSize: "11px",
  fontWeight: "600",
  cursor: "pointer",
  padding: "4px 8px",
};

const historyCardStyle = {
  background: "white",
  border: "1px solid #eae5d9",
  borderRadius: "6px",
  padding: "10px",
};

const labelStyle = {
  fontSize: "10px",
  color: "#666",
  display: "block",
  marginBottom: "2px",
  fontWeight: "600",
};
const inputStyle = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: "6px",
  border: "1px solid #dcd6c8",
  fontSize: "12px",
  outline: "none",
  background: "white",
  boxSizing: "border-box",
};
const saveBtnStyle = {
  flex: 1,
  background: "#1e3a2f",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "7px",
  fontSize: "11px",
  fontWeight: "600",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
};
const cancelBtnStyle = {
  background: "#e6dfd1",
  color: "#333",
  border: "none",
  borderRadius: "6px",
  padding: "7px 10px",
  cursor: "pointer",
};

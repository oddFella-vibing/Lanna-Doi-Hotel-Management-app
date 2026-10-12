import React, { useState, useEffect } from "react";
import { getGuests } from "../../services/api";
import GuestList from "./GuestList";
import GuestDetailPanel from "./GuestDetailPanel";
import AddGuestModal from "./AddGuestModal";
import { FaPlus } from "react-icons/fa";

export default function GuestManagement() {
  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGuests = () => {
    getGuests()
      .then((res) => {
        const guestList = res.data.data ?? res.data;
        setGuests(guestList);
        if (guestList.length > 0 && !selectedGuest) {
          setSelectedGuest(guestList[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching guests:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleGuestAdded = (newGuest) => {
    fetchGuests();
    setSelectedGuest(newGuest);
  };

  if (loading)
    return (
      <div style={{ padding: "20px", color: "var(--lanna-text-muted)" }}>
        Loading guest directory... 🌿
      </div>
    );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: "20px",
        height: "100%",
        position: "relative",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "14px",
              letterSpacing: "1px",
              color: "var(--lanna-primary)",
            }}
          >
            REGISTERED GUESTS ({guests.length})
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: "var(--lanna-primary)",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FaPlus size={10} /> Register Guest
          </button>
        </div>

        <GuestList
          guests={guests}
          selectedGuest={selectedGuest}
          onSelectGuest={setSelectedGuest}
        />
      </div>

      <GuestDetailPanel
        selectedGuest={selectedGuest}
        onUpdateGuest={fetchGuests}
      />

      <AddGuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGuestAdded={handleGuestAdded}
      />
    </div>
  );
}

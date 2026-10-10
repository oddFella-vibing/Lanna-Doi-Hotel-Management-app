import React from "react";
import GuestAvatar from "./GuestAvatar";

export default function GuestList({ guests, selectedGuest, onSelectGuest }) {
  return (
    <div>
     

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "80vh",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {guests.map((guest) => {
          const guestId = guest.guest_id ?? guest.id;
          const selectedId = selectedGuest
            ? (selectedGuest.guest_id ?? selectedGuest.id)
            : null;
          const isSelected =
            selectedId !== null && String(guestId) === String(selectedId);
          const fullName = `${guest.first_name || ""} ${guest.last_name || ""}`;

          return (
            <div
              key={guestId}
              onClick={() => onSelectGuest(guest)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid",
                cursor: "pointer",
                transition: "all 0s ease",
                background: isSelected ? "#398c6b" : "#fcfbfa",
                color: isSelected ? "#ffffff" : "#2d3748",
                borderColor: isSelected ? "#5cddaa" : "#eae5d9",
              }}
              // Add 'selected' class dynamically here so CSS knows to lock the style
              className={`guest-row ${isSelected ? "selected" : ""}`}
            >
              <GuestAvatar guest={guest} isSelected={isSelected} />

              <div style={{ flex: 1, minWidth: "0" }}>
                <div
                  className="guest-name"
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: isSelected ? "#fff" : "#2d3748",
                  }}
                >
                  {fullName}
                </div>
                <div
                  className="guest-email"
                  style={{
                    fontSize: "12px",
                    opacity: isSelected ? 1 : 0.75,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: isSelected ? "#fff" : "#666",
                  }}
                >
                  {guest.email || "No email provided"}
                </div>
              </div>

              <div
                className="guest-id"
                style={{
                  fontSize: "11px",
                  opacity: isSelected ? 1 : 0.6,
                  alignSelf: "center",
                  color: isSelected ? "#fff" : "#888",
                }}
              >
                ID: #{guestId}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

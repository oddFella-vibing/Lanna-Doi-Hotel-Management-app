import React, { useCallback, useEffect, useState } from "react";
import {
  FaBroom,
  FaEdit,
  FaTrash,
  FaUserShield,
} from "react-icons/fa";
import TopBar from "../components/TopBar";
import EmployeeForm from "../components/EmployeeHousekeepingComponents/EmployeeForm";
import HousekeepingForm from "../components/EmployeeHousekeepingComponents/HousekeepingForm";
import {
  cardStyle,
  cardTitleStyle,
  itemStyle,
} from "../components/EmployeeHousekeepingComponents/eh-styles";
import {
  deleteEmployee,
  deleteHousekeepingLog,
  getEmployees,
  getHousekeepingLogs,
  getRooms,
} from "../services/api";
import { useNotification } from "../components/NotificationProvider";

const primaryButtonStyle = {
  background: "var(--lanna-primary)",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const iconButtonStyle = {
  background: "white",
  border: "1px solid var(--lanna-border)",
  borderRadius: "5px",
  color: "var(--lanna-primary)",
  padding: "6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "The operation could not be completed. Please try again."
  );
}

export default function EmployeeHousekeeping() {
  const notify = useNotification();
  const [activeTab, setActiveTab] = useState("housekeeping");
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([getEmployees(), getHousekeepingLogs(), getRooms()])
      .then(([employeeResponse, logResponse, roomResponse]) => {
        setEmployees(employeeResponse.data.data ?? employeeResponse.data ?? []);
        setLogs(logResponse.data.data ?? logResponse.data ?? []);
        setRooms(roomResponse.data.data ?? roomResponse.data ?? []);
        setError("");
        console.log(logs)
      })
      .catch((fetchError) => {
        console.error("Failed to load employee and housekeeping data:", fetchError);
        setError(getErrorMessage(fetchError));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    
    fetchData();
  }, [fetchData]);

  const handleDeleteEmployee = (employee) => {
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    if (
      !window.confirm(
        `Are you sure you want to delete ${employeeName}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    deleteEmployee(employee.employee_id)
      .then(() => {
        setEditingEmployee(null);
        notify("Employee deleted successfully.");
        fetchData();
      })
      .catch((deleteError) => {
        console.error("Failed to delete employee:", deleteError);
        const message = getErrorMessage(deleteError);
        setError(message);
        notify(message, "error");
      });
  };

  const handleDeleteLog = (log) => {
    if (
      !window.confirm(
        `Delete the housekeeping log for Room ${log.room_number || log.room_id}?`,
      )
    ) {
      return;
    }

    deleteHousekeepingLog(log.housekeeping_log_id)
      .then(() => {
        setEditingLog(null);
        notify("Housekeeping log deleted successfully.");
        fetchData();
      })
      .catch((deleteError) => {
        console.error("Failed to delete housekeeping log:", deleteError);
        const message = getErrorMessage(deleteError);
        setError(message);
        notify(message, "error");
      });
  };

  const handleSaved = () => {
    setEditingEmployee(null);
    setEditingLog(null);
    fetchData();
  };

  const housekeepingEmployees = employees.filter(
    (employee) => (employee.role || employee.title) === "Housekeeper",
  );

  return (
    <>
      <TopBar />
      <main
        style={{
          padding: "20px",
          background: "#faf7f0",
          minHeight: "calc(100vh - 70px)",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                color: "var(--lanna-primary)",
                margin: "0 0 4px",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Staff & Housekeeping
            </h2>
            <p
              style={{
                color: "var(--lanna-text-muted)",
                fontSize: "12px",
                margin: 0,
              }}
            >
              Manage the hotel team and room housekeeping records.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab("housekeeping");
                setEditingLog(null);
              }}
              style={{
                ...primaryButtonStyle,
                opacity: activeTab === "housekeeping" ? 1 : 0.75,
              }}
            >
              <FaBroom size={12} /> Housekeeping ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("staff");
                setEditingEmployee(null);
              }}
              style={{
                ...primaryButtonStyle,
                opacity: activeTab === "staff" ? 1 : 0.75,
              }}
            >
              <FaUserShield size={12} /> Employees ({employees.length})
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: "16px",
              padding: "10px 12px",
              border: "1px solid #e7b8ad",
              borderRadius: "6px",
              background: "#fff4f1",
              color: "#8f3525",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: "20px", color: "var(--lanna-text-muted)" }}>
            Loading staff and housekeeping records...
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 380px",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <section style={cardStyle}>
              <div style={cardTitleStyle}>
                {activeTab === "staff" ? (
                  <FaUserShield size={13} color="var(--lanna-terracotta)" />
                ) : (
                  <FaBroom size={13} color="var(--lanna-terracotta)" />
                )}
                {activeTab === "staff"
                  ? `Employee Directory (${employees.length})`
                  : `Housekeeping History (${logs.length})`}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  maxHeight: "70vh",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                {activeTab === "staff" ? (
                  employees.length > 0 ? (
                    employees.map((employee) => (
                      <div
                        key={employee.employee_id}
                        style={{
                          ...itemStyle,
                          background:
                            editingEmployee?.employee_id === employee.employee_id
                              ? "#e8f1ec"
                              : "#fcfbfa",
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{flex:1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: "600",
                              fontSize: "14px",
                              color: "var(--lanna-text-main)",
                            }}
                          >
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--lanna-text-muted)",
                              marginTop: "3px",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {employee.email} · {employee.phone_number}
                          </div>
                         
                        </div>
                        <div style={{ flex:1,width: "90px", textAlign: "center" }}>
                         <span
                            style={{
                              display: "inline-block",
                              marginTop: "7px",
                              background: "var(--lanna-bg-subtle)",
                              color: "var(--lanna-primary)",
                              borderRadius: "12px",
                              padding: "3px 8px",
                              fontSize: "10px",
                              fontWeight: "600",
                            }}
                          >
                            {employee.role || employee.title || "Staff"}
                          </span>
                          </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => setEditingEmployee(employee)}
                            style={iconButtonStyle}
                            title={`Edit ${employee.first_name} ${employee.last_name}`}
                            aria-label={`Edit ${employee.first_name} ${employee.last_name}`}
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEmployee(employee)}
                            className="lanna-delete-btn"
                            title={`Delete ${employee.first_name} ${employee.last_name}`}
                            aria-label={`Delete ${employee.first_name} ${employee.last_name}`}
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyMessage>No employees registered yet.</EmptyMessage>
                  )
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <div
                      key={log.housekeeping_log_id}
                      style={{
                        ...itemStyle,
                        background:
                          editingLog?.housekeeping_log_id ===
                          log.housekeeping_log_id
                            ? "#e8f1ec"
                            : "#fcfbfa",
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{flex:1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "14px",
                            color: "var(--lanna-text-main)",
                          }}
                        >
                          Room {log.room_number || `#${log.room_id}`}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--lanna-text-muted)",
                            marginTop: "3px",
                          }}
                        >
                          {log.housekeeper_name || `Employee #${log.employee_id}`}
                          {" · "}
                          {log.date?.substring(0, 10) || "No date"}
                        </div>
                       
                      </div> <div style={{ flex:1,width: "90px", textAlign: "center" }}>
    <span style={{
      display: "inline-block",
      background: "var(--lanna-bg-surface)",
      color: "var(--lanna-terracotta)",
      border: "1px solid var(--lanna-border)",
      borderRadius: "12px",
      padding: "3px 8px",
      fontSize: "10px",
      fontWeight: "600",
    }}>
      {log.status}
    </span>
  </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => setEditingLog(log)}
                          style={iconButtonStyle}
                          title={`Edit housekeeping log for Room ${log.room_number || log.room_id}`}
                          aria-label={`Edit housekeeping log for Room ${log.room_number || log.room_id}`}
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log)}
                          className="lanna-delete-btn"
                          title="Delete housekeeping log"
                          aria-label="Delete housekeeping log"
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyMessage>No housekeeping logs recorded yet.</EmptyMessage>
                )}
              </div>
            </section>

            {activeTab === "staff" ? (
              <EmployeeForm
                employee={editingEmployee}
                onEmployeeAdded={handleSaved}
                onCancel={() => setEditingEmployee(null)}
              />
            ) : (
              <HousekeepingForm
                rooms={rooms}
                employees={housekeepingEmployees}
                log={editingLog}
                onLogAdded={handleSaved}
                onCancel={() => setEditingLog(null)}
              />
            )}
          </div>
        )}
      </main>
    </>
  );
}

function EmptyMessage({ children }) {
  return (
    <p
      style={{
        fontSize: "12px",
        color: "var(--lanna-text-muted)",
        textAlign: "center",
        padding: "24px 16px",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

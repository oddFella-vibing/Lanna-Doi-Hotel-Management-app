import React, { useEffect, useState } from "react";
import { FaPlus, FaSave, FaTimes, FaUserShield } from "react-icons/fa";
import { createEmployee, updateEmployee } from "../../services/api";
import { useNotification } from "../NotificationProvider";
import {
  cardStyle,
  cardTitleStyle,
  inputStyle,
  labelStyle,
  submitBtnStyle,
} from "./eh-styles";

const emptyForm = {
  first_name: "",
  last_name: "",
  phone_number: "",
  email: "",
  role: "Housekeeper",
  house_number: "",
  street: "",
  district: "",
  sub_district: "",
  province: "",
};

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "The employee could not be saved. Please try again."
  );
}

export default function EmployeeForm({
  employee,
  onEmployeeAdded,
  onCancel,
}) {
  const notify = useNotification();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(
      employee
        ? {
            first_name: employee.first_name || "",
            last_name: employee.last_name || "",
            phone_number: employee.phone_number || "",
            email: employee.email || "",
            role: employee.role || employee.title || "Housekeeper",
            house_number: employee.house_number || "",
            street: employee.street || "",
            district: employee.district || "",
            sub_district: employee.sub_district || "",
            province: employee.province || "",
          }
        : emptyForm,
    );
    setError("");
  }, [employee]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const saveRequest = employee
      ? updateEmployee(employee.employee_id, form)
      : createEmployee(form);

    saveRequest
      .then(() => {
        setForm(emptyForm);
        notify(
          employee
            ? "Employee updated successfully."
            : "Employee added successfully.",
        );
        if (onEmployeeAdded) onEmployeeAdded();
      })
      .catch((saveError) => {
        console.error("Failed to save employee:", saveError);
        setError(getErrorMessage(saveError));
        notify(getErrorMessage(saveError), "error");
      })
      .finally(() => setSaving(false));
  };

  return (
    <section style={cardStyle}>
      <div style={cardTitleStyle}>
        <FaUserShield size={13} color="var(--lanna-terracotta)" />
        {employee ? "Edit Employee" : "Register New Employee"}
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div>
            <label style={labelStyle} htmlFor="employee-first-name">
              First Name
            </label>
            <input
              id="employee-first-name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="employee-last-name">
              Last Name
            </label>
            <input
              id="employee-last-name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
        </div>

        <div>
          <label style={labelStyle} htmlFor="employee-email">
            Email
          </label>
          <input
            id="employee-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div>
            <label style={labelStyle} htmlFor="employee-phone">
              Phone
            </label>
            <input
              id="employee-phone"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="employee-role">
              Role
            </label>
            <select
              id="employee-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Housekeeper">Housekeeper</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            style={{ color: "#8f3525", fontSize: "11px", margin: 0 }}
          >
            {error}
          </p>
        )}

        <button type="submit" style={submitBtnStyle} disabled={saving}>
          {employee ? <FaSave size={11} /> : <FaPlus size={10} />}
          {saving
            ? "Saving..."
            : employee
              ? "Save Employee"
              : "Register Employee"}
        </button>
        {employee && (
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

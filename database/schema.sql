-- Disable foreign key checks temporarily to allow clean drops
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS billing;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS housekeeping_log;
DROP TABLE IF EXISTS service;
DROP TABLE IF EXISTS booking_room;
DROP TABLE IF EXISTS booking;
DROP TABLE IF EXISTS room;
DROP TABLE IF EXISTS guest;
DROP TABLE IF EXISTS receptionist;
DROP TABLE IF EXISTS housekeeper;
DROP TABLE IF EXISTS manager;
DROP TABLE IF EXISTS employee;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Base Tables
CREATE TABLE guest (
    guest_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    preferred_room_type VARCHAR(50),
    house_number VARCHAR(20),
    street VARCHAR(100),
    district VARCHAR(50),
    sub_district VARCHAR(50),
    province VARCHAR(50)
);

CREATE TABLE room (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    room_status VARCHAR(20) NOT NULL DEFAULT 'Available'
);

-- 2. Employee Supertype & Subtypes (EER Specialization)
CREATE TABLE employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    house_number VARCHAR(20),
    street VARCHAR(100),
    district VARCHAR(50),
    sub_district VARCHAR(50),
    province VARCHAR(50),
    title VARCHAR(50) NOT NULL
);

CREATE TABLE manager (
    employee_id INT PRIMARY KEY,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

CREATE TABLE receptionist (
    employee_id INT PRIMARY KEY,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

CREATE TABLE housekeeper (
    employee_id INT PRIMARY KEY,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

-- 3. Core Operational Tables
CREATE TABLE booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status VARCHAR(30) NOT NULL DEFAULT 'Confirmed',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    guest_id INT NOT NULL,
    employee_id INT NULL, -- Receptionist who processed the booking (Optional 0..1)
    FOREIGN KEY (guest_id) REFERENCES guest(guest_id),
    FOREIGN KEY (employee_id) REFERENCES receptionist(employee_id)
);

CREATE TABLE booking_room (
    booking_room_id INT AUTO_INCREMENT PRIMARY KEY,
    rate_charged DECIMAL(10, 2) NOT NULL,
    booking_id INT NOT NULL,
    room_id INT NOT NULL,
    UNIQUE KEY uq_booking_room (booking_id, room_id),
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES room(room_id)
);

CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    payment_date DATETIME NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    booking_id INT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id)
);

CREATE TABLE billing (
    billing_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_date DATETIME NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_id INT UNIQUE NOT NULL, -- Optional 1-to-1 relationship enforcement
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE
);

CREATE TABLE housekeeping_log (
    housekeeping_log_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    room_id INT NOT NULL,
    employee_id INT NOT NULL,
    FOREIGN KEY (room_id) REFERENCES room(room_id),
    FOREIGN KEY (employee_id) REFERENCES housekeeper(employee_id)
);
CREATE TABLE service (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    charged_amount DECIMAL(10, 2) NOT NULL,
    booking_id INT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE
);
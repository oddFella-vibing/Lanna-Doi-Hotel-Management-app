-- Seed data to be replaced by AIW
INSERT INTO room (room_number, price_per_night, room_type, room_status) VALUES 
('101', 1200.00, 'Single', 'Available'),
('102', 1200.00, 'Single', 'Occupied'),
('201', 2500.00, 'Double', 'Available'),
('301', 5000.00, 'VIP Suite', 'Available');

-- Insert Guests
INSERT INTO guest (first_name, last_name, phone_number, email, preferred_room_type, house_number, street, district, sub_district, province) VALUES 
('Somchai', 'Jaidee', '0812345678', 'somchai@example.com', 'Single', '99/1', 'Nimman Road', 'Muang', 'Suthep', 'Chiang Mai'),
('Jane', 'Doe', '0898765432', 'jane@example.com', 'VIP Suite', '45', 'Charoen Prathet', 'Muang', 'Pha Sing', 'Chiang Mai');

-- Insert Employees (Supertype)
INSERT INTO employee (first_name, last_name, phone_number, email, house_number, street, district, sub_district, province, title) VALUES 
('Anan', 'Vong', '0821112233', 'anan.m@lannadoi.com', '12', 'Huay Kaew', 'Muang', 'Suthep', 'Chiang Mai', 'Manager'),
('Mali', 'Sri', '0834445566', 'mali.r@lannadoi.com', '88', 'Chang Phueak', 'Muang', 'Chang Phueak', 'Chiang Mai', 'Receptionist'),
('Daeng', 'Kong', '0847778899', 'daeng.h@lannadoi.com', '23/4', 'Mahidol', 'Muang', 'Hae Kaeo', 'Chiang Mai', 'Housekeeper');

-- Insert Employee Subtypes (Must reference existing employee_ids)
INSERT INTO manager (employee_id) VALUES (1);
INSERT INTO receptionist (employee_id) VALUES (2);
INSERT INTO housekeeper (employee_id) VALUES (3);

-- Insert Booking (Processed by receptionist ID 2, for guest ID 1)
INSERT INTO booking (check_in_date, check_out_date, total_amount, booking_status, payment_status, guest_id, employee_id) VALUES 
('2026-10-01', '2026-10-03', 2400.00, 'Confirmed', 'Paid', 1, 2);

-- Link Booking to Room via Associative Entity
INSERT INTO booking_room (rate_charged, booking_id, room_id) VALUES 
(1200.00, 1, 1);

-- Insert Payment Record
INSERT INTO payment (payment_date, payment_method, amount, booking_id) VALUES 
('2026-10-01', 'Credit Card', 2400.00, 1);

-- Insert Billing Snapshot (1-to-1 optional relationship)
INSERT INTO billing (invoice_date, total_amount, booking_id) VALUES 
('2026-10-03', 2400.00, 1);

-- Insert Housekeeping Log (Assigned to housekeeper ID 3)
INSERT INTO housekeeping_log (`date`, status, room_id, employee_id) VALUES 
('2026-10-01', 'Cleaned', 1, 3);
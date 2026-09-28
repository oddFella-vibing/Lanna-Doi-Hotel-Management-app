-- =====================================================================
-- seed.sql : Sample data (English) for schema.sql (MySQL)
-- Run after schema.sql:   mysql -u <user> -p <database> < seed.sql
-- Re-runnable: every table is truncated first (existing data is lost and
-- AUTO_INCREMENT restarts at 1).
-- Dates are relative to the current date, 2026-09-28.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE billing;
TRUNCATE TABLE payment;
TRUNCATE TABLE housekeeping_log;
TRUNCATE TABLE service;
TRUNCATE TABLE booking_room;
TRUNCATE TABLE booking;
TRUNCATE TABLE room;
TRUNCATE TABLE guest;
TRUNCATE TABLE receptionist;
TRUNCATE TABLE housekeeper;
TRUNCATE TABLE manager;
TRUNCATE TABLE employee;
SET FOREIGN_KEY_CHECKS = 1;


-- 1) employee (title = Manager / Receptionist / Housekeeper)
INSERT INTO employee (employee_id, first_name, last_name, phone_number, email, house_number, street, district, sub_district, province, title) VALUES
(1, 'Somchai', 'Jaidee', '081-234-5601', 'somchai.j@lannagrand.co.th', '88/1', 'Nimmanhaemin', 'Mueang Chiang Mai', 'Suthep', 'Chiang Mai', 'Manager'),
(2, 'Wipa', 'Rattanakorn', '081-234-5602', 'wipa.r@lannagrand.co.th', '15', 'Huay Kaew', 'Mueang Chiang Mai', 'Chang Phueak', 'Chiang Mai', 'Manager'),
(3, 'Preecha', 'Suksom', '082-345-6703', 'preecha.s@lannagrand.co.th', '102', 'Suthep', 'Mueang Chiang Mai', 'Suthep', 'Chiang Mai', 'Receptionist'),
(4, 'Napa', 'Kaewmanee', '082-345-6704', 'napa.k@lannagrand.co.th', '45/2', 'Charoen Muang', 'Mueang Chiang Mai', 'Wat Ket', 'Chiang Mai', 'Receptionist'),
(5, 'Kitti', 'Wongsa', '083-456-7805', 'kitti.w@lannagrand.co.th', '7', 'Mahidol', 'Mueang Chiang Mai', 'Hai Ya', 'Chiang Mai', 'Receptionist'),
(6, 'Pimchanok', 'Srisuk', '083-456-7806', 'pimchanok.s@lannagrand.co.th', '233', 'Chiang Mai-Lampang', 'Mueang Chiang Mai', 'Chang Moi', 'Chiang Mai', 'Receptionist'),
(7, 'Thanakorn', 'Panyadee', '084-567-8907', 'thanakorn.p@lannagrand.co.th', '59/4', 'Tha Phae', 'Mueang Chiang Mai', 'Chang Khlan', 'Chiang Mai', 'Receptionist'),
(8, 'Somsri', 'Boonma', '085-678-9008', 'somsri.b@lannagrand.co.th', '12/3', 'San Sai-Phrao', 'San Sai', 'Nong Han', 'Chiang Mai', 'Housekeeper'),
(9, 'Boonlert', 'Khamkaew', '085-678-9009', 'boonlert.k@lannagrand.co.th', '76', 'Chiang Mai-Hang Dong', 'Hang Dong', 'Hang Dong', 'Chiang Mai', 'Housekeeper'),
(10, 'Chanpen', 'Thongdee', '086-789-0110', 'chanpen.t@lannagrand.co.th', '9/5', 'Saraphi-Don Kaeo', 'Saraphi', 'Yang Noeng', 'Chiang Mai', 'Housekeeper'),
(11, 'Suree', 'Jaiwong', '086-789-0111', 'suree.j@lannagrand.co.th', '301', 'Mae Rim-Samoeng', 'Mae Rim', 'Rim Tai', 'Chiang Mai', 'Housekeeper'),
(12, 'Orathai', 'Saising', '087-890-1212', 'orathai.s@lannagrand.co.th', '18', 'Chang Khlan', 'Mueang Chiang Mai', 'Chang Khlan', 'Chiang Mai', 'Housekeeper'),
(13, 'Manop', 'Khattiya', '087-890-1213', 'manop.k@lannagrand.co.th', '64/7', 'Chotana', 'Mueang Chiang Mai', 'Chang Phueak', 'Chiang Mai', 'Housekeeper'),
(14, 'Lamduan', 'Intha', '088-901-2314', 'lamduan.i@lannagrand.co.th', '5', 'Super Highway', 'Mueang Chiang Mai', 'Fa Ham', 'Chiang Mai', 'Housekeeper'),
(15, 'Waraporn', 'Pansorn', '088-901-2315', 'waraporn.p@lannagrand.co.th', '140/2', 'Maejo-Phrao', 'San Sai', 'Nong Chom', 'Chiang Mai', 'Housekeeper');

-- 2) employee subtypes
INSERT INTO manager (employee_id) VALUES (1), (2);
INSERT INTO receptionist (employee_id) VALUES (3), (4), (5), (6), (7);
INSERT INTO housekeeper (employee_id) VALUES (8), (9), (10), (11), (12), (13), (14), (15);

-- 3) guest
INSERT INTO guest (guest_id, first_name, last_name, phone_number, email, preferred_room_type, house_number, street, district, sub_district, province) VALUES
(1, 'Anucha', 'Pongpaiboon', '089-111-2201', 'anucha.p@example.com', 'Standard', '25/8', 'Sukhumvit', 'Watthana', 'Khlong Tan Nuea', 'Bangkok'),
(2, 'Sudarat', 'Mankong', '089-111-2202', 'sudarat.m@example.com', 'Deluxe', '112', 'Ratchadaphisek', 'Din Daeng', 'Din Daeng', 'Bangkok'),
(3, 'Prasert', 'Wongsawat', '089-111-2203', 'prasert.w@example.com', 'Family', '9/1', 'Nimmanhaemin', 'Mueang Chiang Mai', 'Suthep', 'Chiang Mai'),
(4, 'Chonticha', 'Kasemsuk', '089-111-2204', 'chonticha.k@example.com', 'Standard', '77', 'Mittraphap', 'Mueang Khon Kaen', 'Nai Mueang', 'Khon Kaen'),
(5, 'Teerapong', 'Suwanchat', '089-111-2205', 'teerapong.s@example.com', 'Suite', '3/12', 'Rama IV', 'Khlong Toei', 'Khlong Toei', 'Bangkok'),
(6, 'Kamonwan', 'Sriudom', '089-111-2206', 'kamonwan.s@example.com', 'Deluxe', '58', 'Walking Street', 'Mueang Phuket', 'Talat Yai', 'Phuket'),
(7, 'Weera', 'Thonglor', '089-111-2207', 'weera.t@example.com', 'Standard', '190/4', 'Silom', 'Bang Rak', 'Silom', 'Bangkok'),
(8, 'Nantana', 'Jitcharoen', '089-111-2208', 'nantana.j@example.com', 'Deluxe', '21', 'Tha Phae', 'Mueang Chiang Mai', 'Chang Khlan', 'Chiang Mai'),
(9, 'Sakchai', 'Boonruang', '089-111-2209', 'sakchai.b@example.com', 'Family', '45', 'Phetkasem', 'Hat Yai', 'Hat Yai', 'Songkhla'),
(10, 'Pornthip', 'Akkaradet', '089-111-2210', 'pornthip.a@example.com', 'Suite', '8', 'Lat Phrao', 'Chatuchak', 'Chom Phon', 'Bangkok'),
(11, 'Sumet', 'Jaisa-at', '089-111-2211', 'sumet.j@example.com', 'Standard', '132', 'Charoen Krung', 'Bang Kho Laem', 'Bang Kho Laem', 'Bangkok'),
(12, 'Rattana', 'Poonsin', '089-111-2212', 'rattana.p@example.com', 'Deluxe', '67/3', 'Chang Khlan', 'Mueang Chiang Mai', 'Chang Khlan', 'Chiang Mai'),
(13, 'Nattawut', 'Phetcharat', '089-111-2213', 'nattawut.p@example.com', 'Family', '14', 'Ratchadamnoen', 'Phra Nakhon', 'Bowon Niwet', 'Bangkok'),
(14, 'Onanong', 'Sinthuphan', '089-111-2214', 'onanong.s@example.com', 'Suite', '301', 'Maharat', 'Mueang Nakhon Ratchasima', 'Nai Mueang', 'Nakhon Ratchasima'),
(15, 'Panupong', 'Khongcharoen', '089-111-2215', 'panupong.k@example.com', 'Deluxe', '5/6', 'Chaeng Watthana', 'Pak Kret', 'Bang Phut', 'Nonthaburi'),
(16, 'Malee', 'Siriwat', '089-111-2216', 'malee.s@example.com', 'Standard', '99', 'Tha Phae Walking Street', 'Mueang Chiang Rai', 'Wiang', 'Chiang Rai'),
(17, 'Kraisorn', 'Phumiphat', '089-111-2217', 'kraisorn.p@example.com', 'Suite', '2', 'Vibhavadi Rangsit', 'Lak Si', 'Thung Song Hong', 'Bangkok'),
(18, 'Piyanuch', 'Chaimongkol', '089-111-2218', 'piyanuch.c@example.com', 'Family', '73/9', 'Highway 304', 'Mueang Prachin Buri', 'Na Mueang', 'Prachin Buri'),
(19, 'Jesada', 'Inthrawong', '089-111-2219', 'jesada.i@example.com', 'Suite', '40', 'Pattaya Klang', 'Bang Lamung', 'Nong Prue', 'Chon Buri'),
(20, 'Siriporn', 'Maneerat', '089-111-2220', 'siriporn.m@example.com', 'Standard', '18/2', 'Prachasamran', 'Mueang Udon Thani', 'Mak Khaeng', 'Udon Thani');

-- 4) room (room_status: Available / Occupied / Maintenance / Cleaning)
INSERT INTO room (room_id, room_number, price_per_night, room_type, room_status) VALUES
(1, '101', 1200.00, 'Standard', 'Occupied'),
(2, '102', 1200.00, 'Standard', 'Available'),
(3, '103', 1200.00, 'Standard', 'Available'),
(4, '104', 1200.00, 'Standard', 'Available'),
(5, '105', 1200.00, 'Standard', 'Available'),
(6, '201', 1800.00, 'Deluxe', 'Occupied'),
(7, '202', 1800.00, 'Deluxe', 'Occupied'),
(8, '203', 1800.00, 'Deluxe', 'Available'),
(9, '204', 1800.00, 'Deluxe', 'Available'),
(10, '205', 1800.00, 'Deluxe', 'Cleaning'),
(11, '301', 2500.00, 'Family', 'Available'),
(12, '302', 2500.00, 'Family', 'Maintenance'),
(13, '303', 2500.00, 'Family', 'Occupied'),
(14, '304', 2500.00, 'Family', 'Available'),
(15, '401', 3500.00, 'Suite', 'Available'),
(16, '402', 3500.00, 'Suite', 'Available'),
(17, '403', 3500.00, 'Suite', 'Occupied'),
(18, '404', 3500.00, 'Suite', 'Maintenance'),
(19, '501', 5500.00, 'Suite', 'Available'),
(20, '502', 5500.00, 'Suite', 'Available');

-- 5) booking (booking_status: Confirmed / Checked-In / Checked-Out / Cancelled | payment_status: Pending / Partial / Paid)
INSERT INTO booking (booking_id, check_in_date, check_out_date, total_amount, booking_status, payment_status, guest_id, employee_id) VALUES
(1, '2026-09-01', '2026-09-03', 2400.00, 'Checked-Out', 'Paid', 1, 3),
(2, '2026-09-02', '2026-09-05', 5400.00, 'Checked-Out', 'Paid', 2, 4),
(3, '2026-09-05', '2026-09-08', 7500.00, 'Checked-Out', 'Paid', 3, 3),
(4, '2026-09-08', '2026-09-10', 4800.00, 'Checked-Out', 'Paid', 4, 5),
(5, '2026-09-10', '2026-09-14', 14000.00, 'Checked-Out', 'Paid', 5, 6),
(6, '2026-09-12', '2026-09-15', 5400.00, 'Checked-Out', 'Paid', 6, 7),
(7, '2026-09-15', '2026-09-17', 2400.00, 'Checked-Out', 'Paid', 7, 3),
(8, '2026-09-16', '2026-09-19', 10800.00, 'Checked-Out', 'Paid', 8, 4),
(9, '2026-09-18', '2026-09-20', 5000.00, 'Cancelled', 'Pending', 9, 5),
(10, '2026-09-20', '2026-09-23', 10500.00, 'Checked-Out', 'Paid', 10, 6),
(11, '2026-09-22', '2026-09-25', 3600.00, 'Checked-Out', 'Paid', 11, 7),
(12, '2026-09-24', '2026-09-27', 5400.00, 'Checked-Out', 'Paid', 12, 3),
(13, '2026-09-25', '2026-09-29', 10000.00, 'Checked-In', 'Partial', 13, 4),
(14, '2026-09-26', '2026-09-30', 14000.00, 'Checked-In', 'Paid', 14, 5),
(15, '2026-09-27', '2026-09-29', 7200.00, 'Checked-In', 'Partial', 15, 6),
(16, '2026-09-28', '2026-10-01', 3600.00, 'Checked-In', 'Pending', 16, 7),
(17, '2026-10-03', '2026-10-06', 16500.00, 'Confirmed', 'Partial', 17, 3),
(18, '2026-10-05', '2026-10-08', 18000.00, 'Confirmed', 'Pending', 18, 4),
(19, '2026-10-10', '2026-10-12', 11000.00, 'Confirmed', 'Partial', 19, 5),
(20, '2026-10-15', '2026-10-18', 10800.00, 'Confirmed', 'Pending', 20, 6);

-- 6) booking_room (multi-room bookings: 4, 8, 15, 18, 20)
INSERT INTO booking_room (booking_room_id, rate_charged, booking_id, room_id) VALUES
(1, 1200.00, 1, 1),
(2, 1800.00, 2, 6),
(3, 2500.00, 3, 11),
(4, 1200.00, 4, 2),
(5, 1200.00, 4, 3),
(6, 3500.00, 5, 15),
(7, 1800.00, 6, 7),
(8, 1200.00, 7, 4),
(9, 1800.00, 8, 8),
(10, 1800.00, 8, 9),
(11, 2500.00, 9, 12),
(12, 3500.00, 10, 16),
(13, 1200.00, 11, 5),
(14, 1800.00, 12, 10),
(15, 2500.00, 13, 13),
(16, 3500.00, 14, 17),
(17, 1800.00, 15, 6),
(18, 1800.00, 15, 7),
(19, 1200.00, 16, 1),
(20, 5500.00, 17, 19),
(21, 2500.00, 18, 14),
(22, 3500.00, 18, 15),
(23, 5500.00, 19, 20),
(24, 1200.00, 20, 2),
(25, 1200.00, 20, 3),
(26, 1200.00, 20, 4);

-- 7) service
INSERT INTO service (service_id, description, charged_amount, booking_id) VALUES
(1, 'Extra breakfast for 2', 300.00, 2),
(2, 'Laundry service', 250.00, 3),
(3, 'Chiang Mai airport transfer', 800.00, 5),
(4, 'Minibar', 450.00, 5),
(5, 'Thai massage, 1 hour x 2 guests', 1200.00, 10),
(6, 'Laundry service', 180.00, 6),
(7, 'Extra breakfast for 2', 300.00, 8),
(8, 'Extra bed', 500.00, 4),
(9, 'Chiang Mai airport transfer', 800.00, 12),
(10, 'Minibar', 350.00, 13),
(11, 'Laundry service', 200.00, 14),
(12, 'Thai massage, 1 hour', 1000.00, 14),
(13, 'Extra breakfast for 4', 400.00, 15),
(14, 'Motorbike rental, 1 day', 300.00, 1),
(15, 'Chiang Mai airport transfer', 800.00, 11);

-- 8) payment (payment_method: Credit Card / Cash / Bank Transfer / PromptPay)
INSERT INTO payment (payment_id, payment_date, payment_method, amount, booking_id) VALUES
(1, '2026-09-03 09:15:00', 'PromptPay', 2700.00, 1),
(2, '2026-09-05 10:30:00', 'Credit Card', 5700.00, 2),
(3, '2026-09-08 11:45:00', 'Cash', 7750.00, 3),
(4, '2026-09-01 13:20:00', 'Bank Transfer', 2000.00, 4),
(5, '2026-09-10 14:05:00', 'Cash', 3300.00, 4),
(6, '2026-09-05 15:40:00', 'Credit Card', 5000.00, 5),
(7, '2026-09-14 16:25:00', 'Credit Card', 10250.00, 5),
(8, '2026-09-15 09:15:00', 'PromptPay', 5580.00, 6),
(9, '2026-09-17 10:30:00', 'Cash', 2400.00, 7),
(10, '2026-09-19 11:45:00', 'Credit Card', 11100.00, 8),
(11, '2026-09-23 13:20:00', 'Credit Card', 11700.00, 10),
(12, '2026-09-25 14:05:00', 'PromptPay', 4400.00, 11),
(13, '2026-09-27 15:40:00', 'Cash', 6200.00, 12),
(14, '2026-09-25 16:25:00', 'Bank Transfer', 5000.00, 13),
(15, '2026-09-28 09:15:00', 'Credit Card', 15200.00, 14),
(16, '2026-09-27 10:30:00', 'PromptPay', 3600.00, 15),
(17, '2026-09-20 11:45:00', 'Bank Transfer', 5000.00, 17),
(18, '2026-09-22 13:20:00', 'PromptPay', 3000.00, 19);

-- 9) billing (one invoice per booking | total_amount = room charges + extra services)
INSERT INTO billing (billing_id, invoice_date, total_amount, booking_id) VALUES
(1, '2026-09-03 11:45:00', 2700.00, 1),
(2, '2026-09-05 13:20:00', 5700.00, 2),
(3, '2026-09-08 14:05:00', 7750.00, 3),
(4, '2026-09-10 15:40:00', 5300.00, 4),
(5, '2026-09-14 16:25:00', 15250.00, 5),
(6, '2026-09-15 09:15:00', 5580.00, 6),
(7, '2026-09-17 10:30:00', 2400.00, 7),
(8, '2026-09-19 11:45:00', 11100.00, 8),
(9, '2026-09-23 13:20:00', 11700.00, 10),
(10, '2026-09-25 14:05:00', 4400.00, 11),
(11, '2026-09-27 15:40:00', 6200.00, 12),
(12, '2026-09-28 16:25:00', 15200.00, 14),
(13, '2026-09-28 09:15:00', 10350.00, 13),
(14, '2026-09-28 10:30:00', 7600.00, 15);

-- 10) housekeeping_log (status: Pending / In Progress / Completed / Inspected)
INSERT INTO housekeeping_log (housekeeping_log_id, date, status, room_id, employee_id) VALUES
(1, '2026-09-27', 'Completed', 1, 8),
(2, '2026-09-27', 'Completed', 6, 9),
(3, '2026-09-27', 'Completed', 7, 9),
(4, '2026-09-27', 'Inspected', 13, 10),
(5, '2026-09-27', 'Inspected', 17, 11),
(6, '2026-09-27', 'Pending', 10, 12),
(7, '2026-09-28', 'In Progress', 10, 12),
(8, '2026-09-28', 'Completed', 2, 13),
(9, '2026-09-28', 'Completed', 3, 13),
(10, '2026-09-28', 'Inspected', 4, 14),
(11, '2026-09-28', 'Pending', 8, 8),
(12, '2026-09-28', 'Pending', 9, 10),
(13, '2026-09-26', 'Completed', 16, 11),
(14, '2026-09-26', 'Inspected', 5, 8),
(15, '2026-09-25', 'Completed', 11, 15),
(16, '2026-09-25', 'Inspected', 15, 14),
(17, '2026-09-24', 'Completed', 8, 13),
(18, '2026-09-24', 'Completed', 9, 13),
(19, '2026-09-23', 'Inspected', 16, 9),
(20, '2026-09-22', 'Completed', 5, 8);

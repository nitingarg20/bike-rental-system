/* ===========================================================
   FILE 03 : SAMPLE DATA
   Bike Rental System

   NOTE: All seeded Users have password "password123"
         All seeded Admins have password  "admin123"
         (both stored as bcrypt hashes so they work with the
         Node backend's login routes out of the box)
   =========================================================== */

USE bike_rental;

---------------------------------------------------------------
-- 3.1 LOCATION DATA
---------------------------------------------------------------
INSERT INTO Location (City, State, Street, Latitude, Longitude) VALUES
('New York', 'NY', '123 Broadway', 40.712776, -74.005974),
('Los Angeles', 'CA', '456 Sunset Blvd', 34.052235, -118.243683),
('Chicago', 'IL', '789 Michigan Ave', 41.878114, -87.629798),
('Houston', 'TX', '101 Main Street', 29.760427, -95.369804),
('Miami', 'FL', '202 Ocean Drive', 25.761681, -80.191788),
('Seattle', 'WA', '303 Pine St', 47.606209, -122.332071),
('Boston', 'MA', '404 Beacon St', 42.360081, -71.058884),
('San Francisco', 'CA', '505 Market St', 37.774929, -122.419418),
('Denver', 'CO', '606 Colfax Ave', 39.739236, -104.990251),
('Austin', 'TX', '707 Congress Ave', 30.267153, -97.743057);

---------------------------------------------------------------
-- 3.2 USER DATA  (password for all: password123)
---------------------------------------------------------------
INSERT INTO User (FirstName, PhoneNumber, PasswordHash) VALUES
('John', '555-0101', '$2b$10$VWed8ZQUOynvJChQs65e/.mOkSYnDcSntLVtIzpdwu/KlKjTPhFw2'),
('Jane', '555-0202', '$2b$10$VWed8ZQUOynvJChQs65e/.mOkSYnDcSntLVtIzpdwu/KlKjTPhFw2'),
('Robert', '555-0303', '$2b$10$VWed8ZQUOynvJChQs65e/.mOkSYnDcSntLVtIzpdwu/KlKjTPhFw2'),
('Emily', '555-0404', '$2b$10$VWed8ZQUOynvJChQs65e/.mOkSYnDcSntLVtIzpdwu/KlKjTPhFw2'),
('Michael', '555-0505', '$2b$10$VWed8ZQUOynvJChQs65e/.mOkSYnDcSntLVtIzpdwu/KlKjTPhFw2'),
('Sarah', '555-0606', '$2b$10$VWed8ZQUOynvJChQs65e/.mOkSYnDcSntLVtIzpdwu/KlKjTPhFw2'),
('David', '555-0707', '$2b$10$VWed8ZQUOynvJChQs65e/.mOkSYnDcSntLVtIzpdwu/KlKjTPhFw2'),
('Jessica', '555-0808', '$2b$10$VWed8ZQUOynvJChQs65e/.mOkSYnDcSntLVtIzpdwu/KlKjTPhFw2'),
('Thomas', '555-0909', '$2b$10$VWed8ZQUOynvJChQs65e/.mOkSYnDcSntLVtIzpdwu/KlKjTPhFw2'),
('Jennifer', '555-1010', '$2b$10$VWed8ZQUOynvJChQs65e/.mOkSYnDcSntLVtIzpdwu/KlKjTPhFw2');

INSERT INTO User_Email (Email, UserID) VALUES
('john.doe@example.com', 1),
('jane.smith@example.com', 2),
('robert.j@example.com', 3),
('emily.w@example.com', 4),
('michael.b@example.com', 5),
('sarah.d@example.com', 6),
('david.m@example.com', 7),
('jessica.w@example.com', 8),
('thomas.m@example.com', 9),
('jennifer.t@example.com', 10);

---------------------------------------------------------------
-- 3.3 ADMIN DATA  (password for all: admin123)
---------------------------------------------------------------
INSERT INTO Admin (PasswordHash) VALUES
('$2b$10$jRM9Fc0h2L5QqAZtk5wSuuMDNVhFWGEZbfUZoVHfjUYLmaRSudbWe'),
('$2b$10$jRM9Fc0h2L5QqAZtk5wSuuMDNVhFWGEZbfUZoVHfjUYLmaRSudbWe'),
('$2b$10$jRM9Fc0h2L5QqAZtk5wSuuMDNVhFWGEZbfUZoVHfjUYLmaRSudbWe'),
('$2b$10$jRM9Fc0h2L5QqAZtk5wSuuMDNVhFWGEZbfUZoVHfjUYLmaRSudbWe'),
('$2b$10$jRM9Fc0h2L5QqAZtk5wSuuMDNVhFWGEZbfUZoVHfjUYLmaRSudbWe');

INSERT INTO Admin_Email (Email, AdminID) VALUES
('admin1@bikerental.com', 1),
('admin2@bikerental.com', 2),
('admin3@bikerental.com', 3),
('admin4@bikerental.com', 4),
('admin5@bikerental.com', 5);

---------------------------------------------------------------
-- 3.4 BIKE DATA
---------------------------------------------------------------
INSERT INTO Bike (Model, Brand, Status, LocationID, RatePerHour) VALUES
('Roadster 500', 'Giant', 'Available', 1, 15.75),
('Mountain Pro', 'Trek', 'Available', 2, 18.50),
('City Cruiser', 'Schwinn', 'Rented', 3, 12.00),
('Speed Demon', 'Specialized', 'Maintenance', 4, 20.00),
('Urban Commuter', 'Cannondale', 'Available', 5, 14.25),
('Trail Blazer', 'Giant', 'Available', 1, 16.00),
('Electra Glide', 'Trek', 'Available', 6, 22.00),
('Fixie Classic', 'Schwinn', 'Available', 7, 10.50);

---------------------------------------------------------------
-- 3.5 BOOKING DATA
---------------------------------------------------------------
INSERT INTO Booking (UserID, BikeID, StartTime, EndTime, TotalCost, Status) VALUES
(1, 3, '2023-06-01 10:00:00', '2023-06-01 12:30:00', 30.00, 'Completed'),
(2, 1, '2023-06-02 09:00:00', '2023-06-02 11:00:00', 31.50, 'Completed'),
(5, 4, '2023-06-05 13:00:00', '2023-06-05 15:00:00', 40.00, 'Cancelled');

---------------------------------------------------------------
-- 3.6 PAYMENT DATA
---------------------------------------------------------------
INSERT INTO Payment (BooklogID, UserID, Amount, PaymentMethod, PaymentStatus) VALUES
(1, 1, 30.00, 'Card', 'Completed'),
(2, 2, 31.50, 'Wallet', 'Completed'),
(3, 5, 40.00, 'Card', 'Refunded');

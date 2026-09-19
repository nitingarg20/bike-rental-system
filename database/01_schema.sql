/* ===========================================================
   FILE 01 : DATABASE + SCHEMA
   Bike Rental System
   =========================================================== */

DROP DATABASE IF EXISTS bike_rental;
CREATE DATABASE bike_rental;
USE bike_rental;

---------------------------------------------------------------
-- Location
---------------------------------------------------------------
CREATE TABLE Location (
    LocationID INT AUTO_INCREMENT PRIMARY KEY,
    City VARCHAR(100) NOT NULL,
    State VARCHAR(50) NOT NULL,
    Street VARCHAR(255),
    Latitude DECIMAL(10,6),
    Longitude DECIMAL(10,6)
);

---------------------------------------------------------------
-- User
---------------------------------------------------------------
CREATE TABLE User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20),
    PasswordHash VARCHAR(255) NOT NULL
);

CREATE TABLE User_Email (
    EmailID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    UserID INT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

---------------------------------------------------------------
-- Admin
---------------------------------------------------------------
CREATE TABLE Admin (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    PasswordHash VARCHAR(255) NOT NULL
);

CREATE TABLE Admin_Email (
    AdminEmailID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    AdminID INT NOT NULL,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID) ON DELETE CASCADE
);

---------------------------------------------------------------
-- Bike
---------------------------------------------------------------
CREATE TABLE Bike (
    BikeID INT AUTO_INCREMENT PRIMARY KEY,
    Model VARCHAR(100) NOT NULL,
    Brand VARCHAR(100) NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Available',
    LocationID INT,
    RatePerHour DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID)
);

---------------------------------------------------------------
-- Booking
---------------------------------------------------------------
CREATE TABLE Booking (
    BooklogID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    BikeID INT NOT NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    TotalCost DECIMAL(10,2),
    Status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (BikeID) REFERENCES Bike(BikeID)
);

---------------------------------------------------------------
-- Manages (Admin <-> Booking, many-to-many audit link)
---------------------------------------------------------------
CREATE TABLE Manages (
    ManageID INT AUTO_INCREMENT PRIMARY KEY,
    AdminID INT NOT NULL,
    BooklogID INT NOT NULL,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID),
    FOREIGN KEY (BooklogID) REFERENCES Booking(BooklogID)
);

---------------------------------------------------------------
-- Payment
---------------------------------------------------------------
CREATE TABLE Payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    BooklogID INT NOT NULL,
    UserID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod VARCHAR(50),
    PaymentStatus VARCHAR(50) NOT NULL DEFAULT 'Completed',
    FOREIGN KEY (BooklogID) REFERENCES Booking(BooklogID),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

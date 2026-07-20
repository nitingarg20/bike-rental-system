/* ===========================================================
   FILE 02 : TABLE DEFINITIONS
   =========================================================== */

---------------------------------------------------------------
-- 2.1 LOCATION & USER TABLES
---------------------------------------------------------------

CREATE TABLE Location (
    LocationID INT AUTO_INCREMENT PRIMARY KEY,
    City VARCHAR(100),
    State VARCHAR(50),
    Street VARCHAR(255),
    Latitude DECIMAL(10,6),
    Longitude DECIMAL(10,6)
);

CREATE TABLE User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    PhoneNumber VARCHAR(20),
    PasswordHash VARCHAR(255)
);

CREATE TABLE User_Email (
    EmailID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255),
    UserID INT,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

---------------------------------------------------------------
-- 2.2 ADMIN TABLES
---------------------------------------------------------------

CREATE TABLE Admin (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    PasswordHash VARCHAR(255)
);

CREATE TABLE Admin_Email (
    AdminEmailID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255),
    AdminID INT,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID)
);

---------------------------------------------------------------
-- 2.3 BIKE & BOOKING TABLES
---------------------------------------------------------------

CREATE TABLE Bike (
    BikeID INT AUTO_INCREMENT PRIMARY KEY,
    Model VARCHAR(100),
    Brand VARCHAR(100),
    Status VARCHAR(20),
    LocationID INT,
    RatePerHour DECIMAL(10,2),
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID)
);

CREATE TABLE Booking (
    BooklogID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    BikeID INT,
    StartTime DATETIME,
    EndTime DATETIME,
    TotalCost DECIMAL(10,2),
    Status VARCHAR(50),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (BikeID) REFERENCES Bike(BikeID)
);

---------------------------------------------------------------
-- 2.4 MANAGES TABLE
---------------------------------------------------------------

CREATE TABLE Manages (
    ManageID INT AUTO_INCREMENT PRIMARY KEY,
    AdminID INT,
    BooklogID INT,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID),
    FOREIGN KEY (BooklogID) REFERENCES Booking(BooklogID)
);

---------------------------------------------------------------
-- 2.5 PAYMENT TABLE
---------------------------------------------------------------

CREATE TABLE Payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    BooklogID INT,
    UserID INT,
    Amount DECIMAL(10,2),
    PaymentMethod VARCHAR(50),
    PaymentStatus VARCHAR(50),
    FOREIGN KEY (BooklogID) REFERENCES Booking(BooklogID),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);
	
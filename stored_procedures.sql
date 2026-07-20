/* ===========================================================
   FILE 04 : PROCEDURES & TRIGGERS
   =========================================================== */

-- drop old procedures and triggers
DROP PROCEDURE IF EXISTS AddBike;
DROP PROCEDURE IF EXISTS CancelBooking;
DROP PROCEDURE IF EXISTS GetAvailableBikesByLocation;
DROP PROCEDURE IF EXISTS GetUserBookingHistory;
DROP PROCEDURE IF EXISTS UndoCancelBooking;
DROP PROCEDURE IF EXISTS BookBike;
DROP PROCEDURE IF EXISTS ReturnBike;

DROP TRIGGER IF EXISTS prevent_double_booking;
DROP TRIGGER IF EXISTS update_bike_status_after_booking;

---------------------------------------------------------------
-- AddBike
---------------------------------------------------------------

DELIMITER //
CREATE PROCEDURE AddBike(
    IN p_Model VARCHAR(50),
    IN p_Brand VARCHAR(50),
    IN p_Status VARCHAR(20),
    IN p_LocationID INT,
    IN p_RatePerHour DECIMAL(10,2)
)
BEGIN
    IF p_Status NOT IN ('Available','Rented','Maintenance') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Invalid Status';
    END IF;

    INSERT INTO Bike(Model,Brand,Status,LocationID,RatePerHour)
    VALUES(p_Model,p_Brand,p_Status,p_LocationID,p_RatePerHour);
END //
DELIMITER ;

---------------------------------------------------------------
-- CancelBooking
---------------------------------------------------------------

DELIMITER //
CREATE PROCEDURE CancelBooking(IN p_BooklogID INT)
BEGIN
    DECLARE v_BikeID INT;

    SELECT BikeID INTO v_BikeID FROM Booking WHERE BooklogID=p_BooklogID;

    UPDATE Booking SET Status='Cancelled' WHERE BooklogID=p_BooklogID;
    UPDATE Bike SET Status='Available' WHERE BikeID=v_BikeID;
    UPDATE Payment SET PaymentStatus='Refunded' WHERE BooklogID=p_BooklogID;
END //
DELIMITER ;

---------------------------------------------------------------
-- GetAvailableBikesByLocation
---------------------------------------------------------------

DELIMITER //
CREATE PROCEDURE GetAvailableBikesByLocation(IN p_LocationID INT)
BEGIN
    SELECT * FROM Bike
    WHERE LocationID=p_LocationID AND Status='Available';
END //
DELIMITER ;

-- -------------------------------------------------------------
-- GetUserBookingHistory
-- -------------------------------------------------------------

DELIMITER //
CREATE PROCEDURE GetUserBookingHistory(IN p_UserID INT)
BEGIN
    SELECT * FROM Booking
    WHERE UserID=p_UserID
    ORDER BY StartTime DESC;
END //
DELIMITER ;

---------------------------------------------------------------
-- UndoCancelBooking
---------------------------------------------------------------

DELIMITER //
CREATE PROCEDURE UndoCancelBooking(IN p_BooklogID INT)
BEGIN
    DECLARE v_BikeID INT;

    SELECT BikeID INTO v_BikeID FROM Booking WHERE BooklogID=p_BooklogID;

    UPDATE Booking SET Status='Confirmed' WHERE BooklogID=p_BooklogID;
    UPDATE Bike SET Status='Rented' WHERE BikeID=v_BikeID;
    UPDATE Payment SET PaymentStatus='Completed' WHERE BooklogID=p_BooklogID;
END //
DELIMITER ;

-- -------------------------------------------------------------
-- BookBike (with Payment creation)
-- -------------------------------------------------------------

DROP PROCEDURE IF EXISTS BookBike;
DELIMITER //
CREATE PROCEDURE BookBike(
    IN p_BikeID INT,
    IN p_UserID INT,
    IN p_StartTime DATETIME,
    IN p_EndTime DATETIME
)
BEGIN
    DECLARE v_rate DECIMAL(10,2);
    DECLARE v_duration DECIMAL(10,2);
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_newBookingID INT;
    DECLARE v_userConflict INT DEFAULT 0;

    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM User WHERE UserID = p_UserID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User does not exist.';
    END IF;

    -- Check if user already has overlapping booking
    SELECT COUNT(*) INTO v_userConflict
    FROM Booking
    WHERE UserID = p_UserID
      AND Status <> 'Cancelled'
      AND p_StartTime < EndTime
      AND p_EndTime > StartTime;

    IF v_userConflict > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User already has a booking during this time.';
    END IF;

    -- Check if bike is available
    SELECT RatePerHour INTO v_rate
    FROM Bike
    WHERE BikeID = p_BikeID AND Status = 'Available';

    IF v_rate IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Bike not available.';
    END IF;

    -- Duration calculation
    SET v_duration = TIMESTAMPDIFF(MINUTE, p_StartTime, p_EndTime) / 60;
    SET v_total = ROUND(v_duration * v_rate, 2);

    -- Insert booking
    INSERT INTO Booking (UserID, BikeID, StartTime, EndTime, TotalCost, Status)
    VALUES (p_UserID, p_BikeID, p_StartTime, p_EndTime, v_total, 'Confirmed');

    SET v_newBookingID = LAST_INSERT_ID();

    -- Insert payment
    INSERT INTO Payment (BooklogID, UserID, Amount, PaymentMethod, PaymentStatus)
    VALUES (v_newBookingID, p_UserID, v_total, 'Card', 'Completed');

    -- Update bike status
    UPDATE Bike 
    SET Status = 'Rented' 
    WHERE BikeID = p_BikeID;

END //
DELIMITER ;


---------------------------------------------------------------
-- ReturnBike
---------------------------------------------------------------

DELIMITER //
CREATE PROCEDURE ReturnBike(IN p_BooklogID INT)
BEGIN
    DECLARE v_BikeID INT;
    DECLARE v_Status VARCHAR(50);

    IF NOT EXISTS(SELECT 1 FROM Booking WHERE BooklogID=p_BooklogID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Booking does not exist';
    END IF;

    SELECT BikeID,Status INTO v_BikeID,v_Status
    FROM Booking WHERE BooklogID=p_BooklogID;

    IF v_Status='Cancelled' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Cannot return a cancelled booking';
    END IF;

    IF v_Status='Completed' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Bike already returned';
    END IF;

    UPDATE Booking SET Status='Completed' WHERE BooklogID=p_BooklogID;
    UPDATE Bike SET Status='Available' WHERE BikeID=v_BikeID;
    UPDATE Payment SET PaymentStatus='Completed' WHERE BooklogID=p_BooklogID;
END //
DELIMITER ;

---------------------------------------------------------------
-- Trigger: Prevent Double Booking
---------------------------------------------------------------

DELIMITER //
CREATE TRIGGER prevent_double_booking
BEFORE INSERT ON Booking
FOR EACH ROW
BEGIN
    IF (SELECT COUNT(*) FROM Booking
        WHERE BikeID=NEW.BikeID
        AND Status <> 'Cancelled'
        AND NEW.StartTime < EndTime
        AND NEW.EndTime > StartTime) > 0
    THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='Bike already booked';
    END IF;
END //
DELIMITER ;

---------------------------------------------------------------
-- Trigger: Update Bike Status After Booking
---------------------------------------------------------------

DELIMITER //
CREATE TRIGGER update_bike_status_after_booking
AFTER INSERT ON Booking
FOR EACH ROW
BEGIN
    IF NEW.Status='Confirmed' THEN
        UPDATE Bike SET Status='Rented'
        WHERE BikeID=NEW.BikeID;
    END IF;
END //
DELIMITER ;


-- User cannot book more than one bike at a same time interval
DROP TRIGGER IF EXISTS prevent_user_double_booking;
DELIMITER //
CREATE TRIGGER prevent_user_double_booking
BEFORE INSERT ON Booking
FOR EACH ROW
BEGIN
    IF (SELECT COUNT(*)
        FROM Booking
        WHERE UserID = NEW.UserID
        AND Status <> 'Cancelled'
        AND NEW.StartTime < EndTime
        AND NEW.EndTime > StartTime) > 0
    THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User already has a booking during this time.';
    END IF;
END //
DELIMITER ;
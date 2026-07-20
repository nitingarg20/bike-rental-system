/* ===========================================================
   FILE 05 : TEST CALLS / DEMONSTRATION
   =========================================================== */
   
   
-- Add bike with valid status
CALL AddBike('Mountain Pro', 'Trek', 'Available', 3, 18.50);
SELECT * FROM Bike WHERE Model='Mountain Pro' AND Brand='Trek';


-- Add bike with invalid status

CALL AddBike('Test Bike', 'Brand', 'InvalidStatus', 1, 15.00);



SELECT * FROM Bike;
SELECT * FROM Booking;

-- bOOK A BIKE
CALL BookBike(9,5,'2025-11-06 12:00:00','2025-11-06 15:00:00');

-- RETURN A BIKE
CALL ReturnBike(8);

CALL BookBike(8,5,'2025-11-07 13:00:00','2025-11-07 16:00:00');

-- CANCEL BOOKING
CALL CancelBooking(9);

-- Check updated booking + payment
SELECT * FROM Booking WHERE BooklogID = 9;
SELECT * FROM Payment WHERE BooklogID = 9;

-- User booking history for User 
CALL GetUserBookingHistory(5);

-- UNDO CANCEL BOOKING
CALL UndoCancelBooking(7);
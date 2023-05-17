import { createBooking } from '@Booking/controllers/create';
import { getAllBookingController } from '@Booking/controllers/getAll';
import { getByDniBookingController } from '@Booking/controllers/getByDni';
import { getByResourceBookingController } from '@Booking/controllers/getByResource';
import { updateBooking, updateBookingController } from '@Booking/controllers/updateBooking';
import express from 'express';
import { getSlotsByResourceController } from '../controllers/getSlotsByResource';

const BookingRoutes = express.Router();

// CREATE BOOKING WITH TENANT IN COOKIES
BookingRoutes.post('/', createBooking);

// GET ALL AVAILABILITY SLOTS BY RESOURCE
BookingRoutes.get('/availability/:id', getSlotsByResourceController);

// GET ALL BOOKINGS BY TENANT IN COOKIES
BookingRoutes.get('/:dateto/:datefrom', getAllBookingController);

// GET BOOKING BY DNI IN QUERY OR GET BOOKING BY RESOURCE CODE IN QUERY
BookingRoutes.get('/', async (req, res) => {
  const { dni, resource } = req.query;
  if (dni !== undefined) {
    await getByDniBookingController(req, res);
  } else if (resource !== undefined) {
    await getByResourceBookingController(req, res);
  } else {
    res.status(400).json({
      message: 'BAD REQUEST',
      statusbar: 'error'
    });
  }
});

// UPDATE BOOKING BY CODE IN PARAMS
BookingRoutes.put('/:code', updateBookingController);

BookingRoutes.put('/booked/:code/:startDate/:state', updateBooking);

export default BookingRoutes;

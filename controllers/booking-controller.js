const BookingModel = require('../models/booking-model')
const MovieModel = require('../models/movie-model')
const UserModel = require('../models/user-model')
const mailService = require('../service/mail-service')

class BookingController {
	async create(req, res, next) {
		try {
			const { userId, movieId, date, time, seats, hall } = req.body

			const movie = await MovieModel.findById(movieId)
			const user = await UserModel.findById(userId)

			if (!movie || !user) {
				return res.status(404).json({ message: 'Movie or user not found' })
			}

			const requiredAge = parseInt(movie.rating)
			const birthDate = new Date(user.birthdate)
			const today = new Date()
			const age =
				today.getFullYear() -
				birthDate.getFullYear() -
				(today <
				new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
					? 1
					: 0)

			if (age < requiredAge) {
				return res.status(403).json({
					message: `This movie is rated ${movie.rating}. You must be at least ${requiredAge} years old.`,
				})
			}

			const existingBookings = await BookingModel.find({
				movieId,
				date,
				time,
				hall,
				'seats.row': { $in: seats.map(seat => seat.row) },
				'seats.seat': { $in: seats.map(seat => seat.seat) },
			})

			const takenSeats = existingBookings.flatMap(b => b.seats)

			const conflict = seats.some(seat =>
				takenSeats.some(t => t.row === seat.row && t.seat === seat.seat)
			)

			if (conflict) {
				return res
					.status(409)
					.json({ message: 'One or more selected seats are already taken' })
			}

			const booking = await BookingModel.create({
				user: user._id,
				movieId,
				date,
				time,
				hall,
				seats,
			})

			await mailService.sendBookingConfirmation(user.email, {
				title: movie.title,
				date,
				time,
				hall,
				seats,
				total: seats.reduce((sum, s) => sum + s.price, 0),
			})

			res.json(booking)
		} catch (e) {
			next(e)
		}
	}

	async getTakenSeats(req, res, next) {
		try {
			const { movieId, date, time, hall } = req.query
			const bookings = await BookingModel.find({
				movieId,
				date,
				time,
				hall,
			})
			const takenSeats = bookings.flatMap(b => b.seats)
			res.json(takenSeats)
		} catch (e) {
			next(e)
		}
	}
	async getUserBookings(req, res, next) {
		try {
			const { userId } = req.query
			if (!userId) return res.status(400).json({ message: 'Missing userId' })

			const bookings = await BookingModel.find({ user: userId }).populate(
				'movieId'
			)
			res.json(bookings)
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new BookingController()

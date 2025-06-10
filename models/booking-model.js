const { Schema, model } = require('mongoose')

const BookingSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	movieId: { type: Schema.Types.ObjectId, ref: 'Movie' },
	date: String,
	time: String,
	hall: String,
	seats: [
		{
			row: Number,
			seat: Number,
			type: { type: String, enum: ['vip', 'regular'] },
			price: Number,
		},
	],
})

module.exports = model('Booking', BookingSchema)

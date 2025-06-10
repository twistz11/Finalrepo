const { Schema, model } = require('mongoose')

const MovieSchema = new Schema({
	title: { type: String, required: true },
	imageUrl: { type: String, required: true },
	rating: { type: String, required: true },
	format: { type: String, enum: ['2D', '3D'], required: true },
	description: { type: String, default: '' },
})

module.exports = model('Movie', MovieSchema)

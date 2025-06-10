const Movie = require('../models/movie-model')

class MovieController {
	async getAllMovies(req, res, next) {
		try {
			const movies = await Movie.find()
			res.json(movies)
		} catch (e) {
			next(e)
		}
	}

	async getOneMovie(req, res, next) {
		try {
			const movie = await Movie.findById(req.params.id)
			if (!movie) return res.status(404).json({ message: 'Movie not found' })
			res.json(movie)
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new MovieController()

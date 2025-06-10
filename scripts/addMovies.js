require('dotenv').config()
const mongoose = require('mongoose')
const Movie = require('../models/movie-model')

const movies = [
	{
		title: 'Operation Fortune: Ruse de Guerre',
		imageUrl: '/1.jpg',
		rating: '16+',
		format: '3D',
		description:
			'An elite spy team must stop a billionaire arms broker before he sells dangerous technology.',
	},
	{
		title: 'Guy Ritchie’s The Covenant',
		imageUrl: '/2.jpg',
		rating: '16+',
		format: '2D',
		description:
			'A soldier and his interpreter fight to survive after a deadly ambush in Afghanistan.',
	},
	{
		title: 'Revolver',
		imageUrl: '/3.jpg',
		rating: '18+',
		format: '2D',
		description:
			'A complex psychological thriller exploring revenge, ego, and manipulation in the criminal world.',
	},
	{
		title: 'RocknRolla',
		imageUrl: '/4.jpg',
		rating: '18+',
		format: '2D',
		description:
			'A gangster comedy involving a stolen painting, a rock star, and London’s criminal underground.',
	},
	{
		title: 'The Fountain of Youth',
		imageUrl: '/5.jpg',
		rating: '12+',
		format: '3D',
		description:
			'An adventure fantasy about the search for eternal life and the sacrifices it demands.',
	},
	{
		title: 'Once Upon a Time in Hollywood',
		imageUrl: '/6.jpg',
		rating: '18+',
		format: '2D',
		description:
			'A faded TV actor and his stunt double navigate the changing film industry of 1969 Los Angeles.',
	},
	{
		title: 'Django Unchained',
		imageUrl: '/7.jpg',
		rating: '18+',
		format: '3D',
		description:
			'A freed slave teams up with a bounty hunter to rescue his wife from a brutal plantation owner.',
	},
	{
		title: 'Inglourious Basterds',
		imageUrl: '/8.jpg',
		rating: '18+',
		format: '2D',
		description:
			'A group of Jewish-American soldiers plan to assassinate Nazi leaders in occupied France.',
	},
	{
		title: 'The Hateful Eight',
		imageUrl: '/9.jpg',
		rating: '18+',
		format: '2D',
		description:
			'Strangers seek shelter in a cabin during a blizzard, hiding secrets and dangerous motives.',
	},
]

async function addMovies() {
	try {
		await mongoose.connect(process.env.DB_URL)
		await Movie.deleteMany({})
		await Movie.insertMany(movies)
		console.log(' Movies updated successfully!')
		process.exit()
	} catch (e) {
		console.error(' Error updating movies:', e)
		process.exit(1)
	}
}

addMovies()

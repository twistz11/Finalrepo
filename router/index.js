const Router = require('express').Router
const router = new Router()

const userController = require('../controllers/user-controller')
const movieController = require('../controllers/movie-controller')
const bookingController = require('../controllers/booking-controller')

const { body } = require('express-validator')
const authMiddleware = require('../middlewares/auth-middleware')

router.post(
	'/registration',
	body('email').isEmail().withMessage('Invalid email'),
	body('password')
		.isLength({ min: 3, max: 32 })
		.withMessage('Password must be 3–32 characters'),
	body('birthdate')
		.matches(/^\d{4}-\d{2}-\d{2}$/)
		.withMessage('Birthdate must be in format YYYY-MM-DD')
		.custom(value => {
			const date = new Date(value)
			if (isNaN(date.getTime())) throw new Error('Invalid birthdate')
			if (date > new Date())
				throw new Error('Birthdate cannot be in the future')
			return true
		}),
	userController.registration
)

router.post(
	'/login',
	body('email').isEmail().withMessage('Invalid email'),
	body('password').notEmpty().withMessage('Password is required'),
	userController.login
)

router.post('/logout', userController.logout)

router.get('/activate/:link', userController.activate)

router.get('/refresh', userController.refresh)

router.get('/users', authMiddleware, userController.getUsers)

router.post(
	'/update-birthdate',
	body('email').isEmail().withMessage('Invalid email'),
	body('birthdate')
		.matches(/^\d{4}-\d{2}-\d{2}$/)
		.withMessage('Birthdate must be in format YYYY-MM-DD')
		.custom(value => {
			const date = new Date(value)
			if (isNaN(date.getTime())) throw new Error('Invalid birthdate')
			if (date > new Date())
				throw new Error('Birthdate cannot be in the future')
			return true
		}),
	userController.updateBirthdate
)

router.post(
	'/change-password',
	body('email').isEmail().withMessage('Invalid email'),
	body('currentPassword').notEmpty().withMessage('Current password required'),
	body('newPassword')
		.isLength({ min: 3, max: 32 })
		.withMessage('New password must be 3–32 characters'),
	userController.changePassword
)

router.get('/movies', movieController.getAllMovies)
router.get('/movies/:id', movieController.getOneMovie)

router.post('/book', bookingController.create)
router.get('/bookings', bookingController.getTakenSeats)
router.post('/resend-activation', userController.resendActivation)
router.get('/my-bookings', bookingController.getUserBookings)

module.exports = router

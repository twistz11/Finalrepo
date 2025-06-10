const userService = require('../service/user-service')
const { validationResult } = require('express-validator')
const ApiError = require('../exceptions/api-error')
const UserModel = require('../models/user-model')
const mailService = require('../service/mail-service')

class UserController {
	async registration(req, res, next) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return next(ApiError.BadRequest('Validation error', errors.array()))
			}
			const { email, password, birthdate } = req.body
			const userData = await userService.registration(email, password, birthdate)

			res.cookie('refreshToken', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				secure: true,
				sameSite: 'None',
			})

			return res.json(userData)
		} catch (e) {
			next(e)
		}
	}

	async login(req, res, next) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return next(ApiError.BadRequest('Validation error', errors.array()))
			}
			const { email, password } = req.body
			const userData = await userService.login(email, password)

			res.cookie('refreshToken', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				secure: true,
				sameSite: 'None',
			})

			return res.json(userData)
		} catch (e) {
			next(e)
		}
	}

	async logout(req, res, next) {
		try {
			const { refreshToken } = req.cookies
			const token = await userService.logout(refreshToken)
			res.clearCookie('refreshToken')
			return res.json(token)
		} catch (e) {
			next(e)
		}
	}

	async activate(req, res, next) {
		try {
			const activationLink = req.params.link
			await userService.activate(activationLink)
			return res.redirect(process.env.CLIENT_URL)
		} catch (e) {
			next(e)
		}
	}

	async refresh(req, res, next) {
		try {
			const { refreshToken } = req.cookies
			const userData = await userService.refresh(refreshToken)

			res.cookie('refreshToken', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				secure: true,
				sameSite: 'None',
			})

			return res.json(userData)
		} catch (e) {
			next(e)
		}
	}

	async getUsers(req, res, next) {
		try {
			const users = await userService.getAllUsers()
			return res.json(users)
		} catch (e) {
			next(e)
		}
	}

	async updateBirthdate(req, res, next) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return next(ApiError.BadRequest('Validation error', errors.array()))
			}
			const { email, birthdate } = req.body
			await userService.updateBirthdate(email, birthdate)
			return res.json({ message: 'Birthdate updated successfully' })
		} catch (e) {
			next(e)
		}
	}

	async changePassword(req, res, next) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return next(ApiError.BadRequest('Validation error', errors.array()))
			}
			const { email, currentPassword, newPassword } = req.body
			await userService.changePassword(email, currentPassword, newPassword)
			return res.json({ message: 'Password updated successfully' })
		} catch (e) {
			next(e)
		}
	}

	async resendActivation(req, res, next) {
		try {
			const { email } = req.body
			const user = await UserModel.findOne({ email })
			if (!user) {
				return res.status(404).json({ message: 'User not found' })
			}
			if (user.isActivated) {
				return res.status(400).json({ message: 'Email already activated' })
			}
			await mailService.sendActivationMail(
				email,
				`${process.env.API_URL}/api/activate/${user.activationLink}`
			)
			return res.json({ message: 'Activation link resent' })
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new UserController()

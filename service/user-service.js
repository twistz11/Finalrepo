const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService {
	async registration(email, password, birthdate) {
		const candidate = await UserModel.findOne({ email })
		if (candidate) {
			throw ApiError.BadRequest(`User with email ${email} already exists`)
		}

		const hashPassword = await bcrypt.hash(password, 3)
		const activationLink = uuid.v4()

		const user = await UserModel.create({
			email,
			password: hashPassword,
			activationLink,
			birthdate,
		})

		const activationURL = `${process.env.API_URL}/api/activate/${activationLink}`
		await mailService.sendActivationMail(email, activationURL)

		const userDto = new UserDto(user)
		const tokens = tokenService.generateToken({ ...userDto })
		await tokenService.saveToken(userDto.id, tokens.refreshToken)

		return {
			...tokens,
			user: userDto,
		}
	}

	async activate(activationLink) {
		const user = await UserModel.findOne({ activationLink })
		if (!user) {
			throw ApiError.BadRequest('Invalid activation link')
		}
		user.isActivated = true
		await user.save()
	}

	async login(email, password) {
		const user = await UserModel.findOne({ email })
		if (!user) {
			throw ApiError.BadRequest('User with this email not found')
		}
		const isPassEquals = await bcrypt.compare(password, user.password)
		if (!isPassEquals) {
			throw ApiError.BadRequest('Incorrect password')
		}
		const userDto = new UserDto(user)
		const tokens = tokenService.generateToken({ ...userDto })
		await tokenService.saveToken(userDto.id, tokens.refreshToken)

		return {
			...tokens,
			user: userDto,
		}
	}

	async logout(refreshToken) {
		const token = await tokenService.removeToken(refreshToken)
		return token
	}

	async refresh(refreshToken) {
		if (!refreshToken) {
			throw ApiError.UnauthorizedError()
		}

		const userData = tokenService.validateRefreshToken(refreshToken)
		const tokenFromDb = await tokenService.findToken(refreshToken)

		if (!userData || !tokenFromDb) {
			throw ApiError.UnauthorizedError()
		}

		const user = await UserModel.findById(userData.id)
		const userDto = new UserDto(user)
		const tokens = tokenService.generateToken({ ...userDto })
		await tokenService.saveToken(userDto.id, tokens.refreshToken)

		return {
			...tokens,
			user: userDto,
		}
	}

	async getAllUsers() {
		const users = await UserModel.find()
		return users
	}

	async changePassword(email, currentPassword, newPassword) {
		const user = await UserModel.findOne({ email })
		if (!user) {
			throw ApiError.BadRequest('User not found')
		}

		const isPassValid = await bcrypt.compare(currentPassword, user.password)
		if (!isPassValid) {
			throw ApiError.BadRequest('Current password is incorrect')
		}

		if (newPassword.length < 3 || newPassword.length > 32) {
			throw ApiError.BadRequest('Password must be 3–32 characters long')
		}

		const hashed = await bcrypt.hash(newPassword, 3)
		user.password = hashed
		await user.save()
	}

	async updateBirthdate(email, birthdate) {
		const user = await UserModel.findOne({ email })
		if (!user) {
			throw ApiError.BadRequest('User not found')
		}

		const date = new Date(birthdate)
		if (isNaN(date.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
			throw ApiError.BadRequest('Invalid birthdate format')
		}

		if (date > new Date()) {
			throw ApiError.BadRequest('Birthdate cannot be in the future')
		}

		const minDate = new Date()
		minDate.setFullYear(minDate.getFullYear() - 10)
		if (date > minDate) {
			throw ApiError.BadRequest('You must be at least 10 years old')
		}

		user.birthdate = birthdate
		await user.save()
	}
	async resendActivation(email) {
		const user = await UserModel.findOne({ email })
		if (!user) throw ApiError.BadRequest('User not found')
		if (user.isActivated) throw ApiError.BadRequest('Account already activated')

		const activationURL = `${process.env.API_URL}/api/activate/${user.activationLink}`
		await mailService.sendActivationMail(email, activationURL)
	}
}

module.exports = new UserService()

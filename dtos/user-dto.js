module.exports = class UserDto {
	email
	id
	isActivated
	birthdate

	constructor(model) {
		this.email = model.email
		this.id = model._id
		this.isActivated = model.isActivated
		this.birthdate = model.birthdate
	}
}

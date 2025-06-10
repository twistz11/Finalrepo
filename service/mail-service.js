const nodemailer = require('nodemailer')

class MailService {
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASSWORD,
			},
			tls: {
				rejectUnauthorized: false,
			},
		})
	}

	async sendActivationMail(to, link) {
		await this.transporter.sendMail({
			from: process.env.SMTP_USER,
			to,
			subject: 'Activation link for' + process.env.API_URL,
			text: '',
			html: `
	<div>
		<h1>To activate your account, follow the link</h1>
		<a href="${link}">${link}</a>
	</div>
`,
		})
	}
	async sendBookingConfirmation(to, data) {
		const { title, date, time, hall, seats, total } = data

		const seatList = seats
			.map(s => `Row ${s.row}, Seat ${s.seat} (€${s.price})`)
			.join('<br>')

		await this.transporter.sendMail({
			from: process.env.SMTP_USER,
			to,
			subject: `🎟 Booking Confirmation — ${title}`,
			html: `
				<div style="font-family: sans-serif; color: #333;">
					<h2>Your ticket is booked!</h2>
					<p><strong>Movie:</strong> ${title}</p>
					<p><strong>Date:</strong> ${date}</p>
					<p><strong>Time:</strong> ${time}</p>
					<p><strong>Hall:</strong> ${hall}</p>
					<p><strong>Seats:</strong><br>${seatList}</p>
					<p><strong>Total:</strong> €${total}</p>
					<hr />
					<p>Enjoy your movie!</p>
				</div>
			`,
		})
	}
}

module.exports = new MailService()

const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const customResponse = require('../utils/customResponse');
const { SUCCESS, CREATED, BAD_REQUEST } = require('../utils/responseManager');

const register = catchAsync(async (req, res) => {
	const user = await userService.createUser(req.body);

	if (user.code !== CREATED.code) {
		return customResponse(res, user);
	}

	const tokens = await tokenService.generateAuthTokens(user.data);

	const response = {
		code: SUCCESS.code,
		message: 'Registered successfully',
		data: {
			user: user.data,
			tokens,
		},
	};

	return customResponse(res, response);
});

const login = catchAsync(async (req, res) => {
	const { email, password } = req.body;

	const user = await authService.loginUserWithEmailAndPassword(email, password);

	if (user.code !== SUCCESS.code) {
		return customResponse(res, user);
	}

	const tokens = await tokenService.generateAuthTokens(user.data);

	const response = {
		code: SUCCESS.code,
		message: 'Logged in successfully',
		data: {
			user: user.data,
			tokens,
		},
	};

	return customResponse(res, response);
});

const logout = catchAsync(async (req, res) => {
	const response = await authService.logout(req.body.refreshToken);
	return customResponse(res, response);
});

const refreshTokens = catchAsync(async (req, res) => {
	const response = await authService.refreshAuth(req.body.refreshToken);
	return customResponse(res, response);
});

const forgotPassword = catchAsync(async (req, res) => {
	const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
	await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
	const response = {
		code: SUCCESS.code,
		message: 'Email sent',
	};
	return customResponse(res, response);
});

const resetPassword = catchAsync(async (req, res) => {
	const response = await authService.resetPassword(req.query.token, req.body.password);
	return customResponse(res, response);
});

const sendVerificationEmail = catchAsync(async (req, res) => {
	let response;
	if (req.user.isEmailVerified) {
		response = {
			code: BAD_REQUEST.code,
			message: 'Email already verified',
		};
	} else {
		const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
		await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
		response = {
			code: SUCCESS.code,
			message: 'Verification email sent',
		};
	}
	return customResponse(res, response);
});

const verifyEmail = catchAsync(async (req, res) => {
	const response = await authService.verifyEmail(req.query.token);
	return customResponse(res, response);
});

module.exports = {
	register,
	login,
	logout,
	refreshTokens,
	forgotPassword,
	resetPassword,
	sendVerificationEmail,
	verifyEmail,
};

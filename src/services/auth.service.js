const tokenService = require('./token.service');
const userService = require('./user.service');
const { Token, User } = require('../models');
const { tokenTypes } = require('../config/tokens');
const { UNAUTHORIZED, NOT_FOUND, SUCCESS } = require('../utils/responseManager');

const loginUserWithEmailAndPassword = async (email, password) => {
	let user = await userService.getUserByEmail(email);
	user = user.data;
	if (!user || !(await user.isPasswordMatch(password))) {
		return {
			code: UNAUTHORIZED.code,
			message: 'Incorrect email or password',
		};
	}
	return {
		code: SUCCESS.code,
		message: 'Logged in',
		data: user,
	};
};

const logout = async (refreshToken) => {
	const refreshTokenDoc = await Token.findOne({
		token: refreshToken,
		type: tokenTypes.REFRESH,
		blacklisted: false,
	});

	if (!refreshTokenDoc) {
		return {
			code: NOT_FOUND.code,
			message: 'Refresh token not found',
		};
	}

	await refreshTokenDoc.remove();

	return {
		code: SUCCESS.code,
		message: 'Logged out',
	};
};

const refreshAuth = async (refreshToken) => {
	try {
		const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
		const user = await User.findById(refreshTokenDoc.user);
		if (!user) {
			return {
				code: NOT_FOUND.code,
				message: 'User not found',
			};
		}
		await refreshTokenDoc.remove();
		const tokens = await tokenService.generateAuthTokens(user);
		return {
			code: SUCCESS.code,
			message: 'Tokens refreshed',
			data: tokens,
		};
	} catch (error) {
		return {
			code: UNAUTHORIZED.code,
			message: 'Please authenticate',
		};
	}
};

const resetPassword = async (resetPasswordToken, newPassword) => {
	try {
		const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
		const user = await User.findById(resetPasswordTokenDoc.user);
		if (!user) {
			return {
				code: NOT_FOUND.code,
				message: 'User not found',
			};
		}
		await userService.updateUserById(user.id, { password: newPassword });
		await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
		return {
			code: SUCCESS.code,
			message: 'Password reset',
		};
	} catch (error) {
		return {
			code: UNAUTHORIZED.code,
			message: 'Password reset failed',
		};
	}
};

const verifyEmail = async (verifyEmailToken) => {
	try {
		const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
		const user = await User.findById(verifyEmailTokenDoc.user);
		if (!user) {
			return {
				code: NOT_FOUND.code,
				message: 'User not found',
			};
		}
		await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
		await userService.updateUserById(user.id, { isEmailVerified: true });
		return {
			code: SUCCESS.code,
			message: 'Email verified',
		};
	} catch (error) {
		return {
			code: UNAUTHORIZED.code,
			message: 'Email verification failed',
		};
	}
};

module.exports = {
	loginUserWithEmailAndPassword,
	logout,
	refreshAuth,
	resetPassword,
	verifyEmail,
};

const { User } = require('../models');
const { CREATED, SUCCESS, NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR } = require('../utils/responseManager');

const createUser = async (userBody) => {
	if (await User.isEmailTaken(userBody.email)) {
		return {
			code: BAD_REQUEST.code,
			message: 'Email already taken',
		};
	}

	const user = await User.create(userBody);

	if (!user) {
		return {
			code: INTERNAL_SERVER_ERROR.code,
			message: 'Failed to create user',
		};
	}

	return {
		code: CREATED.code,
		message: 'User created',
		data: user,
	};
};

const queryUsers = async (filter, options) => {
	const users = await User.paginate(filter, options);

	if (!users.results.length) {
		return {
			message: 'Users not found',
			code: NOT_FOUND.code,
		};
	}

	return {
		code: SUCCESS.code,
		message: 'Users retrieved',
		data: users,
	};
};

const getUserById = async (id) => {
	const user = await User.findById(id);

	if (!user) {
		return {
			code: NOT_FOUND.code,
			message: 'User not found',
		};
	}

	return {
		code: SUCCESS.code,
		message: 'User retrieved',
		data: user,
	};
};

const getUserByEmail = async (email) => {
	const user = await User.findOne({ email });

	if (!user) {
		return {
			code: NOT_FOUND.code,
			message: 'User not found',
		};
	}

	return {
		code: SUCCESS.code,
		message: 'User retrieved',
		data: user,
	};
};

const updateUserById = async (userId, updateBody) => {
	const user = await User.findById(userId);

	if (!user) {
		return {
			code: NOT_FOUND.code,
			message: 'User not found',
		};
	}

	if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
		return {
			code: BAD_REQUEST.code,
			message: 'Email already taken',
		};
	}

	Object.assign(user, updateBody);

	await user.save();

	return {
		code: SUCCESS.code,
		message: 'User updated',
		data: user,
	};
};

const deleteUserById = async (userId) => {
	const user = await User.findById(userId);

	if (!user) {
		return {
			code: NOT_FOUND.code,
			message: 'User not found',
		};
	}

	await user.remove();

	return {
		code: SUCCESS.code,
		message: 'User deleted',
		data: user,
	};
};

module.exports = {
	createUser,
	queryUsers,
	getUserById,
	getUserByEmail,
	updateUserById,
	deleteUserById,
};

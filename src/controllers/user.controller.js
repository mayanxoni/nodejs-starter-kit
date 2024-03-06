const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const customResponse = require('../utils/customResponse');

const createUser = catchAsync(async (req, res) => {
	const response = await userService.createUser(req.body);
	return customResponse(res, response);
});

const getUsers = catchAsync(async (req, res) => {
	const filter = pick(req.query, ['name', 'role']);
	const options = pick(req.query, ['sortBy', 'limit', 'page']);
	const response = await userService.queryUsers(filter, options);
	return customResponse(res, response);
});

const getUser = catchAsync(async (req, res) => {
	const response = await userService.getUserById(req.params.userId);
	return customResponse(res, response);
});

const updateUser = catchAsync(async (req, res) => {
	const response = await userService.updateUserById(req.params.userId, req.body);
	return customResponse(res, response);
});

const deleteUser = catchAsync(async (req, res) => {
	const response = await userService.deleteUserById(req.params.userId);
	return customResponse(res, response);
});

module.exports = {
	createUser,
	getUsers,
	getUser,
	updateUser,
	deleteUser,
};

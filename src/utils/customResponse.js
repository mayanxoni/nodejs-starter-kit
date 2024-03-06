const customResponse = (res, response) => {
	const { code, message, data } = response;
	return res.status(code).json({
		code,
		message,
		data: data || {},
	});
};

module.exports = customResponse;

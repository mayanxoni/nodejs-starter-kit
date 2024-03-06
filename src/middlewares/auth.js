const passport = require('passport');
const { roleRights } = require('../config/roles');
const customResponse = require('../utils/customResponse');
const { UNAUTHORIZED, FORBIDDEN, INVALID_TOKEN } = require('../utils/responseManager');

const verifyCallback = (req, resolve, reject, requiredRights, res) => async (err, user, info) => {
	if (err || info || !user) {
		if (info && info.message === 'jwt expired') {
			return customResponse(res, {
				code: INVALID_TOKEN.code,
				message: INVALID_TOKEN.message,
			});
		}
		return customResponse(res, {
			code: UNAUTHORIZED.code,
			message: UNAUTHORIZED.message,
		});
	}
	req.user = user;

	if (requiredRights.length) {
		const userRights = roleRights.get(user.role);
		const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
		if (!hasRequiredRights && req.params.userId !== user.id) {
			return customResponse(res, {
				code: FORBIDDEN.code,
				message: FORBIDDEN.message,
			});
		}
	}

	resolve();
};

const auth =
	(...requiredRights) =>
	async (req, res, next) =>
		new Promise((resolve, reject) => {
			passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights, res))(
				req,
				res,
				next
			);
		})
			.then(() => next())
			.catch((err) => next(err));

module.exports = auth;

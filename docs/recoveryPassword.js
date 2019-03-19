/**
 * @api {post} /users Reset password with recovery token
 * @apiName RecoveryPassword
 * @apiGroup User
 *
 * @apiHeader {String} X-SLSMU-SITE Site identification.
 *
 * @apiParam {String} token Token.
 * @apiParam {String} password New password.
 * @apiParam {String} type Api type (recovery-password).
 *
 * @apiExample {json} Example call
 *     {
 *       "token": "...",
 *       "password": "...",
 *       "type": "recovery-password",
 *     }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "true"
 *     }
 */

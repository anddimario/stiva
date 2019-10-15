/**
 * @api {post} /users Get password recovery token
 * @apiName RecoveryToken
 * @apiDescription Send an email with reset password url (based on token)
 * @apiGroup User
 *
 * @apiHeader {String} x-slsmu-site Site identification.
 *
 * @apiParam {String} email Email.
 * @apiParam {String} type Api type (recovery-token).
 *
 * @apiExample {json} Example call
 *     {
 *       "email": "email@example.com",
 *       "type": "recovery-token",
 *     }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "true"
 *     }
 */

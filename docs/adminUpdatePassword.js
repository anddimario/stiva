/**
 * @api {post} /users Admin update password
 * @apiName AdminUpdatePassword
 * @apiGroup User
 *
 * @apiHeader {String} X-SLSMU-SITE Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} email Email.
 * @apiParam {String} type Api type (update-password).
 * @apiParam {String} newpassword New password
 *
 * @apiExample {json} Example call
 *     {
 *       "email": "email@example.com",
 *       "newpassword": "newpassword",
 *       "type": "update-password",
 *     }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": true
 *     }
 */

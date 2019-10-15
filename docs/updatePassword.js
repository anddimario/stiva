/**
 * @api {post} /users Update password
 * @apiName UpdatePassword
 * @apiGroup User
 *
 * @apiHeader {String} x-slsmu-site Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} type Api type (update-password).
 * @apiParam {String} newpassword New password
 *
 * @apiExample {json} Example call
 *     {
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

/**
 * @api {post} /users Admin update user
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiHeader {String} x-slsmu-site Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} type Api type (update).
 * @apiParam {String} fullname Full name (this params is based on your config, you can have more and different params).
 *
 * @apiExample {json} Example call
 *     {
 *       "fullname": "test",
 *       "type": "update",
 *     }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": true
 *     }
 */

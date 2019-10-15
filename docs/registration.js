/**
 * @api {post} /users Registration
 * @apiName Registration
 * @apiGroup User
 *
 * @apiHeader {String} x-slsmu-site Site identification.
 *
 * @apiParam {String} email Email.
 * @apiParam {String} password Password.
 * @apiParam {String} type Api type (registration).
 *
 * @apiExample {json} Example call
 *     {
 *       "email": "email@example.com",
 *       "password": "mypassword",
 *       "type": "registration",
 *     }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": true
 *     }
 */

/**
 * @api {post} /users Admin add user
 * @apiName AdminAddUser
 * @apiGroup User
 *
 * @apiHeader {String} X-SLSMU-SITE Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} email Email.
 * @apiParam {String} password Password.
 * @apiParam {String} userRole User role.
 * @apiParam {String} type Api type (add).
 *
 * @apiExample {json} Example call
 *     {
 *       "email": "email@example.com",
 *       "password": "mypassword",
 *       "userRole": "user",
 *       "type": "add",
 *     }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": true
 *     }
 */

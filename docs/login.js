/**
 * @api {post} /users Login
 * @apiName Login
 * @apiGroup User
 *
 * @apiHeader {String} x-slsmu-site Site identification.
 *
 * @apiParam {String} email Email.
 * @apiParam {String} password Password.
 * @apiParam {String} type Api type (login).
 *
 * @apiExample {curl} Example call
 *      curl http://localhost:3000/users --data-binary '{"email":"admin@example.com","password":"password","type":"login"}'  -H "x-slsmu-site: localhost" --compressed
 *
 * @apiExample {json} Example call
 *     {
 *       "email": "email@example.com",
 *       "password": "mypassword",
 *       "type": "login",
 *     }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "...."
 *     }
 */

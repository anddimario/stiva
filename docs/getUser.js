/**
 * @api {get} /users Get user (owner informations)
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiHeader {String} x-slsmu-site Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} type Api type (get).
 *
 * @apiExample {curl} Example call
 *     curl -H "Authorization: Bearer MY_TOKEN" -H "x-slsmu-site: localhost" "http://localhost:3000/users?type=get"
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "body": {}
 *     }
 */

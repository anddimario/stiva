/**
 * @api {get} /users Get user (owner informations)
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiHeader {String} X-SLSMU-SITE Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} type Api type (get).
 *
 * @apiExample {curl} Example call
 *     curl -H "Authorization: Bearer MY_TOKEN" -H "X-SLSMU-SITE: localhost" "http://localhost:3000/users?type=get"
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "body": {}
 *     }
 */

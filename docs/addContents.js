/**
 * @api {post} /contents Add content
 * @apiName AddContent
 * @apiGroup Content
 *
 * @apiHeader {String} x-slsmu-site Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} title This is an example value based on config.
 * @apiParam {String} contentType Content type.
 * @apiParam {String} type Api type (add).
 * @apiParam {Bool} [private] If content is private (owner only).
 * @apiParam {allowedUsers} [allowedUsers] List of comma separeted allowed users.
 * @apiParam {allowedRoles} [allowedRoles] List of comma separeted allowed roles.
 *
 * @apiExample {json} Example call
 *     {
 *       "title": "test title",
 *       "contentType": "post",
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

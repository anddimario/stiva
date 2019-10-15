/**
 * @api {post} /contents Update content
 * @apiName UpdateContent
 * @apiGroup Content
 *
 * @apiHeader {String} x-slsmu-site Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} id Content id.
 * @apiParam {String} title This is an example value based on config.
 * @apiParam {String} contentType Content type.
 * @apiParam {String} type Api type (update).
 * @apiParam {Bool} [private] If content is private (owner only).
 * @apiParam {allowedUsers} [allowedUsers] List of comma separeted allowed users.
 * @apiParam {allowedRoles} [allowedRoles] List of comma separeted allowed roles.
 *
 * @apiExample {json} Example call
 *     {
 *       "id": "my-content-id",
 *       "title": "updated test title",
 *       "contentType": "post",
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

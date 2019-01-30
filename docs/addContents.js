/**
 * @api {post} /contents Add content
 * @apiName AddContent
 * @apiGroup Content
 *
 * @apiHeader {String} X-SLSMU-SITE Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} title This is an example value based on config.
 * @apiParam {String} contentType Content type.
 * @apiParam {String} type Api type (add).
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

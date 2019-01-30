/**
 * @api {get} /contents Delete contet
 * @apiName DeleteContent
 * @apiGroup Content
 *
 * @apiHeader {String} X-SLSMU-SITE Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} id Content id.
 * @apiParam {String} contentType Content type.
 * @apiParam {String} type Api type (delete).
 *
 * @apiExample {curl} Example call
 *     curl -H "Authorization: Bearer MY_TOKEN" -H "X-SLSMU-SITE: localhost" "http://localhost:3000/contents?id=content-id&type=delete&contentType=post"
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": true
 *     }
 */

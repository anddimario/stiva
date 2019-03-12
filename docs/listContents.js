/**
 * @api {get} /contents List contet
 * @apiName ListContent
 * @apiGroup Content
 *
 * @apiHeader {String} X-SLSMU-SITE Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} contentType Content type.
 * @apiParam {String} type Api type (get).
 * @apiParam {String} [next] Key used to get paginated value.
 *
 * @apiExample {curl} Example call
 *     curl -H "Authorization: Bearer MY_TOKEN" -H "X-SLSMU-SITE: localhost" "http://localhost:3000/contents?type=get&contentType=post"
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "body": []
 *     }
 */

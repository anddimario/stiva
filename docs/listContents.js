/**
 * @api {get} /contents List contents
 * @apiName ListContent
 * @apiGroup Content
 *
 * @apiHeader {String} X-SLSMU-SITE Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} type Api type (list).
 * @apiParam {String} contentType Content type for table identification.
 * @apiParam {String} [next] Key used to get paginated value.
 * @apiParam {String} [filters] Dynamodb filter expression (comma separated filters like: 'title = test,price < 10' NOTE: You must use encodeURIComponent to encode your filter).
 * @apiParam {Boolean} [private] If true, get only private contents.
 *
 * @apiExample {curl} Example call
 *     curl -H "Authorization: Bearer MY_TOKEN" -H "X-SLSMU-SITE: localhost" "http://localhost:3000/contents?type=list&contentType=post"
 *
 * @apiExample {curl} Example call
 *     curl -H "Authorization: Bearer MY_TOKEN" -H "X-SLSMU-SITE: localhost" "http://localhost:3000/contents?type=list&contentType=post&filters=title%20%3D%20test"
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "body": []
 *     }
 */

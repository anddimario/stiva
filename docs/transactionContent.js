/**
 * @api {post} /contents Transaction content
 * @apiName TransactionContent
 * @apiGroup Content
 *
 * @apiHeader {String} x-slsmu-site Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {Object} items Transaction items.
 * @apiParam {String} type Api type (transaction).
 *
 * @apiExample {json} Example call
 *     {
 *       "items": {},
 *       "type": "transaction",
 *     }
 *
 * @apiExample {curl} Example call
 *     curl -H "Authorization: Bearer MY_TOKEN" -H "x-slsmu-site: localhost" "http://localhost:3000/contents" -XPOST -d '{"type":"transaction","items":{"contents":{"id":"128300c0-7340-4286-a72c-44dd770642b3","values":{":title":"example",":contentText":"new value"}}}}' --compressed
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": true
 *     }
 */

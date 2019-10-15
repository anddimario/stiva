/**
 * @api {get} /uploads Delete upload
 * @apiName DeleteUploads
 * @apiGroup Upload
 *
 * @apiHeader {String} x-slsmu-site Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} key S3 object key.
 * @apiParam {String} type Api type (delete).
 *
 * @apiExample {curl} Example call
 *     curl -H "Authorization: Bearer MY_TOKEN" -H "x-slsmu-site: localhost" "http://localhost:3000/contents?key=my-file-key&type=delete"
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": true
 *     }
 */

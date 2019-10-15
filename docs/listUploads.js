/**
 * @api {get} /uploads List uploads
 * @apiName ListUploads
 * @apiGroup Upload
 *
 * @apiHeader {String} x-slsmu-site Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} type Api type (list).
 *
 * @apiExample {curl} Example call
 *     curl -H "Authorization: Bearer MY_TOKEN" -H "x-slsmu-site: localhost" "http://localhost:3000/uploads?type=list"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "files": {
 *         .. // Other useful informations from s3
 *         Contents: []
 *       }
 *     }
 */

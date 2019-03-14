/**
 * @api {post} /uploads Upload file
 * @apiName Upload
 * @apiGroup Uplod
 *
 * @apiHeader {String} X-SLSMU-SITE Site identification.
 * @apiHeader {String} Authorization Users token.
 *
 * @apiParam {String} ket File name in bucket.
 * @apiParam {String} contentType Content type(mime.
 * @apiParam {String} file Base64 file encoded.
 *
 * @apiExample {json} Example call
 *     {
 *       "key": "myfile.jpg",
 *       "contentType": "image/jpg",
 *       "file": "...",
 *     }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": true
 *     }
 */

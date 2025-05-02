using Amazon.S3;
using Amazon.S3.Model;
using EventManagementWebAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using EventManagementWebAPI.Models;
using Amazon.Runtime;
using Amazon.SecurityToken.Model;
using Amazon.SecurityToken;

namespace EventManagementWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        private readonly IAmazonS3 _s3Client;
        private readonly IOptions<S3Settings> _s3Settings;

        public ImageController(IAmazonS3 s3Client, IOptions<S3Settings> s3Settings)
        {
            _s3Client = s3Client;
            _s3Settings = s3Settings;
        }

        [HttpPost("presigned")]
        public IActionResult GetPresignedUrlForUpload([FromBody] PresignedUrlRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.FileName) || string.IsNullOrEmpty(request.ContentType))
                {
                    return BadRequest("FileName and ContentType are required.");
                }

                var key = Guid.NewGuid().ToString();
                var s3Request = new GetPreSignedUrlRequest
                {
                    BucketName = _s3Settings.Value.BucketName,
                    Key = key,
                    Verb = HttpVerb.PUT,
                    Expires = DateTime.UtcNow.AddMinutes(10),
                    ContentType = request.ContentType,
                    Metadata =
                    {
                        ["file-name"] = request.FileName 
                    }
                };
                var url = _s3Client.GetPreSignedURL(s3Request);
                return Ok(new { key, url });
            }
            catch (Exception e)
            {
                return BadRequest($"Error getting presigned URL: {e.Message}");
            }
        }

        [HttpGet("{key}/presigned")]
        public IActionResult GetPresignedUrl(string key)
        {
            try
            {
                var request = new GetPreSignedUrlRequest
                {
                    BucketName = _s3Settings.Value.BucketName,
                    Key = key,
                    Verb = HttpVerb.GET,
                    Expires = DateTime.UtcNow.AddMinutes(10)
                };
                var url = _s3Client.GetPreSignedURL(request);
                return Ok(new { key, url });
            }
            catch (AmazonS3Exception e)
            {
                return BadRequest($"Error getting presigned URL: {e.Message}");
            }
        }

        [HttpDelete("{key}")]
        public async Task<string> DeleteImageAsync(string key)
        {
            var deleteRequest = new DeleteObjectRequest
            {
                BucketName = _s3Settings.Value.BucketName,
                Key = key
            };

            var result = await _s3Client.DeleteObjectAsync(deleteRequest);
            return "Image deleted successfully";
        }

    }
}

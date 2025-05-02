namespace EventManagementWebAPI.Models
{
    public class PresignedUrlRequest
    {
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
    }
}

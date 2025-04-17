namespace EventManagementWebAPI.Services
{
    public class LoginResponse
    {
        public bool IsAuthenticated { get; set; } = false;
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; internal set; } = string.Empty;
    }
}

    namespace EventManagementWebAPI.Services
    {
        public class LoginResponse
        {
            public bool IsAuthenticated { get; set; } = false;
            public string? Token { get; set; }
            public string? RefreshToken { get; set; }
        }
    }

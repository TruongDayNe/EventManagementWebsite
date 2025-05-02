namespace EventManagementWebAPI.Services
{
    public class CreateEventResult
    {
        public bool Succeeded { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}

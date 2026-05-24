namespace DecibelsWeb.Services
{
    public interface IStorageService
    {
        Task<string> UploadFileAsync(IFormFile file, string containerName, string folderPath = null);
        Task DeleteFileAsync(string imageUrl, string containerName);
    }
}

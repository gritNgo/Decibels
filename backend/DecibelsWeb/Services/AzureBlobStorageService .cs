using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs;

namespace DecibelsWeb.Services
{
    public class AzureBlobStorageService : IStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly IConfiguration _configuration;

        public AzureBlobStorageService(IConfiguration configuration)
        {
            _configuration = configuration;
            string connectionString = _configuration.GetConnectionString("AzureStorage"); // creates its own BlobServiceClient instance
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        public async Task<string> UploadFileAsync(IFormFile file, string containerName, string folderPath = null)
        {
            if (file == null || file.Length == 0)
            {
                return null;
            }

            BlobContainerClient containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob); // Ensure the container exists and is publicly accessible for images

            string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            string blobName = string.IsNullOrEmpty(folderPath) ? fileName : $"{folderPath}/{fileName}";

            BlobClient blobClient = containerClient.GetBlobClient(blobName);

            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
            }

            return blobClient.Uri.ToString(); // Return the full URL of the uploaded blob
        }

        public async Task DeleteFileAsync(string imageUrl, string containerName)
        {
            if (string.IsNullOrEmpty(imageUrl))
            {
                return;
            }

            try
            {
                Uri uri = new Uri(imageUrl);
                string blobPath = uri.AbsolutePath.Substring(uri.AbsolutePath.IndexOf($"/{containerName}/") + containerName.Length + 2); // Extracts "images/product/guid.ext"

                BlobContainerClient containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
                BlobClient blobClient = containerClient.GetBlobClient(blobPath);
                await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting blob: {ex.Message}");
            }
        }
    }
}

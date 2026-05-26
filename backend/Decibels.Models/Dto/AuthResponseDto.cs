using System.ComponentModel.DataAnnotations;

namespace Decibels.Models.Dto;

public class AuthResponseDto
{
    public bool IsAuthSuccessful { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
}
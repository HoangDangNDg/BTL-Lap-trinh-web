using dotnet_backend.Common;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;

namespace dotnet_backend.Controllers;

[ApiController]
[Route("api/v1/localization")]
public class LocalizationController : ControllerBase
{
    private readonly ILocalizationService _localizer;

    public LocalizationController(ILocalizationService localizer)
    {
        _localizer = localizer;
    }

    [HttpGet("cultures")]
    public IActionResult GetSupportedCultures()
    {
        var result = new
        {
            CurrentCulture = _localizer.CurrentCulture,
            SupportedCultures = _localizer.SupportedCultures,
            Translations = _localizer.GetAllStrings()
        };

        return Ok(ApiResponse<object>.Ok(result, _localizer["Common_Success"]));
    }

    [HttpPost("set-culture")]
    public IActionResult SetCulture([FromQuery] string culture)
    {
        if (!_localizer.SupportedCultures.Contains(culture, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(ApiResponse<object>.Fail(_localizer["Common_BadRequest"], 400));
        }

        Response.Cookies.Append(
            CookieRequestCultureProvider.DefaultCookieName,
            CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
            new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddYears(1),
                IsEssential = true,
                SameSite = SameSiteMode.Lax
            }
        );

        return Ok(ApiResponse<object>.Ok(new { SelectedCulture = culture }, _localizer["Common_Success"]));
    }
}

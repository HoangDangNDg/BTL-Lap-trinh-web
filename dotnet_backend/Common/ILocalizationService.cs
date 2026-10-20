namespace dotnet_backend.Common;

public interface ILocalizationService
{
    string CurrentCulture { get; }
    IReadOnlyList<string> SupportedCultures { get; }
    string Get(string key, params object[] args);
    string this[string key] { get; }
    string this[string key, params object[] args] { get; }
    IDictionary<string, string> GetAllStrings();
}

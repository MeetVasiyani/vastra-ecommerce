# Security Configuration Setup

## Critical Action Required

Three live secrets were exposed in git. **You must:**
1. ✅ Remove credentials from appsettings.json (DONE)
2. ⚠️ **IMMEDIATELY revoke these credentials:**
   - Gmail app password: `qhlj xery cbcx cnhw`
   - Razorpay key secret: `5NpGUYs0muv651vsx9H2e5FI`
   - JWT signing key: `Zzkr5kTRTFy96NsKRr1amvohbfVFUYv3`
3. Generate new credentials to replace them

---

## Local Development: .NET User Secrets

### Setup User Secrets (One-time)

1. **Open PowerShell in the project directory** (`vastra-ecommerce/` folder):
   ```powershell
   cd .\vastra-ecommerce\
   ```

2. **Initialize User Secrets for the project:**
   ```powershell
   dotnet user-secrets init
   ```
   This creates a `secrets.json` file in `%APPDATA%\Microsoft\UserSecrets\<project-guid>\secrets.json` (Windows)

### Configure Secrets for Local Development

Set each secret using:
```powershell
dotnet user-secrets set "Jwt:Key" "your-new-jwt-signing-key-here"
dotnet user-secrets set "EmailSettings:Username" "your-email@gmail.com"
dotnet user-secrets set "EmailSettings:Password" "your-new-gmail-app-password"
dotnet user-secrets set "Razorpay:KeyId" "your-new-razorpay-key-id"
dotnet user-secrets set "Razorpay:KeySecret" "your-new-razorpay-key-secret"
```

### View Secrets
```powershell
dotnet user-secrets list
```

### Remove a Secret
```powershell
dotnet user-secrets remove "Jwt:Key"
```

---

## Production: Environment Variables

Deploy using one of these approaches:

### Option 1: GitHub Actions / CI/CD
Add secrets to GitHub Settings → Secrets and Variables → Actions, then reference in your workflow:
```yaml
env:
  JWT_SIGNING_KEY: ${{ secrets.JWT_SIGNING_KEY }}
  EMAIL_USERNAME: ${{ secrets.EMAIL_USERNAME }}
  EMAIL_PASSWORD: ${{ secrets.EMAIL_PASSWORD }}
  RAZORPAY_KEY_ID: ${{ secrets.RAZORPAY_KEY_ID }}
  RAZORPAY_KEY_SECRET: ${{ secrets.RAZORPAY_KEY_SECRET }}
```

### Option 2: Azure Key Vault (Recommended for Production)
Configure Key Vault in Azure and update `Program.cs`:
```csharp
var keyVaultEndpoint = new Uri(Environment.GetEnvironmentVariable("KEYVAULT_ENDPOINT")!);
var credential = new DefaultAzureCredential();
config.AddAzureKeyVault(keyVaultEndpoint, credential);
```

### Option 3: Docker Secrets / Environment Variables
Pass secrets when deploying the container:
```bash
docker run -e JWT_SIGNING_KEY="value" -e EMAIL_PASSWORD="value" ...
```

---

## Current Configuration

[appsettings.json](appsettings.json) now uses environment variable placeholders:
- `${JWT_SIGNING_KEY}`
- `${EMAIL_USERNAME}`
- `${EMAIL_PASSWORD}`
- `${RAZORPAY_KEY_ID}`
- `${RAZORPAY_KEY_SECRET}`

### How It Works

ASP.NET Core reads configuration in this order:
1. **appsettings.json** (base)
2. **appsettings.{Environment}.json** (environment-specific)
3. **Environment variables** (highest priority - overrides all)
4. **.NET User Secrets** (local dev only, via `dotnet user-secrets`)

When `${VAR_NAME}` syntax is used, you must provide values via User Secrets or environment variables.

---

## Verification

### Local Testing
```powershell
# Verify User Secrets are loaded
dotnet user-secrets list

# Run the app
dotnet run
```

Check logs confirm no `null` reference exceptions for Jwt:Key or email/Razorpay settings.

### Git Verification
Confirm files are no longer tracked:
```bash
git status
git log --all -- appsettings.json  # Should show historical commits only
```

---

## Files Modified

- ✅ [appsettings.json](appsettings.json) - Removed live credentials
- ✅ [.gitignore](.gitignore) - Added secret files to exclusion list
- ✅ No changes needed to Program.cs (already reads from configuration)

---

## References

- [.NET User Secrets Documentation](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets)
- [Azure Key Vault Configuration Provider](https://learn.microsoft.com/en-us/azure/key-vault/general/tutorial-net-create-vault-azure-portal)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

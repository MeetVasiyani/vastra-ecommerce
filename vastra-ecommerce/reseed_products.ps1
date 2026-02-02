$baseUrl = "http://localhost:5055"
$loginUrl = "$baseUrl/api/Auth/login"
$productUrl = "$baseUrl/api/Product"
$inputFile = "d:\vastra-ecommerce\vastra-ecommerce\product_data_swagger.md"

# 1. Authenticate
Write-Host "Authenticating..."
$body = @{
    email = "admin@vastra.com"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $body -ContentType "application/json"
    $token = $response.token
    Write-Host "Authentication Successful."
} catch {
    Write-Error "Authentication Failed: $_"
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# 2. Delete Existing Products
Write-Host "Fetching existing products..."
$deleteMore = $true
$loopSafety = 0

while ($deleteMore -and $loopSafety -lt 20) {
    # Fetch batch of 20 (default page size is fine, we loop until empty)
    try {
        $allProducts = Invoke-RestMethod -Uri "$baseUrl/api/Product?page=1&pageSize=100" -Method Get -Headers $headers
        $items = $allProducts.items
        $count = $items.Count
        
        if ($count -gt 0) {
            Write-Host "Found $count existing products. Deleting batch..."
            foreach ($item in $items) {
                $id = $item.id
                try {
                    Invoke-RestMethod -Uri "$baseUrl/api/Product/$id" -Method Delete -Headers $headers | Out-Null
                    Write-Host "." -NoNewline
                } catch {
                    Write-Host "!" -NoNewline -ForegroundColor Yellow
                }
            }
            Write-Host " Batch done."
            $loopSafety++
        } else {
            Write-Host "No more products found."
            $deleteMore = $false
        }
    } catch {
        Write-Error "Failed to fetch/delete products. Exception: $_"
        $deleteMore = $false
    }
}

# 3. Seed New Data
$content = Get-Content $inputFile -Raw
$matches = [regex]::Matches($content, '(?s)```json(.*?)```')

Write-Host "Seeding fresh data..."
$success = 0
$failed = 0

foreach ($match in $matches) {
    try {
        $jsonString = $match.Groups[1].Value.Trim()
        if ([string]::IsNullOrWhiteSpace($jsonString)) { continue }
        
        $productObj = $jsonString | ConvertFrom-Json
        $productJson = $productObj | ConvertTo-Json -Depth 10 -Compress
        
        Invoke-RestMethod -Uri $productUrl -Method Post -Body $productJson -Headers $headers -ContentType "application/json" | Out-Null
        Write-Host "+" -NoNewline
        $success++
    } catch {
        Write-Host "X" -NoNewline -ForegroundColor Red
        $failed++
    }
}

Write-Host "`nRefreshed Database."
Write-Host "Seeded: $success products."

$path = "c:\Users\Administrator\Documents\WEBKU\NB\data.js"
$content = Get-Content -Path $path -Raw
$content = [regex]::Replace($content, '("id": (22[2-9]|23[0-9]|240),[\s\S]*?"category": )"Umum"', '${1}"Asian"')
$content = [regex]::Replace($content, '"category": "Umum"', '"category": "Amateur"')
Set-Content -Path $path -Value $content
Write-Host "Success"

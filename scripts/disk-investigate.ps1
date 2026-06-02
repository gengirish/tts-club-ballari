# Quick-ish disk usage probe (robocopy /L totals). Run from PowerShell.
$ErrorActionPreference = 'SilentlyContinue'

function Get-RobocopyTotalBytesSync {
    param([string]$LiteralPath)
    if (-not (Test-Path -LiteralPath $LiteralPath)) { return $null }
    $raw = cmd /c "robocopy `"$LiteralPath`" NUL /L /S /NJH /NJS /NDL /NC /BYTES /NP /XJ /R:0 /W:0" 2>&1 | Out-String
    # Bytes line: Total (source tree), Copied, Skipped, ...
    $m = [regex]::Match($raw, '(?m)^\s*Bytes\s*:\s*(\d+)')
    if (-not $m.Success) { return 'PARSE_FAIL' }
    return [int64]$m.Groups[1].Value
}

$targets = @(
    @{ Path = 'C:\Windows'; Note = 'OS' },
    @{ Path = 'C:\Program Files'; Note = 'Apps64' },
    @{ Path = 'C:\Program Files (x86)'; Note = 'Apps32' },
    @{ Path = 'C:\ProgramData'; Note = 'ProgData' },
    # Full profile omitted — duplicates subtrees and can run for hours; size ≈ sum of parts below.
    @{ Path = 'C:\Users\gengi\AppData\Local'; Note = 'LocalAppData' },
    @{ Path = 'C:\Users\gengi\AppData\Local\Temp'; Note = 'Temp' },
    @{ Path = 'C:\Users\gengi\AppData\Local\Microsoft'; Note = 'MS-Local' },
    @{ Path = 'C:\Users\gengi\AppData\Local\Packages'; Note = 'StoreApps' },
    @{ Path = 'C:\Users\gengi\AppData\Local\Programs'; Note = 'UserPrograms' },
    @{ Path = 'C:\Users\gengi\AppData\Roaming'; Note = 'Roaming' },
    @{ Path = 'C:\Users\gengi\.cursor'; Note = 'Cursor' },
    @{ Path = 'C:\Users\gengi\Documents'; Note = 'Documents' },
    @{ Path = 'C:\Users\gengi\Downloads'; Note = 'Downloads' },
    @{ Path = 'C:\Users\gengi\AppData\Local\npm-cache'; Note = 'npm-cache' },
    @{ Path = 'C:\Users\gengi\AppData\Local\pnpm'; Note = 'pnpm' },
    @{ Path = 'C:\Users\gengi\AppData\Local\Yarn'; Note = 'Yarn' },
    @{ Path = 'C:\Users\gengi\AppData\Local\Docker'; Note = 'DockerDesktopData' },
    @{ Path = "$env:USERPROFILE\.nuget\packages"; Note = 'NuGet' },
    @{ Path = 'C:\Users\gengi\OneDrive'; Note = 'OneDrive' },
    @{ Path = 'C:\Users\gengi\Videos'; Note = 'Videos' },
    @{ Path = 'C:\Users\gengi\AppData\Local\Android'; Note = 'AndroidSDK' },
    @{ Path = 'C:\Users\gengi\AppData\Local\Google'; Note = 'Google-Local' },
    @{ Path = 'C:\Users\gengi\AppData\Local\JetBrains'; Note = 'JetBrains' },
    @{ Path = 'C:\Users\gengi\AppData\Local\Microsoft\Edge'; Note = 'Edge' },
    @{ Path = 'C:\Users\gengi\AppData\Local\Microsoft\Windows\INetCache'; Note = 'INetCache' }
)

Write-Host 'Volume C:'
Get-Volume -DriveLetter C | Select-Object @{N='SizeGB';E={[math]::Round($_.Size/1GB,2)}}, @{N='FreeGB';E={[math]::Round($_.SizeRemaining/1GB,2)}}, @{N='UsedGB';E={[math]::Round(($_.Size-$_.SizeRemaining)/1GB,2)}}

Write-Host "`nFolder sizes (robocopy /L, may take a few minutes total):"
$rows = foreach ($t in $targets) {
    $p = $t.Path
    Write-Host "  measuring $p ..."
    $b = Get-RobocopyTotalBytesSync -LiteralPath $p
    if ($null -eq $b) {
        [PSCustomObject]@{ GB = $null; Path = $p; Note = $t.Note; Status = 'missing' }
    }
    elseif ($b -is [string]) {
        [PSCustomObject]@{ GB = $null; Path = $p; Note = $t.Note; Status = $b }
    }
    else {
        [PSCustomObject]@{ GB = [math]::Round($b / 1GB, 2); Path = $p; Note = $t.Note; Status = 'ok' }
    }
}
$rows | Sort-Object { $_.GB } -Descending | Format-Table -AutoSize

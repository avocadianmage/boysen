# Don't add duplicate entries to history.
Set-PSReadlineOption -HistoryNoDuplicates

# Import formatting file.
Update-FormatData -PrependPath $PSScriptRoot/boysen.format.ps1xml

# Import scripts.
Get-ChildItem -Recurse $PSScriptRoot\startup-scripts\*.ps1 | 
    ForEach-Object { . $_ }

# Lastly, import profile, which was delayed until now.
if (Test-Path $PROFILE) { . $PROFILE }

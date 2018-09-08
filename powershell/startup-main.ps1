# Import formatting file.
Update-FormatData -PrependPath $PSScriptRoot/boysen.format.ps1xml

# Import scripts.
Get-ChildItem -Recurse $PSScriptRoot\startup-scripts\*.ps1 | 
    ForEach-Object { . $_ }

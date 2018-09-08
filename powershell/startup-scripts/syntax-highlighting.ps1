$Host.PrivateData.WarningForegroundColor = "DarkYellow"
$Host.PrivateData.DebugForegroundColor = "DarkGreen"
$Host.PrivateData.VerboseForegroundColor = "DarkGray"
$Host.PrivateData.ProgressForegroundColor = "DarkGreen"
$Host.PrivateData.ProgressBackgroundColor = "DarkGray"

Set-PSReadlineOption -TokenKind Command -ForegroundColor Blue
Set-PSReadlineOption -TokenKind Parameter -ForegroundColor Magenta
Set-PSReadlineOption -TokenKind Variable -ForegroundColor DarkGreen
Set-PSReadlineOption -TokenKind Keyword -ForegroundColor DarkBlue
Set-PSReadlineOption -TokenKind Type -ForegroundColor DarkCyan
Set-PSReadlineOption -TokenKind Member -ForegroundColor Magenta
Set-PSReadlineOption -TokenKind String -ForegroundColor DarkRed
Set-PSReadlineOption -TokenKind Number -ForegroundColor Yellow
Set-PSReadlineOption -TokenKind Operator -ForegroundColor DarkYellow
Set-PSReadlineOption -TokenKind Comment -ForegroundColor DarkGray

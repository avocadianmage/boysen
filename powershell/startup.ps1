# Specify prompt format.
function prompt
{
    $workingDirectory = $ExecutionContext.SessionState.Path.CurrentLocation
    $rgb = If (isContextElevated) { (255, 175, 0) } Else { (135, 255, 135) }
    $workingDirectory = getColoredString $workingDirectory $rgb
    "$workingDirectory$('$' * ($nestedPromptLevel + 1)) "
}

# Returns text of the specified color, build with ANSI escape sequences.
function getColoredString($text, $rgb)
{
    $ESC = [char]27
    "$ESC[38;2;$($rgb[0]);$($rgb[1]);$($rgb[2])m$text$ESC[0m"
}

# Determines if the currently running script has administrative privileges.
function isContextElevated
{
    $user = [Security.Principal.WindowsIdentity]::GetCurrent()
    $userSecurity = New-Object Security.Principal.WindowsPrincipal $user
    $adminRole = [Security.Principal.WindowsBuiltinRole]::Administrator
    ($userSecurity).IsInRole($adminRole)
}

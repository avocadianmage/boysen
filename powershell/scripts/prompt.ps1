# Specify prompt format.
function prompt
{
    $workingDirectory = $ExecutionContext.SessionState.Path.CurrentLocation
    $workingDirectory = getColoredString $workingDirectory (135, 255, 135)
    if (isContextElevated) 
    { 
        $adminPrefix = getColoredString "[admin] " (255, 175, 0)
    }
    "$adminPrefix$workingDirectory$('$' * ($NestedPromptLevel + 1)) "
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

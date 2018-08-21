# Specify prompt format.
function prompt
{
    # ANSI codes for 3/4 bit terminal color.
    $yellow = 33
    $brightGreen = 92

    # Prefix the prompt with an indicator if currently elevated.
    if (isElevated) { $adminPrefix = getColoredString "[admin] " $yellow }

    $workingDirectory = $ExecutionContext.SessionState.Path.CurrentLocation
    $workingDirectory = getColoredString $workingDirectory $brightGreen

    "$adminPrefix$workingDirectory$('$' * ($NestedPromptLevel + 1)) "
}

# Returns text of the specified color, build with ANSI escape sequences.
function getColoredString($text, $ansiColor)
{
    $ESC = [char]27
    "$ESC[$($ansiColor)m$text$ESC[0m"
}

# Determines if the currently running script has administrative privileges.
function isElevated
{
    $user = [Security.Principal.WindowsIdentity]::GetCurrent()
    $userSecurity = New-Object Security.Principal.WindowsPrincipal $user
    $adminRole = [Security.Principal.WindowsBuiltinRole]::Administrator
    ($userSecurity).IsInRole($adminRole)
}

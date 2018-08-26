# ANSI escape characters.
$ESC = [char]27;
$BEL = [char]7;

# Specify prompt format.
function prompt
{
    # ANSI codes for 3/4 bit terminal color.
    $yellow = 33
    $brightGreen = 92

    # Prefix the prompt with an indicator if currently elevated.
    if (isElevated) { $adminPrefix = getColoredString "[admin] " $yellow }

    # Get current working directory.
    $cwd = $ExecutionContext.SessionState.Path.CurrentLocation
    $coloredCWD = getColoredString $cwd $brightGreen

    # Ensure the console title is updated with the current working directory.
    $windowTitle = setWindowTitle $cwd

    # Build and return prompt.
    "$windowTitle$adminPrefix$coloredCWD$('$' * ($NestedPromptLevel + 1)) "
}

# Returns text of the specified color, build with ANSI escape sequences.
function getColoredString($text, $ansiColor)
{
    "$ESC[$($ansiColor)m$text$ESC[0m"
}

# Uses the appropriate ANSI escape sequence to set the window.
function setWindowTitle($title)
{
    "$ESC]2;$title$BEL"
}

# Determines if the currently running script has administrative privileges.
function isElevated
{
    $user = [Security.Principal.WindowsIdentity]::GetCurrent()
    $userSecurity = New-Object Security.Principal.WindowsPrincipal $user
    $adminRole = [Security.Principal.WindowsBuiltinRole]::Administrator
    ($userSecurity).IsInRole($adminRole)
}

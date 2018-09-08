# Ctrl+Home: bring cursor to start of input buffer.
Set-PSReadLineKeyHandler -Key Ctrl+Home `
                         -BriefDescription BeginningOfInput `
                         -Description "Bring cursor to start of input" `
                         -ScriptBlock {
    [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition(0) 
}

# Ctrl+End: bring cursor to end of input buffer.
Set-PSReadLineKeyHandler -Key Ctrl+End `
                         -BriefDescription EndOfInput `
                         -Description "Bring cursor to end of input" `
                         -ScriptBlock {
    $text = $null
    [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState(
        [ref]$text, [ref]$null)
    [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($text.Length) 
}

# Ctrl+Shift+Home: select text until start of input.
Set-PSReadLineKeyHandler -Key Ctrl+Shift+Home `
                         -BriefDescription SelectBackwardToStart `
                         -Description "Select text until start of input" `
                         -ScriptBlock { selectLines $false }

# Ctrl+Shift+End: select text to the end of the input buffer.
Set-PSReadLineKeyHandler -Key Ctrl+Shift+End `
                         -BriefDescription SelectForwardToEnd `
                         -Description "Select text until end of input" `
                         -ScriptBlock { selectLines $true }

# Continue selecting the next line until there are no more.
function selectLines {
    Param([Parameter(Mandatory=$true)][bool]$forward)

    $selectionLength = $null
    while ($true) {

        # Select the line in the specified direction.
        if ($forward) { [Microsoft.PowerShell.PSConsoleReadLine]::SelectLine() }
        else { [Microsoft.PowerShell.PSConsoleReadLine]::SelectBackwardsLine() }

        # Check if we have reached the start/end of the text.
        $newLength = $null
        [Microsoft.PowerShell.PSConsoleReadLine]::GetSelectionState(
            [ref]$null, [ref]$newLength)
        if ($newLength -eq $selectionLength) { return }
        $selectionLength = $newLength
    }
}

# Ctrl+Home: Bring cursor to start of input buffer.
Set-PSReadLineKeyHandler -Key Ctrl+Home `
                         -BriefDescription BeginningOfInput `
                         -Description "Bring cursor to start of input" `
                         -ScriptBlock {
    [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition(0) 
}

# Ctrl+End: Bring cursor to end of input buffer.
Set-PSReadLineKeyHandler -Key Ctrl+End `
                         -BriefDescription EndOfInput `
                         -Description "Bring cursor to end of input" `
                         -ScriptBlock {
    $text = $null
    [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState(
        [ref]$text, [ref]$null)
    [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($text.Length) 
}

# Ctrl+Shift+Home/End: Select text until start or end of input.
Set-PSReadLineKeyHandler -Key Ctrl+Shift+Home,Ctrl+Shift+End `
                         -BriefDescription SelectToEnd `
                         -Description "Select text until start or end of input" `
                         -ScriptBlock {
    param($key, $arg)
    
    # Move to end of input if End key is pressed. Move to start for Home key.
    $forward = $key.Key -eq [System.ConsoleKey]::End

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

# Tab/Shift+Tab: Complete the input using the next completion. Use the first 
# completion in the case of no input.
Set-PSReadLineKeyHandler -Key Tab,Shift+Tab `
                         -BriefDescription TabCompleteFirstOrNext `
                         -Description "Complete the input using the next completion. Use the first completion in the case of no input" `
                         -ScriptBlock {
    param($key, $arg)

    # If the current input is blank, use ".\" to start completing with file
    # system entries.
    $text = $null
    [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState(
        [ref]$text, [ref]$null)
    if ([string]::IsNullOrWhitespace($text)) {
        [Microsoft.PowerShell.PSConsoleReadLine]::RevertLine()
        [Microsoft.PowerShell.PSConsoleReadLine]::Insert(".\")
    }

    # Call into the standard tab completion APIs. Cycle next/previous based on
    # if shift is pressed.
    if (($key.Modifiers -band [System.ConsoleModifiers]::Shift) -ne 0) {
        [Microsoft.PowerShell.PSConsoleReadLine]::TabCompletePrevious()
    } else {
        [Microsoft.PowerShell.PSConsoleReadLine]::TabCompleteNext()
    }
}

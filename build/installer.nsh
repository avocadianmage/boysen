!include "EnvVarUpdate.nsh"

!macro customInstall

    ; Add application to PATH environment variable.
    ${EnvVarUpdate} $0 "PATH" "A" "HKCU" $INSTDIR

    ; Add environment variable tracking install location.
    ${EnvVarUpdate} $0 "boysen" "A" "HKCU" $INSTDIR

!macroend

!macro customUnInstall

    ; Remove application from PATH environment variable.
    ${un.EnvVarUpdate} $0 "PATH" "R" "HKCU" $INSTDIR

    ; Remove environment variable tracking install location.
    ${un.EnvVarUpdate} $0 "boysen" "R" "HKCU" $INSTDIR
    
!macroend
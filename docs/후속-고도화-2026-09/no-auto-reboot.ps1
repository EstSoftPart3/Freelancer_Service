$p = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU'
New-Item -Path $p -Force | Out-Null
Set-ItemProperty -Path $p -Name 'NoAutoRebootWithLoggedOnUsers' -Value 1 -Type DWord
Get-ItemProperty $p | Select-Object NoAutoRebootWithLoggedOnUsers

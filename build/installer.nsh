!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "AuctionTracker Setup Wizard"
  !define MUI_WELCOMEPAGE_TEXT "Install AuctionTracker on this computer.$\r$\n$\r$\nNetwork PC Engineering (NPCE)$\r$\nCreator and Lead Developer: Jordan Hymas"
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customInit
  ; Default install directory shown in wizard
  StrCpy $INSTDIR "$DESKTOP\\AuctionTracker"
!macroend

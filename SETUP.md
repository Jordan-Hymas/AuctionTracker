# AuctionTracker - Windows Setup Guide

## Continuing Development on Windows

This guide will help you continue developing the AuctionTracker WPF application on your Windows computer.

## Prerequisites

### Required Software
1. **Visual Studio 2022** (Community, Professional, or Enterprise)
   - Download: https://visualstudio.microsoft.com/downloads/
   - Workloads to install:
     - ".NET desktop development"
     - Optional: "Git for Windows" if not already installed

2. **.NET 8 SDK**
   - Included with Visual Studio 2022
   - Or download separately: https://dotnet.microsoft.com/download/dotnet/8.0

3. **Git for Windows**
   - Download: https://git-scm.com/download/win
   - Or use Git integration in Visual Studio

4. **Claude Code CLI** (Optional - for AI assistance)
   - Follow instructions at: https://docs.anthropic.com/claude/docs/claude-code
   - Install using: `npm install -g @anthropic-ai/claude-code`

## Getting Started on Windows

### Step 1: Clone the Repository

Open PowerShell or Command Prompt and run:

```powershell
# Navigate to your desired location
cd C:\Users\YourUsername\Projects

# Clone the repository
git clone https://github.com/Jhymas20/AuctionTracker.git
cd AuctionTracker
```

### Step 2: Verify Git Status

```powershell
git status
git remote -v
```

You should see the remote pointing to: `https://github.com/Jhymas20/AuctionTracker.git`

### Step 3: Continue with Claude Code (Optional)

If you have Claude Code installed, you can continue the conversation:

```powershell
# Navigate to the project directory
cd AuctionTracker

# Start Claude Code
claude
```

Then in Claude Code, you can say:
> "Let's continue building the AuctionTracker WPF application. Please start with Phase 1: creating the Visual Studio solution and project structure."

### Step 4: Create the Visual Studio Solution

If working manually, follow these steps:

1. Open Visual Studio 2022
2. Click "Create a new project"
3. Search for "WPF Application"
4. Select "WPF Application" (.NET 8)
5. Name: `AuctionTracker.App`
6. Location: Your cloned repository folder
7. Solution name: `AuctionTracker`
8. Click "Create"

### Step 5: Add Additional Projects

Right-click the solution in Solution Explorer:

1. Add New Project → Class Library (.NET 8)
   - Name: `AuctionTracker.Core`
   - Add to solution

2. Add New Project → Class Library (.NET 8)
   - Name: `AuctionTracker.Data`
   - Add to solution

### Step 6: Set Up Project References

**AuctionTracker.App** should reference:
- `AuctionTracker.Core`
- `AuctionTracker.Data`

**AuctionTracker.Data** should reference:
- `AuctionTracker.Core`

### Step 7: Install NuGet Packages

Open Package Manager Console (Tools → NuGet Package Manager → Package Manager Console):

```powershell
# For AuctionTracker.App
Install-Package CommunityToolkit.Mvvm -ProjectName AuctionTracker.App

# For AuctionTracker.Core
Install-Package CommunityToolkit.Mvvm -ProjectName AuctionTracker.Core

# For AuctionTracker.Data
Install-Package Microsoft.Data.Sqlite -ProjectName AuctionTracker.Data
Install-Package CommunityToolkit.Mvvm -ProjectName AuctionTracker.Data
# Optional:
Install-Package Dapper -ProjectName AuctionTracker.Data
```

## Project Structure

Create the following folder structure:

```
AuctionTracker/
├── AuctionTracker.sln
├── src/
│   ├── AuctionTracker.App/
│   │   ├── Views/
│   │   ├── ViewModels/
│   │   ├── Animations/
│   │   ├── Converters/
│   │   └── Resources/
│   ├── AuctionTracker.Core/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Interfaces/
│   └── AuctionTracker.Data/
│       ├── Repositories/
│       └── Database/
├── tests/
│   └── AuctionTracker.Tests/
├── SETUP.md (this file)
└── README.md
```

## Implementation Phases

Refer to the detailed implementation plan for the complete roadmap. Here's a quick overview:

### Phase 1: Project Setup & Core Models ✓
- Create solution structure (follow steps above)
- Install NuGet packages
- Create `BidEntry` and `AuctionSettings` models

### Phase 2: Data Layer
- Set up SQLite database
- Create `BidRepository`
- Implement database schema

### Phase 3: Business Logic
- Implement `BidService`
- Add validation logic
- Set up events

### Phase 4: Operator Window
- Design control panel UI
- Implement `OperatorViewModel`
- Wire up commands

### Phase 5: Display Window
- Design audience display UI
- Implement `DisplayViewModel`
- Layout thermometer and paddle display

### Phase 6: Animations
- Thermometer fill animation
- Counter animation
- Paddle swooping effect

### Phase 7: Features & Polish
- Keyboard shortcuts
- Settings system
- Error handling

### Phase 8: Testing & Deployment
- Unit tests
- Manual testing
- Build release version

## Key Features to Implement

- ✓ Dual-window system (Operator + Display)
- ✓ Vertical thermometer on RIGHT side
- ✓ Paddle number display on LEFT side with swooping animation
- ✓ Smooth counter animations
- ✓ Configurable quick-bid buttons
- ✓ Full-screen mode for HDMI output
- ✓ SQLite persistence
- ✓ Undo functionality
- ✓ High-contrast UI design

## Development Tips

### Testing on Windows
1. Build frequently: `Ctrl+Shift+B`
2. Run application: `F5` (Debug) or `Ctrl+F5` (Without Debugging)
3. Test on actual display/projector when possible
4. Use multi-monitor setup to simulate operator + display windows

### Debugging
- Set breakpoints in ViewModels to debug business logic
- Use Debug → Windows → XAML Hot Reload for UI tweaks
- Check Output window for binding errors

### Git Workflow
```powershell
# Before starting work
git pull origin main

# After implementing a feature
git add .
git commit -m "Implement [feature name]"
git push origin main

# Create a branch for major features
git checkout -b feature/operator-window
# ... work on feature ...
git commit -m "Add operator window UI"
git checkout main
git merge feature/operator-window
```

## Database Location

SQLite database will be stored at:
```
C:\Users\YourUsername\AppData\Roaming\AuctionTracker\auction.db
```

## Running the Application

### Debug Mode
- Press `F5` in Visual Studio
- Or click "Start Debugging" button

### Release Build
1. Set build configuration to "Release"
2. Build → Build Solution
3. Find executable in: `src\AuctionTracker.App\bin\Release\net8.0-windows\AuctionTracker.App.exe`

### Creating an Installer (Future)
- Use WiX Toolset or Inno Setup
- Package with .NET 8 runtime (self-contained)

## Troubleshooting

### "Could not find .NET 8"
- Install .NET 8 SDK from microsoft.com
- Restart Visual Studio

### NuGet Package Errors
- Tools → NuGet Package Manager → Package Manager Settings
- Clear all NuGet caches
- Restore packages: Right-click solution → Restore NuGet Packages

### XAML Designer Not Loading
- Build the solution first
- Close and reopen XAML files
- Check for syntax errors in XAML

### SQLite Database Errors
- Ensure `Microsoft.Data.Sqlite` is installed
- Check file permissions in AppData folder
- Verify database path is correct

## Resources

- [WPF Documentation](https://docs.microsoft.com/en-us/dotnet/desktop/wpf/)
- [CommunityToolkit.Mvvm](https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [WPF Animation Overview](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/graphics-multimedia/animation-overview)

## Next Steps

1. Complete Step 1-7 above to set up your environment
2. Start with Phase 1 of the implementation plan
3. Commit your progress regularly
4. Test on actual Windows machines and displays
5. Iterate on UI design based on real-world usage

## Questions?

If you're using Claude Code, you can ask questions like:
- "Create the BidEntry model class"
- "Implement the BidService with MVVM"
- "Design the OperatorWindow XAML layout"
- "Add the thermometer animation logic"

Good luck with your AuctionTracker development!

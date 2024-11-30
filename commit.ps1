#!/usr/bin/env pwsh

param(
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "Update plugin files"
)

# Function to check if git is installed
function Test-GitInstalled {
    try {
        $null = git --version
        return $true
    }
    catch {
        Write-Error "Git is not installed or not in PATH"
        return $false
    }
}

# Function to check if current directory is a git repository
function Test-GitRepository {
    if (-not (Test-Path .git)) {
        Write-Error "Current directory is not a git repository"
        return $false
    }
    return $true
}

# Function to check and create branch if it doesn't exist
function Initialize-GitBranch {
    param(
        [string]$BranchName = "main"
    )
    
    $currentBranch = git rev-parse --abbrev-ref HEAD
    if ($currentBranch -ne $BranchName) {
        # Check if branch exists
        $branchExists = git show-ref --verify --quiet refs/heads/$BranchName
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Creating and switching to $BranchName branch..."
            git checkout -b $BranchName
        } else {
            Write-Host "Switching to $BranchName branch..."
            git checkout $BranchName
        }
    }
}

# Function to stage and commit changes
function Invoke-GitCommit {
    param(
        [string]$Message
    )
    
    # Check for changes
    $status = git status --porcelain
    if (-not $status) {
        Write-Host "No changes to commit"
        return $false
    }

    # Stage all changes
    git add .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to stage changes"
        return $false
    }

    # Commit changes
    git commit -m $Message
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to commit changes"
        return $false
    }

    return $true
}

# Function to push changes
function Push-GitChanges {
    param(
        [string]$Branch = "main"
    )
    
    git push origin $Branch
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push changes"
        return $false
    }
    return $true
}

# Main execution
try {
    # Validate git installation and repository
    if (-not (Test-GitInstalled) -or -not (Test-GitRepository)) {
        exit 1
    }

    # Initialize branch
    Initialize-GitBranch

    # Perform commit
    Write-Host "Committing changes..."
    if (Invoke-GitCommit -Message $CommitMessage) {
        Write-Host "Changes committed successfully"
        
        # Push changes
        Write-Host "Pushing changes..."
        if (Push-GitChanges) {
            Write-Host "Changes pushed successfully"
        }
    }
}
catch {
    Write-Error "An error occurred: $_"
    exit 1
} 
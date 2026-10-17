$ErrorActionPreference = 'Stop'

$repoFullName = 'NGAURAV951/powerguard-embedded-monitor'
$description = 'Simulation-first embedded power and equipment health monitor using C and Python'

function Require-Command([string]$name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "Required command '$name' was not found. Install Git and GitHub CLI (gh), then rerun this script."
    }
}

Require-Command 'git'
Require-Command 'gh'

Write-Host 'PowerGuard GitHub publisher' -ForegroundColor Cyan
Write-Host "Target repository: https://github.com/$repoFullName"
Write-Host 'This script will create a public repository and push the current PowerGuard folder.'

# GitHub CLI login is handled locally by GitHub CLI; never paste a token into this script or chat.
gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host 'GitHub CLI is not signed in. Starting the official login flow...'
    gh auth login
    if ($LASTEXITCODE -ne 0) {
        throw 'GitHub sign-in did not complete. Run gh auth login and rerun this script.'
    }
}

$login = (gh api user --jq .login).Trim()
if ($LASTEXITCODE -ne 0) {
    throw 'Could not verify the signed-in GitHub account.'
}
if ($login -ne 'NGAURAV951') {
    throw "You are signed in as '$login', but this project is configured for NGAURAV951. Run gh auth switch --user NGAURAV951, or edit the repoFullName variable if you intentionally want another owner."
}

# Avoid overwriting an existing remote repository.
gh repo view $repoFullName *> $null
if ($LASTEXITCODE -eq 0) {
    throw "The GitHub repository $repoFullName already exists. To avoid overwriting it, this script has stopped without pushing. Open it and inspect it first."
}

if (-not (Test-Path '.git')) {
    git init -b main
    if ($LASTEXITCODE -ne 0) { throw 'Could not initialize the local Git repository.' }
}

# Configure commit identity only for this local repository if Git has none configured.
$gitName = (git config user.name 2>$null)
if (-not $gitName) {
    $gitName = Read-Host 'Name to show as the author of this Git commit'
    if ([string]::IsNullOrWhiteSpace($gitName)) { throw 'A commit author name is required.' }
    git config user.name $gitName
}
$gitEmail = (git config user.email 2>$null)
if (-not $gitEmail) {
    $gitEmail = Read-Host 'Email for the Git commit (a GitHub noreply address is fine)'
    if ([string]::IsNullOrWhiteSpace($gitEmail)) { throw 'A commit email is required.' }
    git config user.email $gitEmail
}

# Stage project files; .gitignore excludes generated caches and compiled demo binaries.
git add .
if ($LASTEXITCODE -ne 0) { throw 'Git could not stage the project files.' }
git rev-parse --verify HEAD *> $null
$hasCommit = ($LASTEXITCODE -eq 0)
if (-not $hasCommit) {
    git commit -m 'Initial PowerGuard project'
    if ($LASTEXITCODE -ne 0) { throw 'Initial commit failed. Check the Git error above and rerun the script.' }
} else {
    git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        git commit -m 'Add PowerGuard standalone project'
        if ($LASTEXITCODE -ne 0) { throw 'Git commit failed. Check the Git error above and rerun the script.' }
    }
}

gh repo create $repoFullName --public --source . --remote origin --push --description $description
if ($LASTEXITCODE -ne 0) {
    throw 'GitHub repository creation or push failed. Review the GitHub CLI message above; your local project files remain intact.'
}

Write-Host ''
Write-Host 'PowerGuard has been published successfully:' -ForegroundColor Green
Write-Host "https://github.com/$repoFullName"

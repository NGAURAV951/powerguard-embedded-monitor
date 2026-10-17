# Publish PowerGuard as a separate GitHub repository

The GitHub connector used by the assistant can add files to existing repositories but cannot create a new repository on your behalf. This helper script uses GitHub CLI on your own computer, under your own GitHub login, to create and push the standalone project.

## Easiest supported route (Windows)

1. Install **Git for Windows** if needed: https://git-scm.com/download/win
2. Install **GitHub CLI** if needed: https://cli.github.com/
3. Extract `powerguard-standalone.zip`.
4. Open the extracted `powerguard` folder in File Explorer.
5. Right-click an empty area and choose **Open in Terminal** (PowerShell).
6. If Windows blocks script execution for this session, run:

   ```powershell
   Set-ExecutionPolicy -Scope Process Bypass
   ```

7. Run:

   ```powershell
   .\publish-to-github.ps1
   ```

8. If prompted, complete GitHub CLI sign-in in the browser and enter your Git commit author name/email. The script checks that the signed-in account is `NGAURAV951`, checks that the target repository does not already exist, then creates `NGAURAV951/powerguard-embedded-monitor` as a public repository and pushes the project.

The script does not ask for or store your GitHub password or token. It uses the GitHub CLI's own authenticated session. It does not delete or modify the existing `edge-ai-riscv-vision` repository.

## Manual option

You can instead create a public repository named `powerguard-embedded-monitor` at https://github.com/new, then upload the contents of this folder. Do not select “Add a README” if you will push this local folder with Git, to avoid an unrelated initial commit.

## Note

This PowerGuard project is simulation-first. Sample data is synthetic; hardware sensor acquisition and calibration have not been implemented. Do not claim physical validation until you do it and record the results.

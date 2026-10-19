# Website and app installation notes

The dashboard is a static website stored in `site/`. It is also packaged as a Progressive Web App (PWA), which lets compatible browsers offer an install option and cache the app shell for offline viewing.

## Publishing

The workflow `.github/workflows/pages.yml` publishes the contents of `site/` to GitHub Pages when a commit reaches `main`. It can also be started manually from the repository's **Actions** tab with **Publish PowerGuard site** → **Run workflow**.

After a successful deploy, open:

https://ngaurav951.github.io/powerguard-embedded-monitor/

If a deployment fails, open the failed **Publish PowerGuard site** run in the Actions tab and read the first failing step. The repository's Pages setting must use **GitHub Actions** as the build/deployment source.

## Installing the app

On a browser that supports PWA installation, visit the deployed site and use its **Install app** control when the browser presents it. On mobile, the browser may instead show **Add to Home Screen** in its menu. Installation availability and offline behavior depend on the browser.

The web app is a front end for the included synthetic CSV sample. It is not a native Android package and does not receive real-time data from a board or sensor.

## Local preview

From the repository root, run:

```powershell
py -m http.server 8000 --directory site
```

Then visit http://localhost:8000. Linux/macOS users can run `python3 -m http.server 8000 --directory site`.

## Safety and scope

Do not treat the demo dashboard, sample readings, or fixed example thresholds as a protective instrument. Physical measurements and hardware validation remain future work.

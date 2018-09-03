# boysen
Boysen is a sleek and modern Powershell emulator built upon electron, xterm.js, and node-pty. It supports multiple sessions through tabs and a few other goodies such as a more compact and bash-like display of file system entries.

![Boysen application screenshot with three tabs open](screenshot.png)

## Building and running

Clone the repo:
```powershell
git clone https://github.com/avocadianmage/boysen.git
```

Within the root directory of the repo (`/boysen`):
```powershell
npm install
./node_modules/.bin/electron-rebuild # Build native electron modules.
```

To run the program:
```powershell
npm start
```

### Dependencies

You'll need `npm` to build and run program. It's packaged with node.js, which you can get [here](https://nodejs.org/).

`npm install` requires some tools like Python and the C++ compiler to be present on the system. You can easily install them by running the following command in PowerShell as an administrator:
```powershell
npm install --global --production windows-build-tools
```

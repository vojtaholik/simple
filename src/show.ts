/* eslint-disable import/prefer-default-export */
import { app, BrowserWindow, screen } from 'electron';
import { getAssetPath } from './assets';

const styles = 'dist/style.css';

const page = (html: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Scripts</title>
    <link rel="stylesheet" href="${styles}">
</head>
<body>
    ${html}
</body>
</html>`;

const customProtocol = 'file2';

export const show = (html: string, options: any = {}) => {
  const cursor = screen.getCursorScreenPoint();
  // Get display with cursor
  const distScreen = screen.getDisplayNearestPoint({
    x: cursor.x,
    y: cursor.y,
  });

  const { width: screenWidth, height: screenHeight } = distScreen.workAreaSize;
  const width = Math.floor((screenWidth / 4) * distScreen.scaleFactor);
  const height = Math.floor((screenHeight / 4) * distScreen.scaleFactor);
  const x = distScreen.workArea.x + Math.floor(screenWidth / 2 - width / 2); // * distScreen.scaleFactor
  const y = distScreen.workArea.y + Math.floor(screenHeight / 2 - height / 2);

  const showWindow = new BrowserWindow({
    frame: true,
    transparent: false,
    backgroundColor: '#00000000',
    show: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width,
    height,
    x,
    y,
    ...options,
  });

  showWindow?.setMaxListeners(2);

  showWindow.webContents.once('did-finish-load', () => {
    showWindow?.webContents.closeDevTools();
    showWindow?.show();
  });

  showWindow?.webContents.on('before-input-event', (event: any, input) => {
    if (input.key === 'Escape') {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      showWindow.destroy();
    }
  });

  showWindow?.loadURL(
    `data:text/html;charset=UTF-8,${encodeURIComponent(page(html))}`,
    {
      baseURLForDataURL: `${customProtocol}://${app
        .getAppPath()
        .replace('\\', '/')}/`,
    }
  );

  return showWindow;
};

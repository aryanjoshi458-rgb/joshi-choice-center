const { app } = require('electron');
console.log('User Data Path:', app.getPath('userData'));
app.quit();

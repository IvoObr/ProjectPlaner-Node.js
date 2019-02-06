const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    const config = require('./config.json');
    process.env.JWT_SECRET = config.JWT_SECRET;
}

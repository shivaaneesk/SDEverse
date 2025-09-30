const cron = require('node-cron');
const axios = require('axios');

class KeepAlive {
  constructor() {
    this.serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    this.enabled = process.env.NODE_ENV === 'production';
    this.task = null;
  }

  start() {
    if (!this.enabled) return;

    // Use 12 minutes for better compatibility with Render (15 min sleep) and others
    const interval = process.env.KEEP_ALIVE_INTERVAL || '*/12 * * * *';
    
    this.task = cron.schedule(interval, async () => {
      try {
        await axios.get(`${this.serverUrl}/health`);
        console.log('✅ Keep-alive ping successful');
      } catch (error) {
        console.log('❌ Keep-alive ping failed:', error.message);
      }
    });

    console.log(`🚀 Keep-alive started - pinging every 12 minutes`);
  }

  stop() {
    if (this.task) {
      this.task.stop();
      console.log('🛑 Keep-alive stopped');
    }
  }
}

module.exports = KeepAlive;
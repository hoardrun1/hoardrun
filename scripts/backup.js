#!/usr/bin/env node
require('dotenv').config();
const { BackupService } = require('../lib/backup/backup-service');
const { MomoLogger } = require('../lib/logger/momo-logger');

async function runBackup() {
  try {
    MomoLogger.logBackup({
      type: 'BACKUP_STARTED',
      status: 'INFO',
      timestamp: new Date(),
    });

    await BackupService.createBackup();

    process.exit(0);
  } catch (error) {
    MomoLogger.logBackup({
      type: 'BACKUP_FAILED',
      status: 'ERROR',
      error: error.message,
      timestamp: new Date(),
    });

    process.exit(1);
  }
}

runBackup();

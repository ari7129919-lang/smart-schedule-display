import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// SQLite database setup
const db = new sqlite3.Database('./schedule.db');

// Promisify db methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Initialize database tables
async function initDatabase() {
  try {
    // System Settings table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS SystemSettings (
        id TEXT PRIMARY KEY,
        organizationName TEXT,
        theme TEXT,
        screenScale TEXT,
        autoRefresh INTEGER,
        boardDesign TEXT,
        dualNoticeMode INTEGER DEFAULT 0,
        pauseAllSessionAdvance INTEGER DEFAULT 0,
        screenProfile TEXT DEFAULT '50',
        groupRotationSeconds INTEGER DEFAULT 8,
        noticeRotationSeconds INTEGER DEFAULT 20,
        timerTitle TEXT,
        timerFullScreenMinutes INTEGER DEFAULT 3,
        overrideMode TEXT DEFAULT 'none',
        overrideDay TEXT,
        customModeConfig TEXT,
        tickerText TEXT,
        contactInfo TEXT,
        operatingHours TEXT,
        fixedRules TEXT,
        backgrounds TEXT,
        backgroundRotationEnabled INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: Add missing columns if they don't exist (for existing databases)
    const addColumnIfNotExists = async (column, type) => {
      try {
        await dbRun(`ALTER TABLE SystemSettings ADD COLUMN ${column} ${type}`);
        console.log(`Added column ${column}`);
      } catch (e) {
        // Column probably already exists
      }
    };

    await addColumnIfNotExists('dualNoticeMode', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('pauseAllSessionAdvance', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('screenProfile', "TEXT DEFAULT '50'");
    await addColumnIfNotExists('groupRotationSeconds', 'INTEGER DEFAULT 8');
    await addColumnIfNotExists('noticeRotationSeconds', 'INTEGER DEFAULT 20');
    await addColumnIfNotExists('timerTitle', 'TEXT');
    await addColumnIfNotExists('timerFullScreenMinutes', 'INTEGER DEFAULT 3');
    await addColumnIfNotExists('overrideMode', "TEXT DEFAULT 'none'");
    await addColumnIfNotExists('overrideDay', 'TEXT');
    await addColumnIfNotExists('customModeConfig', 'TEXT');
    await addColumnIfNotExists('tickerText', 'TEXT');
    await addColumnIfNotExists('contactInfo', 'TEXT');
    await addColumnIfNotExists('operatingHours', 'TEXT');
    await addColumnIfNotExists('fixedRules', 'TEXT');
    await addColumnIfNotExists('backgrounds', 'TEXT');
    await addColumnIfNotExists('backgroundRotationEnabled', 'INTEGER DEFAULT 1');

    // Day Schedule table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS DaySchedule (
        id TEXT PRIMARY KEY,
        dayOfWeek TEXT,
        weekStartDate TEXT,
        workshops TEXT,
        smallGroups TEXT,
        internalCircleLists TEXT,
        allCircleMembers TEXT,
        circleDisplayMode TEXT,
        congratulations TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notices table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS Notice (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        pdfUrl TEXT,
        imageUrl TEXT,
        active INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Phone Numbers table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS PhoneNumbers (
        id TEXT PRIMARY KEY,
        name TEXT,
        number TEXT,
        active INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Database helper functions
const dbHelpers = {
  // Generic find all
  async findAll(table) {
    const rows = await dbAll(`SELECT * FROM ${table}`);
    return rows.map(row => {
      // Parse JSON fields
      if (row.workshops) row.workshops = JSON.parse(row.workshops);
      if (row.smallGroups) row.smallGroups = JSON.parse(row.smallGroups);
      if (row.internalCircleLists) row.internalCircleLists = JSON.parse(row.internalCircleLists);
      if (row.allCircleMembers) row.allCircleMembers = JSON.parse(row.allCircleMembers);
      if (row.boardDesign) row.boardDesign = JSON.parse(row.boardDesign);
      if (row.congratulations) row.congratulations = JSON.parse(row.congratulations);
      if (row.fixedRules) row.fixedRules = JSON.parse(row.fixedRules);
      if (row.backgrounds) row.backgrounds = JSON.parse(row.backgrounds);
      if (row.customModeConfig) row.customModeConfig = JSON.parse(row.customModeConfig);
      return row;
    });
  },

  // Generic find by ID
  async findById(table, id) {
    const row = await dbGet(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (!row) return null;
    
    // Parse JSON fields
    if (row.workshops) row.workshops = JSON.parse(row.workshops);
    if (row.smallGroups) row.smallGroups = JSON.parse(row.smallGroups);
    if (row.internalCircleLists) row.internalCircleLists = JSON.parse(row.internalCircleLists);
    if (row.allCircleMembers) row.allCircleMembers = JSON.parse(row.allCircleMembers);
    if (row.boardDesign) row.boardDesign = JSON.parse(row.boardDesign);
    if (row.congratulations) row.congratulations = JSON.parse(row.congratulations);
    if (row.fixedRules) row.fixedRules = JSON.parse(row.fixedRules);
    if (row.backgrounds) row.backgrounds = JSON.parse(row.backgrounds);
    if (row.customModeConfig) row.customModeConfig = JSON.parse(row.customModeConfig);
    
    return row;
  },

  // Generic create
  async create(table, data) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    // Prepare data object
    const insertData = { id, ...data, createdAt: now, updatedAt: now };
    
    // Stringify JSON fields
    if (insertData.workshops) insertData.workshops = JSON.stringify(insertData.workshops);
    if (insertData.smallGroups) insertData.smallGroups = JSON.stringify(insertData.smallGroups);
    if (insertData.internalCircleLists) insertData.internalCircleLists = JSON.stringify(insertData.internalCircleLists);
    if (insertData.allCircleMembers) insertData.allCircleMembers = JSON.stringify(insertData.allCircleMembers);
    if (insertData.boardDesign) insertData.boardDesign = JSON.stringify(insertData.boardDesign);
    if (insertData.congratulations) insertData.congratulations = JSON.stringify(insertData.congratulations);
    if (insertData.fixedRules) insertData.fixedRules = JSON.stringify(insertData.fixedRules);
    if (insertData.backgrounds) insertData.backgrounds = JSON.stringify(insertData.backgrounds);
    if (insertData.customModeConfig) insertData.customModeConfig = JSON.stringify(insertData.customModeConfig);
    
    const columns = Object.keys(insertData).join(', ');
    const placeholders = Object.keys(insertData).map(() => '?').join(', ');
    const values = Object.values(insertData);
    
    await dbRun(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, values);
    return await this.findById(table, id);
  },

  // Generic update
  async update(table, id, data) {
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    
    // Stringify JSON fields
    if (updateData.workshops) updateData.workshops = JSON.stringify(updateData.workshops);
    if (updateData.smallGroups) updateData.smallGroups = JSON.stringify(updateData.smallGroups);
    if (updateData.internalCircleLists) updateData.internalCircleLists = JSON.stringify(updateData.internalCircleLists);
    if (updateData.allCircleMembers) updateData.allCircleMembers = JSON.stringify(updateData.allCircleMembers);
    if (updateData.boardDesign) updateData.boardDesign = JSON.stringify(updateData.boardDesign);
    if (updateData.congratulations) updateData.congratulations = JSON.stringify(updateData.congratulations);
    if (updateData.fixedRules) updateData.fixedRules = JSON.stringify(updateData.fixedRules);
    if (updateData.backgrounds) updateData.backgrounds = JSON.stringify(updateData.backgrounds);
    if (updateData.customModeConfig) updateData.customModeConfig = JSON.stringify(updateData.customModeConfig);
    
    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];
    
    await dbRun(`UPDATE ${table} SET ${setClause} WHERE id = ?`, values);
    return await this.findById(table, id);
  },

  // Generic delete
  async delete(table, id) {
    await dbRun(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return { message: 'Deleted' };
  }
};

// Initialize sample data
async function initSampleData() {
  try {
    // Check if data already exists
    const existingSettings = await dbHelpers.findAll('SystemSettings');
    if (existingSettings.length > 0) {
      console.log('Sample data already exists');
      return;
    }

    // Sample system settings
    await dbHelpers.create('SystemSettings', {
      id: '1',
      organizationName: 'Smart Schedule Display',
      theme: 'default',
      screenScale: '32',
      autoRefresh: 1,
      boardDesign: {}
    });

    // Sample phone numbers
    await dbHelpers.create('PhoneNumbers', {
      id: '1',
      name: 'Office',
      number: '123-456-7890',
      active: 1
    });

    await dbHelpers.create('PhoneNumbers', {
      id: '2',
      name: 'Emergency',
      number: '911',
      active: 1
    });

    // Sample notices
    await dbHelpers.create('Notice', {
      id: '1',
      title: 'Welcome',
      content: 'Welcome to Smart Schedule Display',
      active: 1
    });

    await dbHelpers.create('Notice', {
      id: '2',
      title: 'Meeting',
      content: 'Team meeting at 3 PM',
      active: 1
    });

    console.log('Sample data initialized');
  } catch (error) {
    console.error('Sample data initialization failed:', error);
  }
}

export { db, dbHelpers, initDatabase, initSampleData };

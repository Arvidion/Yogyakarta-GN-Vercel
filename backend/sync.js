const sequelize = require('./config/db');
require('./models');

async function syncDatabase() {
  try {
    console.log('Authenticating database connection...');
    await sequelize.authenticate();
    console.log('Database connection authenticated.');

    console.log('Syncing database models...');
    await sequelize.sync({ alter: false });
    console.log('Database sync completed.');

    console.log('Aligning primary key sequences...');
    const tables = ['Bidangs', 'Partners', 'Programs', 'Users', 'Negaras'];
    for (const table of tables) {
      try {
        await sequelize.query(
          `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(MAX(id), 1)) FROM "${table}";`
        );
      } catch (e) {
        // Table might not exist or might not have serial id
      }
    }
    console.log('Sequences aligned successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Database sync failed:', error);
    process.exit(1);
  }
}

syncDatabase();

require('dotenv').config(); // loads .env into process.env

module.exports = {
    "development": {
        "use_env_variable": "DATABASE_URL", // Sequelize reads the whole connection string from here
        "dialect": "postgres",
    },
    "test": {
        "use_env_variable": "DATABASE_URL",
        "dialect": "postgres",
    },
    "production": {
        "use_env_variable": "DATABASE_URL",
        "dialect": "postgres",
    },
};

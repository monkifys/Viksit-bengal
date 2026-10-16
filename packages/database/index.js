const client = require('@prisma/client');
const prisma = new client.PrismaClient();

module.exports = {
  ...client,
  prisma,
};

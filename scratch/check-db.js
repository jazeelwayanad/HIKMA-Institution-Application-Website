const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const forms = await prisma.formTemplate.findMany({
    select: { id: true, name: true, pdfTemplateUrl: true }
  });


  const courses = await prisma.course.findMany({
    select: { id: true, title: true, formTemplateId: true }
  });


  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });

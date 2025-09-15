// prisma/seed.js
import prisma from "../lib/prisma.js";

async function main() {
  // ----------------------------
  // Departments
  // ----------------------------
  await prisma.department.createMany({
    data: [
      { name: "CSE-A" },
      { name: "CSE-B" },
      { name: "IT" },
      { name: "ECE" },
      { name: "EEE" },
      { name: "AIDS" },
      { name: "MECH" },
    ],
    skipDuplicates: true,
  });

  // ----------------------------
  // Points for events
  // ----------------------------
  const onstagePoints = {
    "1": 30,
    "2": 25,
    "3": 20,
    attendance: 50,
    discipline: 50,
  };

  const offstagePoints = {
    "1": 20,
    "2": 15,
    "3": 10,
    attendance: 50,
    discipline: 50,
  };

  // ----------------------------
  // Example Events - ONSTAGE (Individual or Team)
  // ----------------------------
  await prisma.event.createMany({
    data: [
      {
        name: "Solo Singing Finals",
        division: "ONSTAGE",
        type: "INDIVIDUAL",      // new field
        status: "UPCOMING",
        date: new Date("2025-09-20T18:00:00Z"),
        points: onstagePoints,
      },
      {
        name: "Group Dance",
        division: "ONSTAGE",
        type: "TEAM",
        status: "UPCOMING",
        date: new Date("2025-09-21T18:00:00Z"),
        points: onstagePoints,
      },
    ],
    skipDuplicates: true,
  });

  // ----------------------------
  // Example Events - OFFSTAGE
  // ----------------------------
  await prisma.event.createMany({
    data: [
      {
        name: "Poster Making",
        division: "OFFSTAGE",
        type: "INDIVIDUAL",
        status: "UPCOMING",
        date: new Date("2025-09-20T12:00:00Z"),
        points: offstagePoints,
      },
      {
        name: "Quiz Competition",
        division: "OFFSTAGE",
        type: "TEAM",
        status: "UPCOMING",
        date: new Date("2025-09-21T14:00:00Z"),
        points: offstagePoints,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Departments and events added successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

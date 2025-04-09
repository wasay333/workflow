/*
  Warnings:

  - You are about to drop the column `balance` on the `UserBalance` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserBalance" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "credits" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_UserBalance" ("userId") SELECT "userId" FROM "UserBalance";
DROP TABLE "UserBalance";
ALTER TABLE "new_UserBalance" RENAME TO "UserBalance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

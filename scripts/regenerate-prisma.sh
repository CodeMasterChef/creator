#!/bin/bash
cd /Users/n/Code/creator
npx prisma generate
node scripts/apply-migration.js


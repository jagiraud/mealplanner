/**
 * Livsmedelsverket Nutrition Enrichment Script
 *
 * Enriches ingredient nutritional data by querying the Swedish Food Agency
 * (Livsmedelsverket) open API. CC BY 4.0 license.
 *
 * API docs: https://dataportal.livsmedelsverket.se/livsmedel/swagger/index.html
 *
 * Usage: npx tsx packages/backend/scripts/enrich-nutrition.ts [--dry-run]
 */

import { Pool } from 'pg';

const LIVSMEDELSVERKET_API = 'https://dataportal.livsmedelsverket.se/api/v1';

// --- Database setup ---

function createPool(): Pool {
  return new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DATABASE || 'mealplanner_dev',
    user: process.env.POSTGRES_USER || 'mealplanner',
    password: process.env.POSTGRES_PASSWORD || 'dev_password_123',
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
}

// --- Livsmedelsverket types ---

interface LivsmedelItem {
  nummer: number;
  namn: string;
  vetenskapligtNamn?: string;
  grupp?: string;
}

interface Naringsvarde {
  namn: string;
  forkortning: string;
  varde: number;
  enhet: string;
}

// --- Helpers ---

function normalizeSwedish(text: string): string {
  return text
    .toLowerCase()
    .replace(/[,()]/g, '')
    .trim();
}

/**
 * Score how well a Livsmedelsverket item matches a given ingredient name.
 * Higher is better. Returns 0 if no match.
 */
function matchScore(ingredientName: string, livsmedelNamn: string): number {
  const a = normalizeSwedish(ingredientName);
  const b = normalizeSwedish(livsmedelNamn);

  // Exact match
  if (a === b) return 100;

  // One contains the other
  if (b.includes(a)) return 80;
  if (a.includes(b)) return 60;

  // Word-level overlap
  const wordsA = a.split(/\s+/);
  const wordsB = b.split(/\s+/);
  const commonWords = wordsA.filter((w) => wordsB.includes(w));
  if (commonWords.length > 0) {
    return (commonWords.length / Math.max(wordsA.length, wordsB.length)) * 50;
  }

  return 0;
}

async function fetchAllLivsmedel(): Promise<LivsmedelItem[]> {
  console.log('Fetching all food items from Livsmedelsverket...');
  const response = await fetch(`${LIVSMEDELSVERKET_API}/livsmedel`);
  if (!response.ok) {
    throw new Error(`Failed to fetch livsmedel: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as LivsmedelItem[];
  console.log(`Fetched ${data.length} food items`);
  return data;
}

async function fetchNutrition(nummer: number): Promise<Naringsvarde[]> {
  const response = await fetch(`${LIVSMEDELSVERKET_API}/livsmedel/${nummer}/naringsvarden`);
  if (!response.ok) {
    throw new Error(`Failed to fetch nutrition for ${nummer}: ${response.status}`);
  }
  return (await response.json()) as Naringsvarde[];
}

function extractMacros(naringsvarden: Naringsvarde[]): {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
} {
  const macros: Record<string, number | undefined> = {};

  for (const n of naringsvarden) {
    const abbr = n.forkortning?.toLowerCase();
    const name = n.namn?.toLowerCase();

    if (abbr === 'ener' || name?.includes('energi') && n.enhet === 'kcal') {
      macros.calories = n.varde;
    } else if (abbr === 'prot' || name?.includes('protein')) {
      macros.protein = n.varde;
    } else if (abbr === 'kolh' || name?.includes('kolhydrat')) {
      macros.carbs = n.varde;
    } else if (abbr === 'fett' || name === 'fett') {
      macros.fat = n.varde;
    } else if (abbr === 'fibe' || name?.includes('fiber')) {
      macros.fiber = n.varde;
    }
  }

  return macros;
}

// --- Main ---

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('DRY RUN — no database changes will be made\n');

  const pool = createPool();

  try {
    // 1. Get all unique ingredient names from recipe_ingredient that lack nutrition data
    const { rows: ingredients } = await pool.query<{ name: string; count: string }>(
      `SELECT DISTINCT ri.name, COUNT(*) as count
       FROM recipe_ingredient ri
       LEFT JOIN ingredient i ON ri.ingredient_id = i.id
       WHERE ri.name IS NOT NULL
         AND (ri.ingredient_id IS NULL OR i.calories IS NULL)
       GROUP BY ri.name
       ORDER BY count DESC`
    );

    console.log(`Found ${ingredients.length} ingredient names needing nutrition data\n`);

    if (ingredients.length === 0) {
      console.log('All ingredients already have nutrition data. Nothing to do.');
      return;
    }

    // 2. Fetch Livsmedelsverket food database
    const allLivsmedel = await fetchAllLivsmedel();

    let enriched = 0;
    let skipped = 0;

    for (const { name: ingredientName } of ingredients) {
      // Find best match
      let bestMatch: LivsmedelItem | null = null;
      let bestScore = 0;

      for (const item of allLivsmedel) {
        const score = matchScore(ingredientName, item.namn);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item;
        }
      }

      if (!bestMatch || bestScore < 30) {
        console.log(`  SKIP: "${ingredientName}" — no good match (best score: ${bestScore})`);
        skipped++;
        continue;
      }

      console.log(
        `  MATCH: "${ingredientName}" → "${bestMatch.namn}" (score: ${bestScore}, id: ${bestMatch.nummer})`
      );

      if (dryRun) {
        enriched++;
        continue;
      }

      // Fetch nutrition data
      try {
        const naringsvarden = await fetchNutrition(bestMatch.nummer);
        const macros = extractMacros(naringsvarden);

        if (macros.calories == null && macros.protein == null) {
          console.log(`    No useful nutrition data found, skipping`);
          skipped++;
          continue;
        }

        // Upsert into ingredient table
        const { rows } = await pool.query<{ id: string }>(
          `INSERT INTO ingredient (name, category, unit, calories, protein, carbs, fat, fiber)
           VALUES ($1, $2, 'g', $3, $4, $5, $6, $7)
           ON CONFLICT (name) DO UPDATE SET
             calories = COALESCE(EXCLUDED.calories, ingredient.calories),
             protein = COALESCE(EXCLUDED.protein, ingredient.protein),
             carbs = COALESCE(EXCLUDED.carbs, ingredient.carbs),
             fat = COALESCE(EXCLUDED.fat, ingredient.fat),
             fiber = COALESCE(EXCLUDED.fiber, ingredient.fiber)
           RETURNING id`,
          [ingredientName, bestMatch.grupp || 'other', macros.calories, macros.protein, macros.carbs, macros.fat, macros.fiber]
        );

        // Link recipe_ingredient rows to the ingredient
        if (rows.length > 0) {
          await pool.query(
            `UPDATE recipe_ingredient SET ingredient_id = $1 WHERE name = $2 AND ingredient_id IS NULL`,
            [rows[0].id, ingredientName]
          );
        }

        enriched++;
        console.log(
          `    Enriched: cal=${macros.calories ?? '?'} prot=${macros.protein ?? '?'}g carbs=${macros.carbs ?? '?'}g fat=${macros.fat ?? '?'}g fiber=${macros.fiber ?? '?'}g`
        );
      } catch (err) {
        console.error(`    Error fetching nutrition for ${bestMatch.nummer}:`, err);
        skipped++;
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`\nDone! Enriched: ${enriched}, Skipped: ${skipped}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

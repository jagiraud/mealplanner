/**
 * Recipe Crawler Script
 *
 * Crawls Swedish recipe websites (ICA.se and Koket.se) and inserts
 * recipe data into PostgreSQL using schema.org/Recipe JSON-LD structured data.
 *
 * Usage:
 *   npx tsx packages/backend/scripts/crawl-recipes.ts --source ica --limit 200
 *   npx tsx packages/backend/scripts/crawl-recipes.ts --source koket --limit 100
 *   npx tsx packages/backend/scripts/crawl-recipes.ts --source all --limit 500
 */

import { Pool } from 'pg';
import * as cheerio from 'cheerio';

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

interface CliArgs {
  source: 'ica' | 'koket' | 'all';
  limit: number;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let source: CliArgs['source'] = 'all';
  let limit = 200;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) {
      const val = args[i + 1].toLowerCase();
      if (val === 'ica' || val === 'koket' || val === 'all') {
        source = val;
      } else {
        console.error(`Invalid --source value: ${args[i + 1]}. Use ica, koket, or all.`);
        process.exit(1);
      }
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      if (isNaN(limit) || limit < 1) {
        console.error(`Invalid --limit value: ${args[i + 1]}`);
        process.exit(1);
      }
      i++;
    }
  }

  return { source, limit };
}

// ---------------------------------------------------------------------------
// Database connection
// ---------------------------------------------------------------------------

function createPool(): Pool {
  return new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl:
      process.env.POSTGRES_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

// ---------------------------------------------------------------------------
// Rate-limited fetch helper
// ---------------------------------------------------------------------------

let lastFetchTime = 0;
const MIN_DELAY_MS = 1500; // 1.5 seconds between requests

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastFetchTime;
  if (elapsed < MIN_DELAY_MS) {
    await sleep(MIN_DELAY_MS - elapsed);
  }
  lastFetchTime = Date.now();

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'MealPlannerBot/1.0 (recipe-crawler; educational project)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.5',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// ISO 8601 duration parser (PT30M, PT1H30M, PT1H, etc.)
// ---------------------------------------------------------------------------

function parseDurationToMinutes(duration: string | undefined | null): number | null {
  if (!duration) return null;

  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return null;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  const total = hours * 60 + minutes + Math.ceil(seconds / 60);
  return total > 0 ? total : null;
}

// ---------------------------------------------------------------------------
// Nutrition parser - strip unit suffixes like "g", "kcal" from values
// ---------------------------------------------------------------------------

function parseNutritionValue(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null) return null;
  const str = String(value).replace(/[^\d.,]/g, '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

// ---------------------------------------------------------------------------
// Swedish ingredient string parser
// ---------------------------------------------------------------------------

interface ParsedIngredient {
  quantity: number | null;
  unit: string | null;
  name: string | null;
  rawText: string;
}

/**
 * Parse a Swedish ingredient string like:
 *   "600 g fryst eller farsk kycklingfile"
 *   "2 msk olivolja"
 *   "1 1/2 dl graddfil"
 *   "salt och peppar"
 *   "ca 4 dl vatten"
 */
function parseSwedishIngredient(raw: string): ParsedIngredient {
  const rawText = raw.trim();

  // Common Swedish units (order matters - longer units first to avoid partial matches)
  const units = [
    'msk', 'tsk', 'krm', 'port',
    'kg', 'dl', 'ml', 'cl', 'st', 'g', 'l',
  ];

  const unitPattern = units.join('|');

  // Pattern: optional "ca" prefix, quantity (int, decimal, or fraction), optional unit, then name
  // Handles: "600 g chicken", "2 msk oil", "1 1/2 dl cream", "ca 4 dl water", "salt och peppar"
  const regex = new RegExp(
    `^(?:ca\\.?\\s+)?` +                         // optional "ca" / "ca."
    `(\\d+(?:[.,]\\d+)?(?:\\s+\\d+\\/\\d+)?` +    // integer, decimal, or mixed fraction (e.g. "1 1/2")
    `|\\d+\\/\\d+)` +                             // or just a fraction (e.g. "1/2")
    `\\s*` +
    `(${unitPattern})?` +                          // optional unit
    `\\.?\\s*` +                                   // optional period after unit
    `(.*)$`,                                       // rest is the ingredient name
    'i'
  );

  const match = rawText.match(regex);

  if (!match) {
    // No quantity found - entire string is the ingredient name
    return {
      quantity: null,
      unit: null,
      name: rawText || null,
      rawText,
    };
  }

  const quantityStr = match[1];
  const unit = match[2] ? match[2].toLowerCase() : null;
  let name = match[3] ? match[3].trim() : null;

  // Parse quantity - handle fractions and mixed fractions
  let quantity: number | null = null;
  if (quantityStr) {
    quantity = parseFractionOrNumber(quantityStr);
  }

  // If we ended up with an empty name, set to null
  if (name === '') name = null;

  return { quantity, unit, name, rawText };
}

function parseFractionOrNumber(str: string): number | null {
  const trimmed = str.trim().replace(',', '.');

  // Mixed fraction: "1 1/2"
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    return den !== 0 ? whole + num / den : null;
  }

  // Simple fraction: "1/2"
  const fracMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    return den !== 0 ? num / den : null;
  }

  // Plain number or decimal
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
}

// ---------------------------------------------------------------------------
// JSON-LD extraction from HTML
// ---------------------------------------------------------------------------

interface RecipeJsonLd {
  '@type'?: string | string[];
  name?: string;
  description?: string;
  image?: string | string[] | { url?: string };
  url?: string;
  totalTime?: string;
  cookTime?: string;
  prepTime?: string;
  cookingMethod?: string;
  recipeCategory?: string | string[];
  recipeYield?: string | number;
  recipeIngredient?: string[];
  recipeInstructions?: Array<string | { '@type'?: string; text?: string; name?: string }>;
  nutrition?: {
    calories?: string | number;
    fatContent?: string | number;
    carbohydrateContent?: string | number;
    proteinContent?: string | number;
    fiberContent?: string | number;
  };
}

function extractJsonLdRecipe(html: string): RecipeJsonLd | null {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < scripts.length; i++) {
    const text = $(scripts[i]).html();
    if (!text) continue;

    try {
      const data = JSON.parse(text);

      // Handle @graph wrapper (common in some sites)
      if (data['@graph'] && Array.isArray(data['@graph'])) {
        for (const item of data['@graph']) {
          if (isRecipeType(item)) return item as RecipeJsonLd;
        }
      }

      // Direct recipe object
      if (isRecipeType(data)) return data as RecipeJsonLd;

      // Array of objects
      if (Array.isArray(data)) {
        for (const item of data) {
          if (isRecipeType(item)) return item as RecipeJsonLd;
        }
      }
    } catch {
      // Invalid JSON - skip
      continue;
    }
  }

  return null;
}

function isRecipeType(obj: Record<string, unknown>): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const type = obj['@type'];
  if (typeof type === 'string') return type === 'Recipe';
  if (Array.isArray(type)) return type.includes('Recipe');
  return false;
}

// ---------------------------------------------------------------------------
// Transform JSON-LD into DB-ready data
// ---------------------------------------------------------------------------

interface RecipeData {
  name: string;
  description: string | null;
  cookingTimeMinutes: number | null;
  macronutrients: Record<string, number | null> | null;
  tags: string[];
  imageUrl: string | null;
  sourceUrl: string;
  servings: number | null;
  recipeCategory: string[];
  instructions: string[];
  ingredients: ParsedIngredient[];
}

function transformRecipe(jsonLd: RecipeJsonLd, sourceUrl: string): RecipeData | null {
  if (!jsonLd.name) return null;

  // Extract image URL
  let imageUrl: string | null = null;
  if (typeof jsonLd.image === 'string') {
    imageUrl = jsonLd.image;
  } else if (Array.isArray(jsonLd.image) && jsonLd.image.length > 0) {
    imageUrl = typeof jsonLd.image[0] === 'string' ? jsonLd.image[0] : null;
  } else if (jsonLd.image && typeof jsonLd.image === 'object' && 'url' in jsonLd.image) {
    imageUrl = jsonLd.image.url || null;
  }

  // Parse cooking time - prefer totalTime, fallback to cookTime
  const cookingTimeMinutes =
    parseDurationToMinutes(jsonLd.totalTime) ??
    parseDurationToMinutes(jsonLd.cookTime) ??
    null;

  // Parse nutrition
  let macronutrients: Record<string, number | null> | null = null;
  if (jsonLd.nutrition) {
    const n = jsonLd.nutrition;
    macronutrients = {
      calories: parseNutritionValue(n.calories),
      fatGrams: parseNutritionValue(n.fatContent),
      carbGrams: parseNutritionValue(n.carbohydrateContent),
      proteinGrams: parseNutritionValue(n.proteinContent),
      fiberGrams: parseNutritionValue(n.fiberContent),
    };
  }

  // Parse servings
  let servings: number | null = null;
  if (jsonLd.recipeYield) {
    const yieldStr = String(jsonLd.recipeYield);
    const yieldMatch = yieldStr.match(/(\d+)/);
    if (yieldMatch) {
      servings = parseInt(yieldMatch[1], 10);
    }
  }

  // Parse categories - split comma-separated strings
  let recipeCategory: string[] = [];
  if (typeof jsonLd.recipeCategory === 'string') {
    recipeCategory = jsonLd.recipeCategory
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
  } else if (Array.isArray(jsonLd.recipeCategory)) {
    recipeCategory = jsonLd.recipeCategory.flatMap((c) =>
      typeof c === 'string' ? c.split(',').map((s) => s.trim()).filter(Boolean) : []
    );
  }

  // Generate tags from category and cookingMethod
  const tags: string[] = [...recipeCategory];
  if (jsonLd.cookingMethod) {
    const methods = jsonLd.cookingMethod
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    tags.push(...methods);
  }
  // De-duplicate tags
  const uniqueTags = [...new Set(tags)];

  // Parse instructions
  let instructions: string[] = [];
  if (Array.isArray(jsonLd.recipeInstructions)) {
    instructions = jsonLd.recipeInstructions
      .map((step) => {
        if (typeof step === 'string') return step.trim();
        if (step && typeof step === 'object' && step.text) return step.text.trim();
        return '';
      })
      .filter(Boolean);
  }

  // Parse ingredients
  const ingredients: ParsedIngredient[] = (jsonLd.recipeIngredient || []).map(
    (raw) => parseSwedishIngredient(raw)
  );

  return {
    name: jsonLd.name,
    description: jsonLd.description?.trim() || null,
    cookingTimeMinutes,
    macronutrients,
    tags: uniqueTags,
    imageUrl,
    sourceUrl,
    servings,
    recipeCategory,
    instructions,
    ingredients,
  };
}

// ---------------------------------------------------------------------------
// Database insertion
// ---------------------------------------------------------------------------

async function insertRecipe(pool: Pool, recipe: RecipeData): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert recipe - ON CONFLICT skip duplicates by source_url
    const insertRecipeResult = await client.query(
      `INSERT INTO recipe (
        name, description, cooking_time_minutes, macronutrients,
        tags, image_url, source_url, servings, recipe_category,
        instructions, created_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10, NULL, NOW(), NOW()
      )
      ON CONFLICT (source_url) DO NOTHING
      RETURNING id`,
      [
        recipe.name,
        recipe.description,
        recipe.cookingTimeMinutes,
        recipe.macronutrients ? JSON.stringify(recipe.macronutrients) : null,
        recipe.tags,
        recipe.imageUrl,
        recipe.sourceUrl,
        recipe.servings,
        recipe.recipeCategory,
        recipe.instructions,
      ]
    );

    if (insertRecipeResult.rowCount === 0) {
      // Duplicate - already exists
      await client.query('ROLLBACK');
      return false;
    }

    const recipeId = insertRecipeResult.rows[0].id;

    // Insert ingredients
    for (const ing of recipe.ingredients) {
      await client.query(
        `INSERT INTO recipe_ingredient (
          recipe_id, ingredient_id, name, raw_text, quantity, unit
        ) VALUES ($1, NULL, $2, $3, $4, $5)`,
        [recipeId, ing.name, ing.rawText, ing.quantity, ing.unit]
      );
    }

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// URL Discovery: ICA.se
// ---------------------------------------------------------------------------

async function discoverIcaUrls(limit: number): Promise<string[]> {
  console.log('Discovering recipe URLs from ICA.se...');
  const urls: string[] = [];

  // ICA.se has a sitemap index - try the recipe-specific sitemap
  const sitemapUrls = [
    'https://www.ica.se/sitemap.xml',
  ];

  for (const sitemapUrl of sitemapUrls) {
    if (urls.length >= limit) break;

    try {
      console.log(`  Fetching sitemap: ${sitemapUrl}`);
      const response = await rateLimitedFetch(sitemapUrl);
      const xml = await response.text();
      const $ = cheerio.load(xml, { xmlMode: true });

      // Check if this is a sitemap index (contains other sitemaps)
      const sitemapLocs = $('sitemap > loc');
      if (sitemapLocs.length > 0) {
        // This is a sitemap index - find recipe-related sub-sitemaps
        const recipeSitemaps: string[] = [];
        sitemapLocs.each((_, el) => {
          const loc = $(el).text().trim();
          if (loc.includes('recept') || loc.includes('recipe')) {
            recipeSitemaps.push(loc);
          }
        });

        console.log(`  Found ${recipeSitemaps.length} recipe sitemap(s) in index`);

        for (const subSitemap of recipeSitemaps) {
          if (urls.length >= limit) break;
          try {
            console.log(`  Fetching sub-sitemap: ${subSitemap}`);
            const subResponse = await rateLimitedFetch(subSitemap);
            const subXml = await subResponse.text();
            const sub$ = cheerio.load(subXml, { xmlMode: true });

            sub$('url > loc').each((_, el) => {
              if (urls.length >= limit) return;
              const loc = sub$(el).text().trim();
              if (isIcaRecipeUrl(loc)) {
                urls.push(loc);
              }
            });

            console.log(`  Collected ${urls.length} URLs so far...`);
          } catch (err) {
            console.warn(`  Failed to fetch sub-sitemap ${subSitemap}:`, (err as Error).message);
          }
        }
      } else {
        // Direct sitemap with URLs
        $('url > loc').each((_, el) => {
          if (urls.length >= limit) return;
          const loc = $(el).text().trim();
          if (isIcaRecipeUrl(loc)) {
            urls.push(loc);
          }
        });
      }
    } catch (err) {
      console.warn(`  Failed to fetch sitemap ${sitemapUrl}:`, (err as Error).message);
    }
  }

  // Fallback: crawl category pages if sitemap didn't yield enough
  if (urls.length < limit) {
    console.log('  Supplementing with category page crawling...');
    const categoryUrls = [
      'https://www.ica.se/recept/middag/',
      'https://www.ica.se/recept/lunch/',
      'https://www.ica.se/recept/frukost/',
      'https://www.ica.se/recept/efterratt/',
      'https://www.ica.se/recept/vegetariskt/',
      'https://www.ica.se/recept/fisk-och-skaldjur/',
      'https://www.ica.se/recept/kyckling/',
      'https://www.ica.se/recept/pasta/',
      'https://www.ica.se/recept/soppor/',
      'https://www.ica.se/recept/sallad/',
      'https://www.ica.se/recept/bakning/',
    ];

    for (const catUrl of categoryUrls) {
      if (urls.length >= limit) break;
      try {
        const response = await rateLimitedFetch(catUrl);
        const html = await response.text();
        const $ = cheerio.load(html);

        $('a[href]').each((_, el) => {
          if (urls.length >= limit) return;
          const href = $(el).attr('href');
          if (href) {
            const fullUrl = href.startsWith('http')
              ? href
              : `https://www.ica.se${href}`;
            if (isIcaRecipeUrl(fullUrl) && !urls.includes(fullUrl)) {
              urls.push(fullUrl);
            }
          }
        });

        console.log(`  Collected ${urls.length} URLs after category crawl...`);
      } catch (err) {
        console.warn(`  Failed to crawl category ${catUrl}:`, (err as Error).message);
      }
    }
  }

  console.log(`  Discovered ${urls.length} ICA recipe URLs`);
  return urls.slice(0, limit);
}

function isIcaRecipeUrl(url: string): boolean {
  // ICA recipe URLs look like: https://www.ica.se/recept/kycklinggryta-med-curry-...
  // They are under /recept/ but not category listing pages
  return /^https:\/\/www\.ica\.se\/recept\/[a-z0-9-]+-\d+\/?$/.test(url);
}

// ---------------------------------------------------------------------------
// URL Discovery: Koket.se
// ---------------------------------------------------------------------------

async function discoverKoketUrls(limit: number): Promise<string[]> {
  console.log('Discovering recipe URLs from Koket.se...');
  const urls: string[] = [];

  // Try sitemap first
  const sitemapUrls = [
    'https://www.koket.se/sitemap.xml',
  ];

  for (const sitemapUrl of sitemapUrls) {
    if (urls.length >= limit) break;

    try {
      console.log(`  Fetching sitemap: ${sitemapUrl}`);
      const response = await rateLimitedFetch(sitemapUrl);
      const xml = await response.text();
      const $ = cheerio.load(xml, { xmlMode: true });

      // Check if sitemap index
      const sitemapLocs = $('sitemap > loc');
      if (sitemapLocs.length > 0) {
        const recipeSitemaps: string[] = [];
        sitemapLocs.each((_, el) => {
          const loc = $(el).text().trim();
          if (loc.includes('recept') || loc.includes('recipe') || loc.includes('koket')) {
            recipeSitemaps.push(loc);
          }
        });

        // If no recipe-specific sitemaps found, try all of them
        const sitemapsToTry = recipeSitemaps.length > 0
          ? recipeSitemaps
          : [];
        sitemapLocs.each((_, el) => {
          if (recipeSitemaps.length === 0) {
            sitemapsToTry.push($(el).text().trim());
          }
        });

        console.log(`  Found ${sitemapsToTry.length} sitemap(s) to check`);

        for (const subSitemap of sitemapsToTry) {
          if (urls.length >= limit) break;
          try {
            console.log(`  Fetching sub-sitemap: ${subSitemap}`);
            const subResponse = await rateLimitedFetch(subSitemap);
            const subXml = await subResponse.text();
            const sub$ = cheerio.load(subXml, { xmlMode: true });

            sub$('url > loc').each((_, el) => {
              if (urls.length >= limit) return;
              const loc = sub$(el).text().trim();
              if (isKoketRecipeUrl(loc)) {
                urls.push(loc);
              }
            });

            console.log(`  Collected ${urls.length} URLs so far...`);
          } catch (err) {
            console.warn(`  Failed to fetch sub-sitemap ${subSitemap}:`, (err as Error).message);
          }
        }
      } else {
        // Direct sitemap
        $('url > loc').each((_, el) => {
          if (urls.length >= limit) return;
          const loc = $(el).text().trim();
          if (isKoketRecipeUrl(loc)) {
            urls.push(loc);
          }
        });
      }
    } catch (err) {
      console.warn(`  Failed to fetch sitemap ${sitemapUrl}:`, (err as Error).message);
    }
  }

  // Fallback: crawl category pages
  if (urls.length < limit) {
    console.log('  Supplementing with category page crawling...');
    const categoryUrls = [
      'https://www.koket.se/recept/middag',
      'https://www.koket.se/recept/lunch',
      'https://www.koket.se/recept/frukost',
      'https://www.koket.se/recept/dessert',
      'https://www.koket.se/recept/vegetariskt',
      'https://www.koket.se/recept/fisk',
      'https://www.koket.se/recept/kyckling',
      'https://www.koket.se/recept/pasta',
      'https://www.koket.se/recept/soppa',
      'https://www.koket.se/recept/sallad',
      'https://www.koket.se/recept/bakning',
    ];

    for (const catUrl of categoryUrls) {
      if (urls.length >= limit) break;
      try {
        const response = await rateLimitedFetch(catUrl);
        const html = await response.text();
        const $ = cheerio.load(html);

        $('a[href]').each((_, el) => {
          if (urls.length >= limit) return;
          const href = $(el).attr('href');
          if (href) {
            const fullUrl = href.startsWith('http')
              ? href
              : `https://www.koket.se${href}`;
            if (isKoketRecipeUrl(fullUrl) && !urls.includes(fullUrl)) {
              urls.push(fullUrl);
            }
          }
        });

        console.log(`  Collected ${urls.length} URLs after category crawl...`);
      } catch (err) {
        console.warn(`  Failed to crawl category ${catUrl}:`, (err as Error).message);
      }
    }
  }

  console.log(`  Discovered ${urls.length} Koket recipe URLs`);
  return urls.slice(0, limit);
}

function isKoketRecipeUrl(url: string): boolean {
  // Koket.se recipe URLs look like: https://www.koket.se/recept-slug-name
  // or https://www.koket.se/some-recipe-name
  // Exclude category/tag listing pages and non-recipe paths
  const parsed = new URL(url);
  if (parsed.hostname !== 'www.koket.se') return false;

  const path = parsed.pathname;
  // Must have a path beyond just "/"
  if (path === '/' || path === '') return false;

  // Exclude known non-recipe paths
  const excludePrefixes = [
    '/recept/',  // category listings
    '/mat-och-dryck/',
    '/vin/',
    '/inspiration/',
    '/videorecept/',
    '/blogg/',
    '/om-koket/',
    '/sok/',
    '/ingrediens/',
  ];
  for (const prefix of excludePrefixes) {
    if (path.startsWith(prefix)) return false;
  }

  // Should be a top-level slug like /some-recipe-name
  const segments = path.split('/').filter(Boolean);
  if (segments.length !== 1) return false;

  // Should contain a hyphen (recipe slugs are multi-word)
  return segments[0].includes('-');
}

// ---------------------------------------------------------------------------
// Process a single recipe URL
// ---------------------------------------------------------------------------

async function processRecipeUrl(
  pool: Pool,
  url: string,
  index: number,
  total: number
): Promise<{ success: boolean; skipped: boolean; error?: string }> {
  try {
    const response = await rateLimitedFetch(url);
    const html = await response.text();

    const jsonLd = extractJsonLdRecipe(html);
    if (!jsonLd) {
      return { success: false, skipped: true, error: 'No JSON-LD Recipe found' };
    }

    const recipe = transformRecipe(jsonLd, url);
    if (!recipe) {
      return { success: false, skipped: true, error: 'Failed to transform recipe data' };
    }

    const inserted = await insertRecipe(pool, recipe);
    if (!inserted) {
      return { success: true, skipped: true, error: 'Duplicate (already exists)' };
    }

    return { success: true, skipped: false };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, skipped: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgs();
  console.log(`\nRecipe Crawler`);
  console.log(`==============`);
  console.log(`Source: ${args.source}`);
  console.log(`Limit:  ${args.limit}`);
  console.log('');

  const pool = createPool();

  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('Database connection established.\n');
  } catch (error) {
    console.error('Failed to connect to database:', (error as Error).message);
    console.error(
      'Make sure POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DATABASE, POSTGRES_USER, and POSTGRES_PASSWORD are set.'
    );
    process.exit(1);
  }

  // Discover URLs
  let allUrls: Array<{ url: string; source: string }> = [];

  if (args.source === 'ica' || args.source === 'all') {
    const icaLimit = args.source === 'all' ? Math.ceil(args.limit / 2) : args.limit;
    const icaUrls = await discoverIcaUrls(icaLimit);
    allUrls.push(...icaUrls.map((url) => ({ url, source: 'ica' })));
  }

  if (args.source === 'koket' || args.source === 'all') {
    const koketLimit = args.source === 'all' ? Math.floor(args.limit / 2) : args.limit;
    const koketUrls = await discoverKoketUrls(koketLimit);
    allUrls.push(...koketUrls.map((url) => ({ url, source: 'koket' })));
  }

  // Trim to limit
  allUrls = allUrls.slice(0, args.limit);

  if (allUrls.length === 0) {
    console.log('No recipe URLs discovered. Exiting.');
    await pool.end();
    return;
  }

  console.log(`\nStarting to crawl ${allUrls.length} recipe URLs...\n`);

  // Process each URL
  let crawled = 0;
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const { url, source } of allUrls) {
    crawled++;

    const result = await processRecipeUrl(pool, url, crawled, allUrls.length);

    if (result.success && !result.skipped) {
      inserted++;
    } else if (result.skipped) {
      skipped++;
    } else {
      errors++;
    }

    // Log progress every 10 recipes or on errors
    if (crawled % 10 === 0 || crawled === allUrls.length || (!result.success && !result.skipped)) {
      console.log(
        `Crawled ${crawled}/${allUrls.length} recipes ` +
          `(inserted: ${inserted}, skipped: ${skipped}, errors: ${errors}) ` +
          `[${source}]`
      );
    }

    if (!result.success && !result.skipped) {
      console.warn(`  ERROR on ${url}: ${result.error}`);
    }
  }

  // Final summary
  console.log(`\n==============`);
  console.log(`Crawl Complete`);
  console.log(`==============`);
  console.log(`Total crawled:  ${crawled}`);
  console.log(`Inserted:       ${inserted}`);
  console.log(`Skipped/dupes:  ${skipped}`);
  console.log(`Errors:         ${errors}`);

  await pool.end();
  console.log('\nDatabase connection closed.');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

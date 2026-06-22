// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Pull the credentials from the environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing Supabase URL or Service Key. Check your .env.local file.");
  process.exit(1);
}

// Initialize Supabase Admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ==========================================
// CONFIGURATION
// ==========================================
const BUCKET_NAME = 'inspiration-gallery';
const CATEGORY = 'decorations'; // Change this to 'mehendi', 'lehenga', etc.
const FOLDER_PATH = CATEGORY; // Assumes your storage folder is named the same as the category

async function syncStorageToDatabase() {
  console.log(`🔍 Scanning Supabase Storage for '${CATEGORY}' images...`);

  // 1. List all files currently in the specified folder in your bucket
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list(FOLDER_PATH, {
      limit: 500, // Adjust if you have more than 500 images in a single folder
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (listError) {
    console.error("❌ Failed to list files:", listError.message);
    return;
  }

  if (!files || files.length === 0) {
    console.log(`⚠️ No files found in the '${FOLDER_PATH}' folder.`);
    return;
  }

  console.log(`Found ${files.length} files. Starting database sync...\n`);
  let successCount = 0;

  // 2. Loop through the files and insert them into the database
  for (const file of files) {
    // Skip hidden files or folder placeholders Supabase sometimes creates
    if (file.name.startsWith('.') || file.name === '.emptyFolderPlaceholder') continue;

    const storagePath = `${FOLDER_PATH}/${file.name}`;

    // Get the public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);
      
    const publicUrl = publicUrlData.publicUrl;

    // Insert into the database
    const { error: dbError } = await supabase
      .from('inspiration_images')
      .insert([{ category: CATEGORY, image_url: publicUrl }]);

    if (dbError) {
      console.error(`❌ Failed to insert ${file.name}:`, dbError.message);
    } else {
      console.log(`✅ Synced: ${file.name}`);
      successCount++;
    }
  }

  console.log(`\n🎉 All done! Successfully synced ${successCount} images to the database.`);
}

// Run the script
syncStorageToDatabase();
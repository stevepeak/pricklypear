import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve('./react-email/emails');
const DEST_DIR = path.resolve('./supabase/functions/templates');

function prependJsxImport(source: string): string {
  const generatedComment = `/**
 * This is a generated file. Do not edit directly.
 * 
 * To make changes:
 * 1. Edit the original file in react-email/emails/
 * 2. Run 'bun run gen:emails' to regenerate this file
 */

`;
  const jsxComment = '/** @jsxImportSource npm:react */\n';

  // Replace @react-email/components imports with npm:@react-email/components
  const updatedSource = source.replace(
    /from ['"]@react-email\/components['"]/g,
    "from 'npm:@react-email/components'"
  );

  const withJsxImport = updatedSource.startsWith('/** @jsxImportSource')
    ? updatedSource
    : jsxComment + updatedSource;

  return generatedComment + withJsxImport;
}

function copyAndRewriteTemplates() {
  if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f: string) => f.endsWith('.tsx'));

  files.forEach((file: string) => {
    const srcPath = path.join(SRC_DIR, file);
    const destPath = path.join(DEST_DIR, file);

    let content = fs.readFileSync(srcPath, 'utf8');
    content = prependJsxImport(content);

    fs.writeFileSync(destPath, content);
    console.log(`✅ Synced: ${file}`);
  });
}

copyAndRewriteTemplates();

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const PUBLIC = path.join(__dirname, 'public');
const LOGOS_SRC = path.join(__dirname, 'logos');

// Page configurations
const PAGES = [
  {
    slug: 'index',
    title: 'The Hi Vis Bookkeeper | Bookkeeping for Trades & Construction',
    description: 'Specialist bookkeeping, VAT, CIS and Making Tax Digital support for sole traders, contractors and construction businesses across the UK. Xero certified. Accurate books, stronger business.',
    activeNav: 'home'
  },
  {
    slug: 'bookkeeping',
    title: 'Bookkeeping Services | The Hi Vis Bookkeeper',
    description: 'Professional Xero bookkeeping, Making Tax Digital submissions and monthly management reporting for sole traders, contractors and small businesses across the UK.',
    activeNav: 'services'
  },
  {
    slug: 'services',
    title: 'Services & Pricing | The Hi Vis Bookkeeper',
    description: 'Bookkeeping, VAT, CIS, clean-up and compliance health check pricing for tradespeople, contractors and construction businesses across the UK. Clear guide prices.',
    activeNav: 'services'
  },
  {
    slug: 'construction',
    title: 'Construction & CIS Bookkeeping | The Hi Vis Bookkeeper',
    description: 'Bookkeeping, CIS and HMRC compliance for contractors, subcontractors and construction businesses across the UK. No jargon, no judgement, just reliable support.',
    activeNav: 'services'
  },
  {
    slug: 'vat',
    title: 'VAT Returns & Making Tax Digital | The Hi Vis Bookkeeper',
    description: 'Professional VAT return services, digital bookkeeping and Making Tax Digital support for sole traders and small businesses across the UK, using Xero.',
    activeNav: 'services'
  },
  {
    slug: 'about',
    title: 'About | The Hi Vis Bookkeeper',
    description: 'Meet Sarah and the crew at The Hi Vis Bookkeeper. Specialist bookkeeping for construction, trades and contractor businesses, based in Stockport and serving the UK.',
    activeNav: 'about'
  }
];

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy directory recursively
function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function build() {
  console.log('Building Hi Vis Bookkeeper website...\n');

  // Ensure public directory exists
  ensureDir(PUBLIC);

  // Read partials
  const partials = {
    head: fs.readFileSync(path.join(SRC, 'partials', 'head.html'), 'utf8'),
    brushbar: fs.readFileSync(path.join(SRC, 'partials', 'brushbar.html'), 'utf8'),
    header: fs.readFileSync(path.join(SRC, 'partials', 'header.html'), 'utf8'),
    footer: fs.readFileSync(path.join(SRC, 'partials', 'footer.html'), 'utf8'),
    loginModal: fs.readFileSync(path.join(SRC, 'partials', 'login-modal.html'), 'utf8')
  };

  let warnings = [];

  // Build each page
  for (const page of PAGES) {
    const content = fs.readFileSync(path.join(SRC, 'pages', `${page.slug}.html`), 'utf8');

    // Process header to mark active nav
    let header = partials.header;
    if (page.activeNav === 'home') {
      header = header.replace('data-nav="home"', 'data-nav="home" class="active"');
    } else if (page.activeNav === 'services') {
      header = header.replace('data-nav="services"', 'data-nav="services" class="active"');
    } else if (page.activeNav === 'about') {
      header = header.replace('data-nav="about"', 'data-nav="about" class="active"');
    }

    // Assemble full page
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
${partials.head.replace('{{title}}', page.title).replace('{{description}}', page.description)}
</head>
<body>
${partials.brushbar}
${header}
${content}
${partials.footer}
${partials.loginModal}
<script src="site.js"></script>
</body>
</html>`;

    // Check for em-dashes
    if (html.includes('\u2014')) {
      warnings.push(`Em-dash found in ${page.slug}.html`);
    }

    // Write output
    fs.writeFileSync(path.join(PUBLIC, `${page.slug}.html`), html);
    console.log(`  Built ${page.slug}.html`);
  }

  // Copy CSS
  fs.copyFileSync(
    path.join(SRC, 'css', 'styles.css'),
    path.join(PUBLIC, 'styles.css')
  );
  console.log('  Copied styles.css');

  // Copy JS
  fs.copyFileSync(
    path.join(SRC, 'js', 'site.js'),
    path.join(PUBLIC, 'site.js')
  );
  console.log('  Copied site.js');

  // Copy logos
  const logosPublic = path.join(PUBLIC, 'logos');
  ensureDir(logosPublic);

  if (fs.existsSync(LOGOS_SRC)) {
    const logoFiles = fs.readdirSync(LOGOS_SRC);
    let logoCount = 0;
    for (const file of logoFiles) {
      const srcPath = path.join(LOGOS_SRC, file);
      const stat = fs.statSync(srcPath);
      if (stat.isFile() && (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.ico'))) {
        fs.copyFileSync(srcPath, path.join(logosPublic, file));
        logoCount++;
      }
    }
    console.log(`  Copied ${logoCount} logo files`);
  } else {
    console.log('  Warning: logos directory not found');
  }

  console.log('\nBuild complete!');

  // Print warnings
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  // Summary
  console.log(`\nOutput: ${PUBLIC}`);
  console.log('Run "npm run serve" to preview locally');
}

// Run build
build();

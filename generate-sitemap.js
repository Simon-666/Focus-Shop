const fs = require('fs');
const path = require('path');

/**
 * Focus Shop Sitemap Generator
 * This script automatically rebuilds the sitemap.xml based on the content in blogs.js
 */

try {
    const blogsFilePath = path.join(__dirname, 'blogs.js');
    const blogsContent = fs.readFileSync(blogsFilePath, 'utf8');
    const blogsMatch = blogsContent.match(/const blogs = (\[[\s\S]*?\]);/);
    
    if (!blogsMatch) {
        throw new Error('Could not find blogs array in blogs.js');
    }
    
    let blogs;
    try {
        blogs = JSON.parse(blogsMatch[1]);
    } catch (e) {
        blogs = eval(blogsMatch[1]);
    }
    
    const baseUrl = 'https://simon-666.github.io/Focus-Shop/';
    const today = new Date().toISOString().split('T')[0];
    
    const urls = [
        { loc: baseUrl, lastmod: today, changefreq: 'weekly', priority: '1.0' },
        { loc: `${baseUrl}blog.html`, lastmod: today, changefreq: 'weekly', priority: '0.8' }
    ];

    blogs.forEach(blog => {
        urls.push({
            loc: `${baseUrl}blog.html?slug=${blog.slug}`,
            lastmod: today,
            changefreq: 'monthly',
            priority: '0.7'
        });
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset\n';
    xml += '      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
    xml += '            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

    urls.forEach(url => {
        xml += '  <url>\n';
        xml += `    <loc>${url.loc}</loc>\n`;
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
        xml += `    <priority>${url.priority}</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>\n';
    
    fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xml, 'utf8');
    
    console.log(`✅ Success! Sitemap rebuilt with ${blogs.length} blog posts.`);

} catch (error) {
    console.error('❌ Error:', error.message);
}

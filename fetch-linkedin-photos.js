const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

// Lire les membres
const membersData = JSON.parse(fs.readFileSync('data/members.json', 'utf-8'));

// Fonction pour télécharger une image
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filepath);
        
        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(filepath);
                });
            } else {
                fs.unlink(filepath, () => {});
                reject(new Error(`Failed to download: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

// Fonction pour extraire l'URL de la photo depuis OpenGraph
async function fetchLinkedInPhoto(linkedinUrl) {
    return new Promise((resolve, reject) => {
        if (!linkedinUrl) {
            return resolve(null);
        }

        const url = new URL(linkedinUrl);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ResonnanceBot/1.0)'
            }
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                // Extraire l'URL de l'image OpenGraph
                const ogImageMatch = data.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
                if (ogImageMatch) {
                    resolve(ogImageMatch[1]);
                } else {
                    resolve(null);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log('🔍 Récupération des photos LinkedIn...\n');
    
    let updated = 0;
    
    for (const member of membersData) {
        if (!member.linkedin) {
            console.log(`⏭️  ${member.name}: pas de LinkedIn`);
            continue;
        }
        
        if (member.photo && member.photo.startsWith('http')) {
            console.log(`✓ ${member.name}: photo déjà présente`);
            continue;
        }
        
        try {
            console.log(`🔄 ${member.name}: récupération...`);
            const photoUrl = await fetchLinkedInPhoto(member.linkedin);
            
            if (photoUrl) {
                // Créer le nom de fichier
                const filename = member.name.toLowerCase()
                    .replace(/[àáâãäå]/g, 'a')
                    .replace(/[èéêë]/g, 'e')
                    .replace(/[ìíîï]/g, 'i')
                    .replace(/[òóôõö]/g, 'o')
                    .replace(/[ùúûü]/g, 'u')
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9\-]/g, '') + '.jpg';
                
                const filepath = path.join('Photos Membres', filename);
                
                // Télécharger l'image
                await downloadImage(photoUrl, filepath);
                
                // Mettre à jour le membre
                member.photo = `Photos Membres/${filename}`;
                updated++;
                
                console.log(`✅ ${member.name}: photo enregistrée (${filename})`);
            } else {
                console.log(`❌ ${member.name}: photo non trouvée`);
            }
            
            // Pause pour éviter de surcharger LinkedIn
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.log(`❌ ${member.name}: erreur - ${error.message}`);
        }
    }
    
    // Sauvegarder les données mises à jour
    if (updated > 0) {
        fs.writeFileSync('data/members.json', JSON.stringify(membersData, null, 2));
        console.log(`\n✅ ${updated} photo(s) récupérée(s) et data/members.json mis à jour`);
    } else {
        console.log('\n⚠️  Aucune nouvelle photo récupérée');
    }
}

main().catch(console.error);

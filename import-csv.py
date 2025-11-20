import csv
import json
import os

# Lire le CSV
members = []
files = [f for f in os.listdir('.') if 'club' in f.lower() and f.endswith('.csv')]

with open(files[0], 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    member_id = 7  # Commencer à partir de l'ID 7
    
    for row in reader:
        if not row.get('Prénom') or not row.get('Nom'):
            continue
            
        name = f"{row.get('Prénom', '')} {row.get('Nom', '')}".strip()
        company = row.get('Nom société', '').strip()
        category = row.get('Domaine', '').strip()
        phone = row.get('Portable', '').strip()
        email = row.get('Adresse mail', '').strip()
        address = row.get('Adresse postale', '').strip()
        linkedin = row.get('Lien Linkedin', '').strip()
        website = row.get('Site Web', '').strip()
        
        # Construire la bio
        bio_parts = []
        if phone:
            bio_parts.append(f"Tél: {phone}")
        if email:
            bio_parts.append(f"Email: {email}")
        if address:
            bio_parts.append(f"{address}")
        
        member = {
            "id": member_id,
            "name": name,
            "company": company,
            "category": category,
            "role": "",
            "photo": "",
            "bio": " • ".join(bio_parts),
            "linkedin": linkedin,
            "website": website
        }
        
        members.append(member)
        member_id += 1

# Sauvegarder
with open('data/members.json', 'w', encoding='utf-8') as f:
    json.dump(members, f, indent=2, ensure_ascii=False)

print(f"✓ {len(members)} membres importés avec succès")
print(f"\nPremiers membres:")
for m in members[:3]:
    print(f"- {m['name']} ({m['company']})")
    if m['website']:
        print(f"  Site: {m['website']}")

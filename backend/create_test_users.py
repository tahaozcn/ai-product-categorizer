import sqlite3
import bcrypt

def create_test_users():
    """Create test users in the database."""
    conn = sqlite3.connect('products.db')
    c = conn.cursor()
    
    # Test kullanıcıları - 2 ana test hesabı
    test_users = [
        {
            'email': 'admin@admin.com',
            'password': 'adminadmin',
            'role': 'seller',
            'name_surname': 'Admin Admin',
            'address': 'Platform Headquarters',
            'phone': '+90 555 000 0000'
        },
        {
            'email': 'user@user.com',
            'password': 'usersuser',
            'role': 'customer',
            'name_surname': 'Test User',
            'address': '456 Test Ave, City',
            'phone': '+90 555 333 3333'
        }
    ]
    
    created_count = 0
    updated_count = 0
    
    for user in test_users:
        # Önce kullanıcının zaten var olup olmadığını kontrol et
        c.execute('SELECT id FROM users WHERE email = ?', (user['email'],))
        if c.fetchone():
            # Mevcut kullanıcının role'ünü güncelle
            c.execute('UPDATE users SET role = ? WHERE email = ?', (user['role'], user['email']))
            updated_count += 1
            continue
        
        # Şifreyi hash'le
        hashed_password = bcrypt.hashpw(user['password'].encode('utf-8'), bcrypt.gensalt())
        
        # Kullanıcıyı ekle
        c.execute('''
            INSERT INTO users (email, password_hash, role, name_surname, address, phone)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            user['email'],
            hashed_password,
            user['role'],
            user['name_surname'],
            user['address'],
            user['phone']
        ))
        created_count += 1
    
    conn.commit()
    conn.close()
    
    print(f"Database initialization completed!")
    print(f"  • Created: {created_count} new users")
    print(f"  • Updated: {updated_count} existing users")
    print(f"  • Total test accounts: {len(test_users)}")
    print(f"\n📋 Test Accounts:")
    print(f"  🏪 Platform Seller: admin@admin.com / adminadmin")
    print(f"  🛍️ Personal Customer: user@user.com / usersuser")

if __name__ == '__main__':
    create_test_users() 
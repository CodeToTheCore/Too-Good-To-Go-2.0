# import sqlite3

# def clean_bad_image_urls():
#     # Connect to your development database
#     conn = sqlite3.connect("tgtg_dev.db")
#     cursor = conn.cursor()
    
#     print("Checking database for dead image endpoints...")
    
#     # Update stores setting cover_url to NULL if it points to a dead domain
#     cursor.execute("""
#         UPDATE stores 
#         SET cover_url = NULL 
#         WHERE cover_url LIKE '%unsplash.com%' 
#            OR cover_url LIKE '%placeholder.com%'
#     """)
    
#     print(f"Rows cleaned up: {cursor.rowcount}")
    
#     conn.commit()
#     conn.close()
#     print("Database image paths cleaned successfully!")

# if __name__ == "__main__":
#     clean_bad_image_urls()
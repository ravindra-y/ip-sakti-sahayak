import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

from app.database.connection import SessionLocal, init_db
from app.database.crud import create_document_metadata

INDIA_SOURCES = [
    {"title": "Patents Act, 1970 (amended 2005)", "source": "Ministry of Law and Justice", "category": "PATENT", "authority": "Government of India", "document_type": "Act", "version": "2005"},
    {"title": "Drugs and Cosmetics Act, 1940", "source": "Ministry of Health", "category": "REGULATORY", "authority": "Government of India", "document_type": "Act", "version": "1940"},
    {"title": "Biological Diversity Act, 2002", "source": "Ministry of Environment", "category": "ABS", "authority": "Government of India", "document_type": "Act", "version": "2002"},
    {"title": "Trade Marks Act, 1999", "source": "Ministry of Law and Justice", "category": "TRADEMARK", "authority": "Government of India", "document_type": "Act", "version": "1999"},
    {"title": "Geographical Indications of Goods (Registration and Protection) Act, 1999", "source": "Ministry of Law and Justice", "category": "GEOGRAPHICAL_INDICATION", "authority": "Government of India", "document_type": "Act", "version": "1999"},
    {"title": "The Designs Act, 2000", "source": "Ministry of Law and Justice", "category": "DESIGN", "authority": "Government of India", "document_type": "Act", "version": "2000"},
    {"title": "Copyright Act, 1957", "source": "Ministry of Law and Justice", "category": "COPYRIGHT", "authority": "Government of India", "document_type": "Act", "version": "1957"},
    {"title": "TKDL (Traditional Knowledge Digital Library)", "source": "CSIR", "category": "TRADITIONAL_KNOWLEDGE", "authority": "Government of India", "document_type": "Database", "version": "Current"},
    {"title": "Ayurvedic, Siddha and Unani Drugs Technical Advisory Board", "source": "Ministry of AYUSH", "category": "REGULATORY", "authority": "Government of India", "document_type": "Guidelines", "version": "Current"},
    {"title": "Ministry of AYUSH Guidelines", "source": "Ministry of AYUSH", "category": "REGULATORY", "authority": "Government of India", "document_type": "Guidelines", "version": "Current"}
]

INTERNATIONAL_SOURCES = [
    {"title": "TRIPS Agreement (WTO)", "source": "WTO", "category": "GENERAL", "authority": "WTO", "document_type": "Agreement", "version": "1995"},
    {"title": "Convention on Biological Diversity (CBD)", "source": "UN", "category": "ABS", "authority": "UN", "document_type": "Treaty", "version": "1992"},
    {"title": "Nagoya Protocol", "source": "UN", "category": "ABS", "authority": "UN", "document_type": "Protocol", "version": "2010"},
    {"title": "WIPO Convention", "source": "WIPO", "category": "GENERAL", "authority": "WIPO", "document_type": "Convention", "version": "1967"},
    {"title": "Patent Cooperation Treaty (PCT)", "source": "WIPO", "category": "PATENT", "authority": "WIPO", "document_type": "Treaty", "version": "1970"}
]

def main():
    print("Initializing database...")
    init_db()
    db = SessionLocal()
    
    try:
        print("Seeding India sources...")
        for source in INDIA_SOURCES:
            create_document_metadata(
                db,
                jurisdiction="india",
                chunk_count=0,
                **source
            )
            
        print("Seeding International sources...")
        for source in INTERNATIONAL_SOURCES:
            create_document_metadata(
                db,
                jurisdiction="international",
                chunk_count=0,
                **source
            )
            
        print("Database seeded successfully with authoritative sources!")
        
    except Exception as e:
        print(f"Error seeding database: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    main()

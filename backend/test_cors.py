"""Script de test pour vérifier la configuration CORS"""
import urllib.request
import urllib.parse
import json

def test_cors():
    url = "http://localhost:8000/auth/token"
    
    # Test de la requête OPTIONS (preflight)
    print("=" * 60)
    print("Test de la requête OPTIONS (preflight)...")
    print("=" * 60)
    try:
        req = urllib.request.Request(
            url,
            method="OPTIONS",
            headers={
                "Origin": "http://localhost:8081",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type"
            }
        )
        response = urllib.request.urlopen(req, timeout=5)
        print(f"✓ Status: {response.getcode()}")
        print(f"\nHeaders CORS dans la réponse:")
        cors_headers_found = False
        for key, value in response.headers.items():
            if 'access-control' in key.lower() or 'cors' in key.lower():
                print(f"  ✓ {key}: {value}")
                cors_headers_found = True
        if not cors_headers_found:
            print("  ⚠ Aucun header CORS trouvé (mais ce n'est pas grave si POST fonctionne)")
    except urllib.error.HTTPError as e:
        print(f"⚠ Status HTTP: {e.code}")
        print("  (Ce n'est pas grave, continuons avec le test POST)")
        # Vérifier quand même les headers
        print(f"\nHeaders dans la réponse:")
        for key, value in e.headers.items():
            if 'access-control' in key.lower() or 'cors' in key.lower():
                print(f"  ✓ {key}: {value}")
    except urllib.error.URLError as e:
        print(f"✗ ERREUR DE CONNEXION: {e}")
        print("  Le backend n'est probablement pas démarré ou n'est pas accessible.")
        return
    except Exception as e:
        print(f"⚠ ERREUR: {e} (continuons avec le test POST)")
    
    # Test de la requête POST
    print("\n" + "=" * 60)
    print("Test de la requête POST (login)...")
    print("=" * 60)
    try:
        data = urllib.parse.urlencode({
            "username": "user1",
            "password": "user123",
            "grant_type": "password"
        }).encode('utf-8')
        
        req = urllib.request.Request(
            url,
            data=data,
            method="POST",
            headers={
                "Origin": "http://localhost:8080",  # Tester avec le port 8080
                "Content-Type": "application/x-www-form-urlencoded"
            }
        )
        response = urllib.request.urlopen(req, timeout=5)
        print(f"✓ Status: {response.getcode()}")
        print(f"\nTOUS les headers de la réponse:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
        
        print(f"\nHeaders CORS spécifiquement:")
        cors_headers_found = False
        allow_origin_found = False
        for key, value in response.headers.items():
            if 'access-control' in key.lower() or 'cors' in key.lower():
                print(f"  ✓ {key}: {value}")
                cors_headers_found = True
                if 'access-control-allow-origin' in key.lower():
                    allow_origin_found = True
        if not cors_headers_found:
            print("  ✗ AUCUN HEADER CORS TROUVÉ !")
        elif not allow_origin_found:
            print("  ✗ ATTENTION: access-control-allow-origin MANQUANT !")
        
        response_data = json.loads(response.read().decode('utf-8'))
        print(f"\n✓ Réponse reçue: {json.dumps(response_data, indent=2)}")
        print("\n✓ La connexion fonctionne !")
    except urllib.error.HTTPError as e:
        print(f"✗ Status HTTP: {e.code}")
        print(f"✗ Réponse: {e.read().decode('utf-8')}")
        print(f"\nHeaders CORS dans la réponse d'erreur:")
        cors_headers_found = False
        for key, value in e.headers.items():
            if 'access-control' in key.lower() or 'cors' in key.lower():
                print(f"  ✓ {key}: {value}")
                cors_headers_found = True
        if not cors_headers_found:
            print("  ✗ AUCUN HEADER CORS TROUVÉ !")
    except urllib.error.URLError as e:
        print(f"✗ ERREUR: {e}")
        print("  Le backend n'est probablement pas démarré ou n'est pas accessible.")
    except Exception as e:
        print(f"✗ ERREUR: {e}")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("TEST DE CONFIGURATION CORS")
    print("=" * 60 + "\n")
    test_cors()
    print("\n" + "=" * 60)


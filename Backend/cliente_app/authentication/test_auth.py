"""
Script de prueba para el sistema de autenticación.
Ejecutar con: python test_auth.py

Este script verifica que los endpoints de autenticación funcionen correctamente.
"""

import requests
import json

# Configuración
BASE_URL = 'http://localhost:8000/api/auth'

# Colores para la terminal
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

def test_login_success():
    """Prueba de login exitoso"""
    print_info("Probando login exitoso...")

    url = f"{BASE_URL}/login"
    payload = {
        "username": "admin",
        "password": "admin123"
    }

    try:
        response = requests.post(url, json=payload)
        data = response.json()

        if response.status_code == 200 and data.get('success'):
            print_success(f"Login exitoso: {data['message']}")
            print_info(f"Token: {data['data']['token'][:20]}...")
            print_info(f"Usuario: {data['data']['user']['username']}")
            return data['data']['token']
        else:
            print_error(f"Login falló: {data.get('message', 'Error desconocido')}")
            return None

    except requests.exceptions.ConnectionError:
        print_error("No se pudo conectar al servidor. ¿Está ejecutándose?")
        return None
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return None

def test_login_invalid_credentials():
    """Prueba de login con credenciales inválidas"""
    print_info("Probando login con credenciales inválidas...")

    url = f"{BASE_URL}/login"
    payload = {
        "username": "admin",
        "password": "wrongpassword"
    }

    try:
        response = requests.post(url, json=payload)
        data = response.json()

        if response.status_code == 400 and not data.get('success'):
            print_success("Credenciales inválidas rechazadas correctamente")
        else:
            print_error("Error: Las credenciales inválidas no fueron rechazadas")

    except Exception as e:
        print_error(f"Error: {str(e)}")

def test_login_with_email():
    """Prueba de login con email"""
    print_info("Probando login con email...")

    url = f"{BASE_URL}/login"
    payload = {
        "email": "admin@pasteleria.com",
        "password": "admin123"
    }

    try:
        response = requests.post(url, json=payload)
        data = response.json()

        if response.status_code == 200 and data.get('success'):
            print_success("Login con email exitoso")
        else:
            print_warning("Login con email falló (puede que el email no esté configurado)")

    except Exception as e:
        print_error(f"Error: {str(e)}")

def test_get_current_user(token):
    """Prueba de obtener usuario actual"""
    print_info("Probando obtener usuario actual...")

    url = f"{BASE_URL}/user"
    headers = {
        "Authorization": f"Token {token}"
    }

    try:
        response = requests.get(url, headers=headers)
        data = response.json()

        if response.status_code == 200 and data.get('success'):
            print_success("Usuario obtenido correctamente")
            print_info(f"Username: {data['data']['username']}")
            print_info(f"Email: {data['data']['email']}")
            print_info(f"Is staff: {data['data']['is_staff']}")
        else:
            print_error(f"Error obteniendo usuario: {data.get('message')}")

    except Exception as e:
        print_error(f"Error: {str(e)}")

def test_get_user_without_token():
    """Prueba de obtener usuario sin token"""
    print_info("Probando obtener usuario sin token...")

    url = f"{BASE_URL}/user"

    try:
        response = requests.get(url)
        data = response.json()

        if response.status_code == 401:
            print_success("Solicitud sin token rechazada correctamente")
        else:
            print_error("Error: La solicitud sin token no fue rechazada")

    except Exception as e:
        print_error(f"Error: {str(e)}")

def test_logout(token):
    """Prueba de logout"""
    print_info("Probando logout...")

    url = f"{BASE_URL}/logout"
    headers = {
        "Authorization": f"Token {token}"
    }

    try:
        response = requests.post(url, headers=headers)
        data = response.json()

        if response.status_code == 200 and data.get('success'):
            print_success("Logout exitoso")
        else:
            print_error(f"Logout falló: {data.get('message')}")

    except Exception as e:
        print_error(f"Error: {str(e)}")

def test_use_token_after_logout(token):
    """Prueba de usar token después de logout"""
    print_info("Probando usar token después de logout...")

    url = f"{BASE_URL}/user"
    headers = {
        "Authorization": f"Token {token}"
    }

    try:
        response = requests.get(url, headers=headers)
        data = response.json()

        if response.status_code == 401:
            print_success("Token invalidado correctamente después de logout")
        else:
            print_error("Error: El token sigue siendo válido después de logout")

    except Exception as e:
        print_error(f"Error: {str(e)}")

def main():
    print("\n" + "="*60)
    print("PRUEBAS DEL SISTEMA DE AUTENTICACIÓN")
    print("="*60 + "\n")

    print_warning("NOTA: Asegúrate de que el servidor esté ejecutándose en http://localhost:8000")
    print_warning("NOTA: Debe existir un usuario 'admin' con password 'admin123'\n")

    # Ejecutar pruebas
    print("\n--- Pruebas de Login ---\n")
    token = test_login_success()

    if not token:
        print_error("\nNo se pudo obtener token. Abortando pruebas.")
        print_info("\nAsegúrate de:")
        print_info("1. El servidor está ejecutándose: python manage.py runserver")
        print_info("2. Existe un usuario admin con password admin123")
        return

    print()
    test_login_invalid_credentials()
    print()
    test_login_with_email()

    print("\n--- Pruebas de Usuario ---\n")
    test_get_current_user(token)
    print()
    test_get_user_without_token()

    print("\n--- Pruebas de Logout ---\n")
    test_logout(token)
    print()
    test_use_token_after_logout(token)

    print("\n" + "="*60)
    print("PRUEBAS COMPLETADAS")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()

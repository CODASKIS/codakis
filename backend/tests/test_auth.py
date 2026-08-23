def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_register_candidat_and_login(client):
    register = client.post(
        "/api/v1/auth/register/candidat",
        json={
            "email": "candidat@test.cm",
            "password": "Password123!",
            "full_name": "Jean Dupont",
            "phone": "+237600000000",
            "city": "Douala",
            "country_code": "CM",
            "langue": "fr",
        },
    )
    assert register.status_code == 200
    assert "access_token" in register.json()

    me = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {register.json()['access_token']}"})
    assert me.status_code == 200
    assert me.json()["role"] == "candidat"


def test_auto_ecole_pending_until_admin_validates(client, admin_headers):
    register = client.post(
        "/api/v1/auth/register/auto-ecole",
        json={
            "email": "gerant@test.cm",
            "password": "Password123!",
            "full_name": "Marie Gerant",
            "phone": "+237611111111",
            "city": "Yaoundé",
            "country_code": "CM",
            "langue": "fr",
            "school_name": "Auto École Test",
            "school_address": "123 Avenue Principale",
            "mint_registration": "MINT-12345",
        },
    )
    assert register.status_code == 200

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "gerant@test.cm", "password": "Password123!"},
    )
    assert login.status_code == 401

    pending = client.get("/api/v1/admin/auto-ecoles/pending", headers=admin_headers)
    assert pending.status_code == 200
    schools = pending.json()
    assert len(schools) == 1
    school_id = schools[0]["id"]

    validate = client.post(f"/api/v1/admin/auto-ecoles/{school_id}/valider", headers=admin_headers)
    assert validate.status_code == 200

    login_ok = client.post(
        "/api/v1/auth/login",
        json={"email": "gerant@test.cm", "password": "Password123!"},
    )
    assert login_ok.status_code == 200
    assert login_ok.json()["access_token"]


def test_auto_ecole_reject_sends_email_and_blocks_login(client, admin_headers):
    register = client.post(
        "/api/v1/auth/register/auto-ecole",
        json={
            "email": "refused@test.cm",
            "password": "Password123!",
            "full_name": "Paul Refused",
            "phone": "+237622222222",
            "city": "Douala",
            "country_code": "CM",
            "langue": "fr",
            "school_name": "Auto École Refusée",
            "school_address": "456 Rue Secondaire",
            "mint_registration": "MINT-99999",
        },
    )
    assert register.status_code == 200

    all_schools = client.get("/api/v1/admin/auto-ecoles", headers=admin_headers)
    assert all_schools.status_code == 200
    school = next(item for item in all_schools.json() if item["gerant_email"] == "refused@test.cm")
    assert school["status"] == "pending"

    reject = client.post(
        f"/api/v1/admin/auto-ecoles/{school['id']}/refuser",
        headers=admin_headers,
        json={"message": "Dossier incomplet : agrément non vérifiable."},
    )
    assert reject.status_code == 200

    pending = client.get("/api/v1/admin/auto-ecoles/pending", headers=admin_headers).json()
    assert not any(item["id"] == school["id"] for item in pending)

    updated = client.get("/api/v1/admin/auto-ecoles", headers=admin_headers).json()
    rejected = next(item for item in updated if item["id"] == school["id"])
    assert rejected["status"] == "rejected"
    assert rejected["motif_refus"] == "Dossier incomplet : agrément non vérifiable."

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "refused@test.cm", "password": "Password123!"},
    )
    assert login.status_code == 401


def test_forgot_password_otp_flow(client):
    client.post(
        "/api/v1/auth/register/candidat",
        json={
            "email": "reset@test.cm",
            "password": "Password123!",
            "full_name": "Reset User",
            "country_code": "CM",
        },
    )

    forgot = client.post("/api/v1/auth/forgot-password", json={"email": "reset@test.cm"})
    assert forgot.status_code == 200
    otp = forgot.json().get("debug_otp")
    assert otp

    reset = client.post(
        "/api/v1/auth/reset-password",
        json={"email": "reset@test.cm", "otp": otp, "new_password": "NewPassword123!"},
    )
    assert reset.status_code == 200

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "reset@test.cm", "password": "NewPassword123!"},
    )
    assert login.status_code == 200


def test_admin_user_crud(client, admin_headers):
    create = client.post(
        "/api/v1/admin/users",
        json={
            "email": "moniteur@test.cm",
            "role": "moniteur",
            "first_name": "Paul",
            "last_name": "Moniteur",
            "country_code": "CM",
        },
        headers=admin_headers,
    )
    assert create.status_code == 201
    user_id = create.json()["id"]

    update = client.patch(
        f"/api/v1/admin/users/{user_id}",
        json={"first_name": "Pierre"},
        headers=admin_headers,
    )
    assert update.status_code == 200
    assert update.json()["first_name"] == "Pierre"

    listing = client.get("/api/v1/admin/users", headers=admin_headers)
    assert listing.status_code == 200
    assert any(user["id"] == user_id for user in listing.json())


def test_gerant_create_moniteur(client, admin_headers):
    client.post(
        "/api/v1/auth/register/auto-ecole",
        json={
            "email": "gerant2@test.cm",
            "password": "Password123!",
            "full_name": "Gerant Two",
            "phone": "+237622222222",
            "city": "Douala",
            "country_code": "CM",
            "langue": "fr",
            "school_name": "École Two",
            "school_address": "456 Rue Secondaire",
            "mint_registration": "MINT-99999",
        },
    )
    pending = client.get("/api/v1/admin/auto-ecoles/pending", headers=admin_headers).json()
    client.post(f"/api/v1/admin/auto-ecoles/{pending[0]['id']}/valider", headers=admin_headers)

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "gerant2@test.cm", "password": "Password123!"},
    )
    gerant_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    moniteur = client.post(
        "/api/v1/gerant/moniteurs",
        json={
            "email": "moniteur.ecole@test.cm",
            "first_name": "Luc",
            "last_name": "Moniteur",
        },
        headers=gerant_headers,
    )
    assert moniteur.status_code == 201
    body = moniteur.json()
    assert body["email"] == "moniteur.ecole@test.cm"
    assert body["temp_password"] is not None


def test_auto_ecole_registration_stores_profile_fields(client, admin_headers):
    register = client.post(
        "/api/v1/auth/register/auto-ecole",
        json={
            "email": "profile@test.cm",
            "password": "Password123!",
            "full_name": "Alice Gerant",
            "phone": "+237633333333",
            "city": "Douala",
            "country_code": "CM",
            "langue": "fr",
            "school_name": "Auto École Vitrine",
            "school_address": "10 Boulevard du Port",
            "mint_registration": "MINT-PROFILE-1",
            "rccm": "RC/DLA/2024/B/123",
            "legal_name": "Auto École Vitrine SARL",
            "description": "École familiale depuis 2010.",
            "website": "https://auto-ecole-vitrine.cm",
            "manager_role": "Directrice",
            "instructor_count": 4,
            "vehicle_count": 6,
            "years_operating": 12,
        },
    )
    assert register.status_code == 200

    pending = client.get("/api/v1/admin/auto-ecoles/pending", headers=admin_headers).json()
    school = next(item for item in pending if item["gerant_email"] == "profile@test.cm")
    assert school["raison_sociale_legale"] == "Auto École Vitrine SARL"
    assert school["rccm"] == "RC/DLA/2024/B/123"
    assert school["site_web"] == "https://auto-ecole-vitrine.cm"
    assert school["description"] == "École familiale depuis 2010."
    assert school["nombre_moniteurs"] == 4
    assert school["nombre_vehicules"] == 6
    assert school["annees_experience"] == 12
    assert school["fonction_gerant"] == "Directrice"


def test_admin_delete_candidat_with_dossier(client, admin_headers):
    register = client.post(
        "/api/v1/auth/register/candidat",
        json={
            "email": "delete-me@test.cm",
            "password": "Password123!",
            "full_name": "To Delete",
            "country_code": "CM",
        },
    )
    assert register.status_code == 200

    users = client.get("/api/v1/admin/users", headers=admin_headers).json()
    user = next(item for item in users if item["email"] == "delete-me@test.cm")

    delete = client.delete(f"/api/v1/admin/users/{user['id']}", headers=admin_headers)
    assert delete.status_code == 204

    users_after = client.get("/api/v1/admin/users", headers=admin_headers).json()
    assert not any(item["id"] == user["id"] for item in users_after)


def test_google_auth_mocked(client, monkeypatch):
    def fake_verify(_token: str):
        return {
            "email": "google.user@gmail.com",
            "sub": "google-sub-123",
            "picture": "https://example.com/avatar.jpg",
            "given_name": "Google",
            "family_name": "User",
        }

    monkeypatch.setattr("app.services.users.verify_google_token", fake_verify)

    response = client.post("/api/v1/auth/google", json={"id_token": "fake-token"})
    assert response.status_code == 200

    me = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {response.json()['access_token']}"},
    )
    body = me.json()
    assert body["email"] == "google.user@gmail.com"
    assert body["avatar_url"] == "https://example.com/avatar.jpg"

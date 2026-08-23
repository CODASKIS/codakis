def test_profile_update_and_consort(client):
    register = client.post(
        "/api/v1/auth/register/candidat",
        json={
            "email": "consort@test.cm",
            "password": "Password123!",
            "full_name": "Jean Candidat",
            "phone": "+237633333333",
            "city": "Yaoundé",
            "country_code": "CM",
        },
    )
    assert register.status_code == 200
    token = register.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me = client.get("/api/v1/users/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["city"] == "Yaoundé"

    patch = client.patch(
        "/api/v1/users/me",
        headers=headers,
        json={"phone": "+237644444444", "city": "Douala"},
    )
    assert patch.status_code == 200
    assert patch.json()["phone"] == "+237644444444"
    assert patch.json()["city"] == "Douala"

    dossier = client.get("/api/v1/candidat/consort", headers=headers)
    assert dossier.status_code == 200
    body = dossier.json()
    assert body["total_count"] == 6
    assert body["validated_count"] == 0
    assert len(body["pieces"]) == 6
    assert all(piece["status"] == "missing" for piece in body["pieces"])

    submit = client.post("/api/v1/candidat/consort/pieces/id/submit", headers=headers)
    assert submit.status_code == 200
    id_piece = next(item for item in submit.json()["pieces"] if item["key"] == "id")
    assert id_piece["status"] == "pending"
    assert submit.json()["validated_count"] == 0

    submit_again = client.post("/api/v1/candidat/consort/pieces/id/submit", headers=headers)
    assert submit_again.status_code == 200
    id_piece = next(item for item in submit_again.json()["pieces"] if item["key"] == "id")
    assert id_piece["status"] == "pending"

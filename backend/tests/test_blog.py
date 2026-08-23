import io


def test_public_blog_list(client):
    response = client.get("/api/v1/public/blog")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_admin_blog_crud(client, admin_headers):
    create = client.post(
        "/api/v1/admin/blog",
        json={
            "title": "Article test",
            "slug": "article-test",
            "excerpt": "Résumé",
            "body": "## Contenu\n\nTexte.",
            "status": "draft",
        },
        headers=admin_headers,
    )
    assert create.status_code == 201
    article_id = create.json()["id"]

    listing = client.get("/api/v1/admin/blog", headers=admin_headers)
    assert listing.status_code == 200
    assert any(item["id"] == article_id for item in listing.json())

    update = client.patch(
        f"/api/v1/admin/blog/{article_id}",
        json={"status": "published"},
        headers=admin_headers,
    )
    assert update.status_code == 200
    assert update.json()["status"] == "published"

    public = client.get("/api/v1/public/blog/article-test")
    assert public.status_code == 200
    assert public.json()["title"] == "Article test"

    delete = client.delete(f"/api/v1/admin/blog/{article_id}", headers=admin_headers)
    assert delete.status_code == 204


def test_admin_media_upload(client, admin_headers, monkeypatch, tmp_path):
    monkeypatch.setenv("CMS_UPLOAD_DIR", str(tmp_path))
    settings = __import__("app.core.config", fromlist=["settings"]).settings
    settings.cms_upload_dir = str(tmp_path)

    png_bytes = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
        b"\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    response = client.post(
        "/api/v1/admin/media",
        files={"file": ("cover.png", io.BytesIO(png_bytes), "image/png")},
        headers=admin_headers,
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["key"].startswith("blog/")
    media = client.get(payload["url"])
    assert media.status_code == 200

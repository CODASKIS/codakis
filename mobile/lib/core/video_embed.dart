/// Convertit un lien YouTube/Vimeo en URL embarquable (aligné sur le site web).
String? toVideoEmbedUrl(String url) {
  final value = url.trim();
  if (value.isEmpty) return null;

  final youtube = RegExp(
    r'(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([\w-]{11})',
  ).firstMatch(value);
  if (youtube != null) {
    return 'https://www.youtube.com/embed/${youtube.group(1)}';
  }

  final vimeo = RegExp(r'vimeo\.com/(?:video/)?(\d+)').firstMatch(value);
  if (vimeo != null) {
    return 'https://player.vimeo.com/video/${vimeo.group(1)}';
  }

  if (value.contains('youtube.com/embed/') || value.contains('player.vimeo.com/video/')) {
    return value;
  }

  return null;
}

String buildVideoIframeHtml(String embedUrl, {String title = 'CODAKIS video'}) {
  final safeUrl = embedUrl.replaceAll('"', '&quot;');
  final safeTitle = title.replaceAll('"', '&quot;');
  return '''
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: #0b1220; }
    .wrap {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }
    iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <iframe
      src="$safeUrl"
      title="$safeTitle"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </div>
</body>
</html>
''';
}

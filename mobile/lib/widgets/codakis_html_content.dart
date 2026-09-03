import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config/api_config.dart';
import '../core/app_theme.dart';
import '../core/video_embed.dart';
import 'codakis_video_iframe.dart';

/// Contenu leçon HTML — aligné sur `.fj-prose.fj-wysiwyg.codakis-player-body`.
class CodakisHtmlContent extends StatelessWidget {
  const CodakisHtmlContent({super.key, required this.html});

  final String html;

  String _resolveMediaUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/')) return '${ApiConfig.baseUrl}$url';
    return '${ApiConfig.baseUrl}/$url';
  }

  String _resolveVideoUrl(String? url) {
    final resolved = _resolveMediaUrl(url);
    if (resolved.isEmpty) return resolved;
    return toVideoEmbedUrl(resolved) ?? resolved;
  }

  @override
  Widget build(BuildContext context) {
    if (html.trim().isEmpty) return const SizedBox.shrink();

    return Html(
      data: html,
      onLinkTap: (url, _, __) {
        if (url == null) return;
        launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
      },
      extensions: [
        TagExtension(
          tagsToExtend: {'img'},
          builder: (extensionContext) {
            final src = extensionContext.attributes['src'];
            if (src == null || src.isEmpty) return const SizedBox.shrink();
            return ClipRRect(
              borderRadius: BorderRadius.circular(CodakisRadii.field),
              child: Image.network(
                _resolveMediaUrl(src),
                fit: BoxFit.cover,
                width: double.infinity,
                errorBuilder: (_, __, ___) => Container(
                  height: 160,
                  alignment: Alignment.center,
                  color: CodakisColors.surfaceAlt,
                  child: const Icon(Icons.broken_image_outlined, color: CodakisColors.textMuted),
                ),
              ),
            );
          },
        ),
        TagExtension(
          tagsToExtend: {'iframe'},
          builder: (extensionContext) {
            final src = extensionContext.attributes['src'];
            if (src == null || src.isEmpty) return const SizedBox.shrink();
            return CodakisVideoIframe(src: _resolveVideoUrl(src));
          },
        ),
      ],
      style: {
        'body': Style(margin: Margins.zero, padding: HtmlPaddings.zero),
        'p': Style(
          fontFamily: GoogleFonts.nunito().fontFamily,
          fontSize: FontSize(15),
          lineHeight: LineHeight(1.65),
          color: CodakisColors.textPrimary,
          margin: Margins.only(bottom: 12),
        ),
        'h1': Style(
          fontFamily: GoogleFonts.nunito().fontFamily,
          fontSize: FontSize(22),
          fontWeight: FontWeight.w800,
          color: CodakisColors.textPrimary,
          margin: Margins.only(top: 8, bottom: 12),
        ),
        'h2': Style(
          fontFamily: GoogleFonts.nunito().fontFamily,
          fontSize: FontSize(18),
          fontWeight: FontWeight.w700,
          color: CodakisColors.primary,
          margin: Margins.only(top: 20, bottom: 10),
        ),
        'h3': Style(
          fontFamily: GoogleFonts.nunito().fontFamily,
          fontSize: FontSize(16),
          fontWeight: FontWeight.w700,
          margin: Margins.only(top: 16, bottom: 8),
        ),
        'ul': Style(margin: Margins.only(bottom: 12, left: 16)),
        'ol': Style(margin: Margins.only(bottom: 12, left: 16)),
        'li': Style(
          fontFamily: GoogleFonts.nunito().fontFamily,
          fontSize: FontSize(15),
          lineHeight: LineHeight(1.55),
          margin: Margins.only(bottom: 6),
        ),
        'a': Style(
          color: CodakisColors.primary,
          textDecoration: TextDecoration.underline,
          fontWeight: FontWeight.w600,
        ),
        'strong': Style(fontWeight: FontWeight.w700),
        'blockquote': Style(
          backgroundColor: CodakisColors.surfaceAlt,
          border: Border(left: BorderSide(color: CodakisColors.primary, width: 4)),
          padding: HtmlPaddings.symmetric(horizontal: 14, vertical: 12),
          margin: Margins.symmetric(vertical: 12),
        ),
        'img': Style(margin: Margins.symmetric(vertical: 12)),
      },
    );
  }
}

import 'dart:ui_web' as ui_web;

import 'package:flutter/material.dart';
import 'package:web/web.dart' as web;

import '../core/app_theme.dart';
import '../core/video_embed.dart';

/// Lecteur vidéo iframe natif (Flutter Web).
class CodakisVideoIframe extends StatefulWidget {
  const CodakisVideoIframe({
    super.key,
    required this.src,
    this.aspectRatio = 16 / 9,
    this.title = 'CODAKIS video',
  });

  final String src;
  final double aspectRatio;
  final String title;

  @override
  State<CodakisVideoIframe> createState() => _CodakisVideoIframeState();
}

class _CodakisVideoIframeState extends State<CodakisVideoIframe> {
  late final String _viewType;
  late final String _embedUrl;

  @override
  void initState() {
    super.initState();
    _embedUrl = toVideoEmbedUrl(widget.src) ?? widget.src;
    _viewType = 'codakis-iframe-${_embedUrl.hashCode}-${DateTime.now().microsecondsSinceEpoch}';
    ui_web.platformViewRegistry.registerViewFactory(_viewType, (int viewId) {
      final iframe = web.HTMLIFrameElement()
        ..src = _embedUrl
        ..title = widget.title
        ..style.border = 'none'
        ..style.width = '100%'
        ..style.height = '100%'
        ..allowFullscreen = true
        ..setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        );
      return iframe;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.black,
          borderRadius: BorderRadius.circular(CodakisRadii.field),
          border: Border.all(color: const Color(0xFFE5E7EB)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(CodakisRadii.field),
          child: AspectRatio(
            aspectRatio: widget.aspectRatio,
            child: HtmlElementView(viewType: _viewType),
          ),
        ),
      ),
    );
  }
}

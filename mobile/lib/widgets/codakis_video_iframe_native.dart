import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import '../core/app_theme.dart';
import '../core/video_embed.dart';

/// Lecteur vidéo embarqué via WebView (mobile / desktop).
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
  WebViewController? _controller;
  late final String _embedUrl;

  @override
  void initState() {
    super.initState();
    _embedUrl = toVideoEmbedUrl(widget.src) ?? widget.src;
    _initController();
  }

  Future<void> _initController() async {
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.black)
      ..loadHtmlString(
        buildVideoIframeHtml(_embedUrl, title: widget.title),
        baseUrl: 'https://codakis.cm',
      );

    if (controller.platform is AndroidWebViewController) {
      await (controller.platform as AndroidWebViewController).setMediaPlaybackRequiresUserGesture(false);
    }

    if (!mounted) return;
    setState(() => _controller = controller);
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller;

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
            child: controller == null
                ? const Center(child: CircularProgressIndicator(color: Colors.white54))
                : WebViewWidget(controller: controller),
          ),
        ),
      ),
    );
  }
}

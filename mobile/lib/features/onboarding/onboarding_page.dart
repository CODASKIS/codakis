import 'package:flutter/material.dart';

import '../../core/app_theme.dart';
import '../../widgets/codakis_locale_switcher.dart';
import '../../widgets/codakis_logo.dart';
import '../../widgets/codakis_primary_button.dart';
import 'onboarding_slide.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key, required this.onFinished});

  final VoidCallback onFinished;

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _controller = PageController();
  int _index = 0;
  String _locale = 'fr';

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _next() {
    if (_index >= onboardingSlides.length - 1) {
      widget.onFinished();
      return;
    }
    _controller.nextPage(
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLast = _index == onboardingSlides.length - 1;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
              child: Row(
                children: [
                  TextButton(onPressed: widget.onFinished, child: const Text('Passer')),
                  const Spacer(),
                  CodakisLocaleSwitcher(
                    locale: _locale,
                    onChanged: (value) => setState(() => _locale = value),
                  ),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: onboardingSlides.length,
                onPageChanged: (value) => setState(() => _index = value),
                itemBuilder: (context, index) => _SlideView(slide: onboardingSlides[index]),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
              child: Row(
                children: [
                  _PageDots(count: onboardingSlides.length, index: _index),
                  const Spacer(),
                  CodakisPrimaryButton(
                    label: isLast ? 'Commencer' : 'Suivant',
                    icon: Icons.arrow_forward,
                    pill: true,
                    onPressed: _next,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SlideView extends StatelessWidget {
  const _SlideView({required this.slide});

  final OnboardingSlide slide;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Expanded(
            flex: 5,
            child: Center(
              child: slide.useLogoHero
                  ? const CodakisLogo(height: 72)
                  : _IllustrationCard(asset: slide.heroAsset!),
            ),
          ),
          Expanded(
            flex: 4,
            child: Column(
              children: [
                Text(
                  slide.title,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 16),
                Text(
                  slide.description,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _IllustrationCard extends StatelessWidget {
  const _IllustrationCard({required this.asset});

  final String asset;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(maxWidth: 340, maxHeight: 340),
      decoration: BoxDecoration(
        color: CodakisColors.surfaceAlt,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: CodakisColors.border.withValues(alpha: 0.35)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Image.asset(asset, fit: BoxFit.cover),
    );
  }
}

class _PageDots extends StatelessWidget {
  const _PageDots({required this.count, required this.index});

  final int count;
  final int index;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(count, (i) {
        final active = i == index;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: EdgeInsets.only(right: i == count - 1 ? 0 : 8),
          width: active ? 10 : 8,
          height: active ? 10 : 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: active ? CodakisColors.primary : CodakisColors.dotInactive,
          ),
        );
      }),
    );
  }
}

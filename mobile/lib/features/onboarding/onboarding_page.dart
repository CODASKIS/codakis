import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../core/app_theme.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_defaults.dart';
import '../../core/constants/app_icons.dart';
import '../../core/locale_scope.dart';
import '../../l10n/app_strings.dart';
import '../../widgets/codakis_language_picker.dart';
import '../../widgets/codakis_logo.dart';
import '../../widgets/codakis_primary_button.dart';

class OnboardingSlide {
  const OnboardingSlide({
    required this.title,
    required this.description,
    this.heroAsset,
    this.useLogoHero = false,
  });

  final String title;
  final String description;
  final String? heroAsset;
  final bool useLogoHero;
}

List<OnboardingSlide> onboardingSlidesFor(AppStrings s) => [
      OnboardingSlide(
        title: s.onboardingSlide1Title,
        description: s.onboardingSlide1Desc,
        useLogoHero: true,
      ),
      OnboardingSlide(
        title: s.onboardingSlide2Title,
        description: s.onboardingSlide2Desc,
        heroAsset: 'assets/onboarding/illustration_step_2.png',
      ),
      OnboardingSlide(
        title: s.onboardingSlide3Title,
        description: s.onboardingSlide3Desc,
        heroAsset: 'assets/onboarding/illustration_step_3.png',
      ),
    ];

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key, required this.onFinished});

  final VoidCallback onFinished;

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _controller = PageController();
  int _index = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _finishWithLanguage() async {
    final s = LocaleScope.stringsOf(context);
    final localeService = LocaleScope.serviceOf(context);
    await CodakisLanguagePickerSheet.show(
      context,
      options: codakisLanguageOptions(s),
      initialCode: localeService.locale,
      onSaved: localeService.setLocale,
    );
    if (!mounted) return;
    widget.onFinished();
  }

  void _next(int lastIndex) {
    if (_index >= lastIndex) {
      _finishWithLanguage();
      return;
    }
    _controller.nextPage(duration: AppDefaults.duration, curve: Curves.ease);
  }

  @override
  Widget build(BuildContext context) {
    final s = LocaleScope.stringsOf(context);
    final slides = onboardingSlidesFor(s);
    final isLast = _index == slides.length - 1;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: TextButton(onPressed: _finishWithLanguage, child: Text(s.onboardingSkip)),
            ),
            const Spacer(),
            Expanded(
              flex: 8,
              child: PageView.builder(
                controller: _controller,
                itemCount: slides.length,
                onPageChanged: (v) => setState(() => _index = v),
                itemBuilder: (context, index) => _OnboardView(slide: slides[index]),
              ),
            ),
            const Spacer(),
            Stack(
              alignment: Alignment.center,
              children: [
                TweenAnimationBuilder<double>(
                  duration: AppDefaults.duration,
                  tween: Tween<double>(
                    begin: 0,
                    end: (1 / slides.length) * (_index + 1),
                  ),
                  curve: Curves.easeInOutBack,
                  builder: (context, value, _) => SizedBox(
                    height: 70,
                    width: 70,
                    child: CircularProgressIndicator(
                      value: value,
                      strokeWidth: 6,
                      backgroundColor: AppColors.cardColor,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                Material(
                  color: AppColors.primary,
                  shape: const CircleBorder(),
                  elevation: 2,
                  child: InkWell(
                    customBorder: const CircleBorder(),
                    onTap: () => _next(slides.length - 1),
                    child: SizedBox(
                      width: 56,
                      height: 56,
                      child: Center(
                        child: SvgPicture.asset(
                          AppIcons.arrowForward,
                          colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppDefaults.padding),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppDefaults.padding),
              child: CodakisPrimaryButton(
                label: isLast ? s.onboardingStart : s.onboardingNext,
                expand: true,
                variant: CodakisButtonVariant.site,
                size: CodakisButtonSize.lg,
                onPressed: () => _next(slides.length - 1),
              ),
            ),
            const SizedBox(height: AppDefaults.padding),
          ],
        ),
      ),
    );
  }
}

class _OnboardView extends StatelessWidget {
  const _OnboardView({required this.slide});

  final OnboardingSlide slide;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: MediaQuery.of(context).size.width,
          height: MediaQuery.of(context).size.width * 0.75,
          child: Padding(
            padding: const EdgeInsets.all(AppDefaults.padding * 2),
            child: slide.useLogoHero
                ? Center(child: CodakisLogo(height: MediaQuery.sizeOf(context).width * 0.35))
                : Image.asset(slide.heroAsset!, fit: BoxFit.contain),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(AppDefaults.padding),
          child: Column(
            children: [
              Text(
                slide.title,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              Padding(
                padding: const EdgeInsets.all(AppDefaults.padding),
                child: Text(slide.description, textAlign: TextAlign.center),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

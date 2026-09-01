import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/api_client.dart';
import 'core/app_theme.dart';
import 'core/locale_scope.dart';
import 'core/locale_service.dart';
import 'features/auth/auth_service.dart';
import 'features/auth/login_page.dart';
import 'features/home/main_shell.dart';
import 'features/onboarding/onboarding_page.dart';
import 'core/webview_bootstrap.dart';
import 'features/onboarding/onboarding_service.dart';
import 'widgets/codakis_logo_loader.dart';

void main() {
  bootstrapWebView();
  runApp(const CodakisApp());
}

class CodakisApp extends StatefulWidget {
  const CodakisApp({super.key});

  @override
  State<CodakisApp> createState() => _CodakisAppState();
}

enum _AppGate { loading, onboarding, login, home }

class _CodakisAppState extends State<CodakisApp> {
  late final ApiClient _apiClient;
  late final AuthService _authService;
  late final OnboardingService _onboardingService;
  late final LocaleService _localeService;
  _AppGate _gate = _AppGate.loading;

  @override
  void initState() {
    super.initState();
    _apiClient = ApiClient();
    _authService = AuthService(_apiClient);
    _onboardingService = OnboardingService();
    _localeService = LocaleService();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    await _localeService.load();
    final onboardingDone = await _onboardingService.isCompleted();
    final session = await _authService.restoreSession();
    if (!mounted) return;
    setState(() {
      if (!onboardingDone) {
        _gate = _AppGate.onboarding;
      } else if (session != null) {
        _gate = _AppGate.home;
      } else {
        _gate = _AppGate.login;
      }
    });
  }

  Future<void> _finishOnboarding() async {
    await _onboardingService.complete();
    if (!mounted) return;
    setState(() => _gate = _AppGate.login);
  }

  @override
  Widget build(BuildContext context) {
    return LocaleScope(
      localeService: _localeService,
      child: ListenableBuilder(
        listenable: _localeService,
        builder: (context, _) {
          return MaterialApp(
            title: 'CODAKIS',
            debugShowCheckedModeBanner: false,
            locale: Locale(_localeService.locale),
            supportedLocales: const [Locale('fr'), Locale('en')],
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            theme: buildCodakisTheme(),
            home: switch (_gate) {
              _AppGate.loading => const Scaffold(
                  body: Center(child: CodakisLogoLoader()),
                ),
              _AppGate.onboarding => OnboardingPage(onFinished: _finishOnboarding),
              _AppGate.login => LoginPage(authService: _authService),
              _AppGate.home => MainShell(authService: _authService),
            },
          );
        },
      ),
    );
  }
}

import 'package:flutter/material.dart';

import 'core/api_client.dart';
import 'core/app_theme.dart';
import 'features/auth/auth_service.dart';
import 'features/auth/login_page.dart';
import 'features/home/home_page.dart';
import 'features/onboarding/onboarding_page.dart';
import 'features/onboarding/onboarding_service.dart';

void main() {
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
  _AppGate _gate = _AppGate.loading;

  @override
  void initState() {
    super.initState();
    _apiClient = ApiClient();
    _authService = AuthService(_apiClient);
    _onboardingService = OnboardingService();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
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
    return MaterialApp(
      title: 'CODAKIS',
      debugShowCheckedModeBanner: false,
      theme: buildCodakisTheme(),
      home: switch (_gate) {
        _AppGate.loading => const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          ),
        _AppGate.onboarding => OnboardingPage(onFinished: _finishOnboarding),
        _AppGate.login => LoginPage(authService: _authService),
        _AppGate.home => HomePage(authService: _authService),
      },
    );
  }
}

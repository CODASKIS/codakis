import 'package:flutter/material.dart';

import 'core/api_client.dart';
import 'features/auth/auth_service.dart';
import 'features/auth/login_page.dart';
import 'features/home/home_page.dart';

void main() {
  runApp(const CodakisApp());
}

class CodakisApp extends StatefulWidget {
  const CodakisApp({super.key});

  @override
  State<CodakisApp> createState() => _CodakisAppState();
}

class _CodakisAppState extends State<CodakisApp> {
  late final ApiClient _apiClient;
  late final AuthService _authService;
  bool _bootstrapping = true;
  bool _hasSession = false;

  @override
  void initState() {
    super.initState();
    _apiClient = ApiClient();
    _authService = AuthService(_apiClient);
    _restore();
  }

  Future<void> _restore() async {
    final session = await _authService.restoreSession();
    if (!mounted) return;
    setState(() {
      _hasSession = session != null;
      _bootstrapping = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CODAKIS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0B6E4F)),
        useMaterial3: true,
      ),
      home: _bootstrapping
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : _hasSession
              ? HomePage(authService: _authService)
              : LoginPage(authService: _authService),
    );
  }
}

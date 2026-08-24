import 'package:shared_preferences/shared_preferences.dart';

import '../../core/api_client.dart';

class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
  });

  final String accessToken;
  final String refreshToken;
}

class AuthService {
  AuthService(this._api);

  static const _accessTokenKey = 'codakis_access_token';
  static const _refreshTokenKey = 'codakis_refresh_token';

  final ApiClient _api;

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final data = await _api.post(
      '/auth/login',
      body: {'email': email.trim().toLowerCase(), 'password': password},
    );
    final session = AuthSession(
      accessToken: data['access_token'] as String,
      refreshToken: data['refresh_token'] as String,
    );
    await _persist(session);
    _api.setAccessToken(session.accessToken);
    return session;
  }

  Future<AuthSession?> restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final access = prefs.getString(_accessTokenKey);
    final refresh = prefs.getString(_refreshTokenKey);
    if (access == null || refresh == null) {
      return null;
    }
    final session = AuthSession(accessToken: access, refreshToken: refresh);
    _api.setAccessToken(session.accessToken);
    return session;
  }

  Future<void> logout() async {
    _api.setAccessToken(null);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_accessTokenKey);
    await prefs.remove(_refreshTokenKey);
  }

  Future<AuthSession> registerCandidat({
    required String email,
    required String password,
    required String fullName,
    String? phone,
    String countryCode = 'CM',
    String langue = 'fr',
  }) async {
    final data = await _api.post(
      '/auth/register/candidat',
      body: {
        'email': email.trim().toLowerCase(),
        'password': password,
        'full_name': fullName.trim(),
        if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
        'country_code': countryCode,
        'langue': langue,
      },
    );
    final session = AuthSession(
      accessToken: data['access_token'] as String,
      refreshToken: data['refresh_token'] as String,
    );
    await _persist(session);
    _api.setAccessToken(session.accessToken);
    return session;
  }

  Future<String> forgotPassword(String email) async {
    final data = await _api.post(
      '/auth/forgot-password',
      body: {'email': email.trim().toLowerCase()},
    );
    return data['message'] as String? ?? 'Code envoyé si le compte existe.';
  }

  Future<String> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    final data = await _api.post(
      '/auth/reset-password',
      body: {
        'email': email.trim().toLowerCase(),
        'otp': otp.trim(),
        'new_password': newPassword,
      },
    );
    return data['message'] as String? ?? 'Mot de passe mis à jour.';
  }

  ApiClient get api => _api;

  Future<void> _persist(AuthSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessTokenKey, session.accessToken);
    await prefs.setString(_refreshTokenKey, session.refreshToken);
  }
}

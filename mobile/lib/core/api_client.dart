import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({http.Client? client}) : _client = client ?? http.Client();

  static const _timeout = Duration(seconds: 20);

  final http.Client _client;
  String? _accessToken;

  void setAccessToken(String? token) {
    _accessToken = token;
  }

  Uri _uri(String path) {
    final normalized = path.startsWith('/') ? path : '/$path';
    return Uri.parse('${ApiConfig.apiV1}$normalized');
  }

  Map<String, String> _headers({bool auth = false}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (auth && _accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    return headers;
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
    bool auth = false,
  }) async {
    try {
      final response = await _client
          .post(
            _uri(path),
            headers: _headers(auth: auth),
            body: jsonEncode(body ?? {}),
          )
          .timeout(_timeout);
      return _decode(response);
    } on TimeoutException {
      throw ApiException(_connectionErrorMessage());
    } on http.ClientException {
      throw ApiException(_connectionErrorMessage());
    }
  }

  Future<List<dynamic>> getList(String path, {bool auth = false}) async {
    try {
      final response = await _client
          .get(
            _uri(path),
            headers: _headers(auth: auth),
          )
          .timeout(_timeout);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        if (response.body.isEmpty) return [];
        final decoded = jsonDecode(response.body);
        if (decoded is List) return decoded;
        return [];
      }
      Map<String, dynamic>? payload;
      if (response.body.isNotEmpty) {
        final decoded = jsonDecode(response.body);
        if (decoded is Map<String, dynamic>) payload = decoded;
      }
      final detail = payload?['detail'];
      final message = detail is String ? detail : 'Erreur API (${response.statusCode})';
      throw ApiException(message, statusCode: response.statusCode);
    } on TimeoutException {
      throw ApiException(_connectionErrorMessage());
    } on http.ClientException {
      throw ApiException(_connectionErrorMessage());
    }
  }

  Future<Map<String, dynamic>> get(String path, {bool auth = false}) async {
    try {
      final response = await _client
          .get(
            _uri(path),
            headers: _headers(auth: auth),
          )
          .timeout(_timeout);
      return _decode(response);
    } on TimeoutException {
      throw ApiException(_connectionErrorMessage());
    } on http.ClientException {
      throw ApiException(_connectionErrorMessage());
    }
  }

  Future<Map<String, dynamic>> patch(
    String path, {
    Map<String, dynamic>? body,
    bool auth = false,
  }) async {
    try {
      final response = await _client
          .patch(
            _uri(path),
            headers: _headers(auth: auth),
            body: jsonEncode(body ?? {}),
          )
          .timeout(_timeout);
      return _decode(response);
    } on TimeoutException {
      throw ApiException(_connectionErrorMessage());
    } on http.ClientException {
      throw ApiException(_connectionErrorMessage());
    }
  }

  String _connectionErrorMessage() {
    return 'Impossible de joindre le backend (${ApiConfig.baseUrl}). '
        'Vérifiez que l\'API tourne sur le port 8000.';
  }

  Map<String, dynamic> _decode(http.Response response) {
    Map<String, dynamic>? payload;
    if (response.body.isNotEmpty) {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        payload = decoded;
      }
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return payload ?? {};
    }

    final detail = payload?['detail'];
    final message = detail is String
        ? detail
        : 'Erreur API (${response.statusCode})';
    throw ApiException(message, statusCode: response.statusCode);
  }
}

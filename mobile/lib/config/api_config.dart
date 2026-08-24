/// Backend API base URL.
///
/// Override at build/run time:
/// `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000`
///
/// - Android emulator: `http://10.0.2.2:8000`
/// - iOS simulator / desktop: `http://localhost:8000`
/// - Physical device: your machine LAN IP, e.g. `http://192.168.1.42:8000`
class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );

  static String get apiV1 => '$baseUrl/api/v1';
}
